# Generated by Django 5.0.6 on 2024-06-08 13:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_remove_errorlog_email"),
    ]

    operations = [
        migrations.DeleteModel(
            name="ErrorLog",
        ),
    ]