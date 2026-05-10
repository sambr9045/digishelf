import os
from dataclasses import dataclass
from decimal import Decimal

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

load_dotenv()


TOKEN_DECIMALS = Decimal("1000000")
SUPPORTED_TOKEN_SYMBOLS = ("USDC", "USDT")


@dataclass(frozen=True)
class PaymentToken:
    symbol: str
    contract_address: str
    decimals: Decimal = TOKEN_DECIMALS


def normalize_token_symbol(symbol):
    normalized = str(symbol or "USDC").strip().upper()
    if normalized not in SUPPORTED_TOKEN_SYMBOLS:
        raise ImproperlyConfigured(
            f"Unsupported payment token: {symbol}. Supported tokens: USDC, USDT"
        )
    return normalized


def get_token_contract_env_name(symbol):
    return f"{normalize_token_symbol(symbol)}_CONTRACT_ADDRESS"


def get_payment_token(symbol):
    normalized = normalize_token_symbol(symbol)
    env_name = get_token_contract_env_name(normalized)
    contract_address = os.getenv(env_name)
    if not contract_address:
        raise ImproperlyConfigured(f"Missing required environment variable: {env_name}")

    return PaymentToken(symbol=normalized, contract_address=contract_address)


def get_enabled_payment_tokens():
    return [get_payment_token(symbol) for symbol in SUPPORTED_TOKEN_SYMBOLS]


def token_units_to_decimal(value, decimals=TOKEN_DECIMALS):
    return (Decimal(value) / decimals).quantize(Decimal("0.000001"))
