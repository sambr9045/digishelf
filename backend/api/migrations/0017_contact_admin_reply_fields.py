from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0016_digishelfdata_order_mode"),
    ]

    operations = [
        migrations.AddField(
            model_name="contact",
            name="read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contact",
            name="reply_message",
            field=models.TextField(blank=True, default=None, null=True),
        ),
        migrations.AddField(
            model_name="contact",
            name="replied_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="contact",
            name="replied_by",
            field=models.EmailField(blank=True, default=None, max_length=254, null=True),
        ),
    ]
