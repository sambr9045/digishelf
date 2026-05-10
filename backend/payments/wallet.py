import os

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

load_dotenv()

REQUIRED_ENV_VARS = ("INFURA_URL",)


def get_required_env(name):
    value = os.getenv(name)
    if not value:
        raise ImproperlyConfigured(f"Missing required environment variable: {name}")
    return value


def validate_payment_environment():
    values = {name: get_required_env(name) for name in REQUIRED_ENV_VARS}

    private_key = os.getenv("WALLET_PRIVATE_KEY")
    mnemonic = os.getenv("MNEMONIC")
    if not private_key and not mnemonic:
        raise ImproperlyConfigured(
            "Missing wallet credentials: set WALLET_PRIVATE_KEY or MNEMONIC"
        )

    values["WALLET_PRIVATE_KEY"] = private_key
    values["MNEMONIC"] = mnemonic
    return values


def generate_address(index):
    if not isinstance(index, int) or index < 0:
        raise ValueError("Wallet index must be a non-negative integer")

    env = validate_payment_environment()
    private_key = (env.get("WALLET_PRIVATE_KEY") or "").strip()
    mnemonic = (env.get("MNEMONIC") or "").strip()

    try:
        from eth_account import Account
    except ImportError as exc:
        raise ImproperlyConfigured(
            "Missing dependency: eth-account. Install backend requirements."
        ) from exc

    if private_key:
        try:
            account = Account.from_key(private_key)
        except Exception as exc:
            raise ImproperlyConfigured(
                "WALLET_PRIVATE_KEY is invalid. Use a 32-byte hex Ethereum private key."
            ) from exc
    else:
        Account.enable_unaudited_hdwallet_features()
        account = Account.from_mnemonic(
            mnemonic,
            account_path=f"m/44'/60'/0'/0/{index}",
        )

    return {
        "address": account.address,
        "private_key": account.key.hex(),
    }
