# Generated by Django 5.0.6 on 2024-06-20 07:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_transactionproduct_redeem_card_number_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="transactionproduct",
            name="redeem_card_number",
        ),
        migrations.RemoveField(
            model_name="transactionproduct",
            name="redeem_card_pin",
        ),
    ]