# Generated by Django 5.0.6 on 2024-06-20 07:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="transactionproduct",
            name="redeem_card_number",
            field=models.CharField(blank=True, default=None, max_length=250, null=True),
        ),
        migrations.AddField(
            model_name="transactionproduct",
            name="redeem_card_pin",
            field=models.CharField(blank=True, default=None, max_length=250, null=True),
        ),
    ]