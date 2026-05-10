import logging
import os
import time
from decimal import Decimal

from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from dotenv import load_dotenv

from .models import ListenerCursor, Order, ProcessedTransfer
from .tokens import get_enabled_payment_tokens, token_units_to_decimal
from .wallet import get_required_env, validate_payment_environment
from .fulfillment import complete_order, get_platform_config

load_dotenv()

logger = logging.getLogger(__name__)

TRANSFER_EVENT_ABI = {
    "anonymous": False,
    "inputs": [
        {"indexed": True, "name": "from", "type": "address"},
        {"indexed": True, "name": "to", "type": "address"},
        {"indexed": False, "name": "value", "type": "uint256"},
    ],
    "name": "Transfer",
    "type": "event",
}

REQUIRED_CONFIRMATIONS = 3
DEFAULT_BLOCK_CHUNK_SIZE = 2_000
DEFAULT_START_BLOCK_LOOKBACK = 1_000
DEFAULT_ORDER_SYNC_BLOCK_LOOKBACK = 1_500


def get_web3():
    validate_payment_environment()

    try:
        from web3 import Web3
    except ImportError as exc:
        raise ImproperlyConfigured(
            "Missing dependency: web3. Install backend requirements."
        ) from exc

    infura_url = get_required_env("INFURA_URL")
    web3 = Web3(Web3.HTTPProvider(infura_url))
    if not web3.is_connected():
        raise ImproperlyConfigured("Unable to connect to Ethereum RPC provider")

    return web3


def get_token_contract(web3, payment_token):
    if not web3.is_address(payment_token.contract_address):
        raise ImproperlyConfigured(
            f"{payment_token.symbol}_CONTRACT_ADDRESS is not a valid address"
        )

    checksum_address = web3.to_checksum_address(payment_token.contract_address)
    return web3.eth.contract(address=checksum_address, abi=[TRANSFER_EVENT_ABI])


def get_start_block(web3):
    start_block = os.getenv("ERC20_LISTENER_START_BLOCK") or os.getenv(
        "USDC_LISTENER_START_BLOCK"
    )
    if start_block:
        try:
            return int(start_block)
        except ValueError as exc:
            raise ImproperlyConfigured(
                "ERC20_LISTENER_START_BLOCK must be an integer"
            ) from exc

    try:
        lookback = int(os.getenv("ERC20_LISTENER_START_BLOCK_LOOKBACK", DEFAULT_START_BLOCK_LOOKBACK))
    except ValueError as exc:
        raise ImproperlyConfigured(
            "ERC20_LISTENER_START_BLOCK_LOOKBACK must be an integer"
        ) from exc

    return max(web3.eth.block_number - max(lookback, 0), 0)


class StablecoinTransferListener:
    cursor_prefix = "erc20_stablecoin_transfer_listener"

    def __init__(self, confirmations=REQUIRED_CONFIRMATIONS):
        self.web3 = get_web3()
        self.payment_tokens = get_enabled_payment_tokens()
        self.confirmations = confirmations
        try:
            self.block_chunk_size = int(
                os.getenv("ERC20_LISTENER_BLOCK_CHUNK_SIZE")
                or os.getenv("USDC_LISTENER_BLOCK_CHUNK_SIZE", DEFAULT_BLOCK_CHUNK_SIZE)
            )
        except ValueError as exc:
            raise ImproperlyConfigured(
                "ERC20_LISTENER_BLOCK_CHUNK_SIZE must be an integer"
            ) from exc

        if self.block_chunk_size <= 0:
            raise ImproperlyConfigured(
                "ERC20_LISTENER_BLOCK_CHUNK_SIZE must be greater than zero"
            )

        self.contracts = {
            token.symbol: get_token_contract(self.web3, token)
            for token in self.payment_tokens
        }

    def get_order_sync_lookback(self):
        try:
            lookback = int(
                os.getenv(
                    "ERC20_ORDER_STATUS_LOOKBACK",
                    DEFAULT_ORDER_SYNC_BLOCK_LOOKBACK,
                )
            )
        except ValueError as exc:
            raise ImproperlyConfigured(
                "ERC20_ORDER_STATUS_LOOKBACK must be an integer"
            ) from exc

        return max(lookback, 0)

    def scan_once(self):
        processed = 0
        current_block = self.web3.eth.block_number

        for payment_token in self.payment_tokens:
            processed += self.scan_token(payment_token, current_block)

        self.confirm_pending_transfers(current_block)
        return processed

    def scan_order(self, order):
        payment_token = next(
            (token for token in self.payment_tokens if token.symbol == order.token_symbol),
            None,
        )
        if not payment_token:
            return 0

        current_block = self.web3.eth.block_number
        start_block = max(current_block - self.get_order_sync_lookback(), 0)
        checksum_address = self.web3.to_checksum_address(order.wallet_address)
        contract = self.contracts[payment_token.symbol]
        processed = 0
        from_block = start_block

        while from_block <= current_block:
            to_block = min(from_block + self.block_chunk_size - 1, current_block)
            logs = contract.events.Transfer().get_logs(
                fromBlock=from_block,
                toBlock=to_block,
            )

            for event in logs:
                if self.web3.to_checksum_address(event["args"]["to"]) != checksum_address:
                    continue
                if self.process_transfer_event(event, payment_token, current_block):
                    processed += 1

            from_block = to_block + 1

        with transaction.atomic():
            refreshed_order = Order.objects.select_for_update().get(pk=order.pk)
            self.update_order_payment_state(refreshed_order, current_block)

        return processed

    def scan_token(self, payment_token, current_block):
        cursor_name = f"{self.cursor_prefix}_{payment_token.symbol.lower()}"
        cursor, _ = ListenerCursor.objects.get_or_create(
            name=cursor_name,
            defaults={"last_scanned_block": get_start_block(self.web3) - 1},
        )
        from_block = cursor.last_scanned_block + 1

        if from_block > current_block:
            return 0

        to_block = min(from_block + self.block_chunk_size - 1, current_block)
        logs = self.contracts[payment_token.symbol].events.Transfer().get_logs(
            fromBlock=from_block,
            toBlock=to_block,
        )

        processed = 0
        for event in logs:
            if self.process_transfer_event(event, payment_token, current_block):
                processed += 1

        cursor.last_scanned_block = to_block
        cursor.save(update_fields=["last_scanned_block", "updated_at"])

        return processed

    def process_transfer_event(self, event, payment_token, current_block):
        transaction_hash = event["transactionHash"].hex()
        log_index = event["logIndex"]
        to_address = self.web3.to_checksum_address(event["args"]["to"])
        from_address = self.web3.to_checksum_address(event["args"]["from"])
        token_contract_address = self.web3.to_checksum_address(
            payment_token.contract_address
        )
        amount = token_units_to_decimal(event["args"]["value"], payment_token.decimals)
        block_number = event["blockNumber"]
        confirmations = max(current_block - block_number + 1, 0)

        order = self.resolve_order_for_transfer(
            to_address=to_address,
            token_symbol=payment_token.symbol,
            amount=amount,
        )

        if not order:
            return False

        with transaction.atomic():
            processed_transfer, created = ProcessedTransfer.objects.get_or_create(
                transaction_hash=transaction_hash,
                log_index=log_index,
                defaults={
                    "order": order,
                    "token_symbol": payment_token.symbol,
                    "token_contract_address": token_contract_address,
                    "from_address": from_address,
                    "to_address": to_address,
                    "amount": amount,
                    "block_number": block_number,
                    "confirmations": confirmations,
                    "confirmed": False,
                },
            )

            if not created:
                return False

            self.update_order_payment_state(order, current_block)

        return True

    def resolve_order_for_transfer(self, to_address, token_symbol, amount):
        pending_orders = list(
            Order.objects.filter(
                wallet_address__iexact=to_address,
                token_symbol=token_symbol,
                status=Order.Status.PENDING,
            ).order_by("created_at", "id")
        )
        if not pending_orders:
            return None

        exact_matches = [order for order in pending_orders if order.amount == amount]
        if exact_matches:
            return exact_matches[0]

        # Shared-address wallets can receive several pending orders. Prefer the
        # oldest order that can still accept this transfer amount without overfill.
        for order in pending_orders:
            total_seen = (
                ProcessedTransfer.objects.filter(order=order)
                .aggregate(total=Sum("amount"))
                .get("total")
                or Decimal("0")
            )
            remaining = order.amount - total_seen
            if remaining > Decimal("0") and amount <= remaining:
                return order

        return pending_orders[0]

    def confirm_pending_transfers(self, current_block):
        pending_order_ids = (
            ProcessedTransfer.objects.filter(order__status=Order.Status.PENDING)
            .values_list("order_id", flat=True)
            .distinct()
        )

        confirmed_count = 0
        for order_id in pending_order_ids:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=order_id)
                was_paid = order.status == Order.Status.PAID
                self.update_order_payment_state(order, current_block)
                order.refresh_from_db(fields=["status"])
                if not was_paid and order.status == Order.Status.PAID:
                    confirmed_count += 1

        return confirmed_count

    def update_order_payment_state(self, order, current_block):
        transfers = list(
            ProcessedTransfer.objects.filter(order=order).order_by("block_number", "log_index")
        )
        if not transfers:
            return

        confirmed_total = Decimal("0")
        latest_confirmed_transfer = None

        for transfer in transfers:
            confirmations = max(current_block - transfer.block_number + 1, 0)
            confirmed = confirmations >= self.confirmations
            update_fields = []

            if transfer.confirmations != confirmations:
                transfer.confirmations = confirmations
                update_fields.append("confirmations")

            if transfer.confirmed != confirmed:
                transfer.confirmed = confirmed
                update_fields.append("confirmed")

            if update_fields:
                transfer.save(update_fields=[*update_fields, "updated_at"])

            if confirmed:
                confirmed_total += transfer.amount
                latest_confirmed_transfer = transfer

        if (
            order.status == Order.Status.PENDING
            and confirmed_total >= order.amount
            and latest_confirmed_transfer is not None
        ):
            self.mark_order_paid(
                order,
                latest_confirmed_transfer,
                latest_confirmed_transfer.confirmations,
            )

    def mark_order_paid(self, order, transfer, confirmations):
        order.status = Order.Status.PAID
        order.paid_at = timezone.now()
        order.paid_transaction_hash = transfer.transaction_hash
        order.paid_block_number = transfer.block_number
        order.save(
            update_fields=[
                "status",
                "paid_at",
                "paid_transaction_hash",
                "paid_block_number",
            ]
        )

        transfer.confirmations = confirmations
        transfer.confirmed = True
        transfer.order = order
        transfer.save(update_fields=["confirmations", "confirmed", "order", "updated_at"])

        if (
            get_platform_config().order_mode == "auto"
            and order.fulfillment_status == Order.FulfillmentStatus.PENDING
        ):
            try:
                complete_order(order, actor="listener")
            except Exception:
                logger.exception("Automatic fulfillment failed for payment order %s", order.payment_code)

    def listen_forever(self, poll_interval=15):
        while True:
            self.scan_once()
            time.sleep(poll_interval)


USDCTransferListener = StablecoinTransferListener
