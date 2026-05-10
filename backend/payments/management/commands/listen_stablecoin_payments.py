from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand, CommandError

from payments.listener import StablecoinTransferListener


class Command(BaseCommand):
    help = "Listen for confirmed USDC/USDT ERC20 transfers and mark matching orders paid."

    def add_arguments(self, parser):
        parser.add_argument(
            "--once",
            action="store_true",
            help="Scan one block range and exit.",
        )
        parser.add_argument(
            "--poll-interval",
            type=int,
            default=15,
            help="Seconds to wait between scans when running continuously.",
        )

    def handle(self, *args, **options):
        try:
            listener = StablecoinTransferListener()
        except ImproperlyConfigured as exc:
            raise CommandError(str(exc)) from exc

        if options["once"]:
            processed = listener.scan_once()
            self.stdout.write(self.style.SUCCESS(f"Processed {processed} transfer(s)."))
            return

        self.stdout.write("Starting ERC20 stablecoin payment listener.")
        listener.listen_forever(poll_interval=options["poll_interval"])
