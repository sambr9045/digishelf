from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0015_alter_digishelfdata_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="digishelfdata",
            name="order_mode",
            field=models.CharField(
                choices=[("auto", "Automatic"), ("manual", "Manual")],
                default="auto",
                max_length=20,
            ),
        ),
    ]
