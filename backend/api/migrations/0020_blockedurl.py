from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0019_adminloginaudit"),
    ]

    operations = [
        migrations.CreateModel(
            name="BlockedUrl",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("url", models.TextField(unique=True)),
                ("reason", models.CharField(blank=True, default="", max_length=500)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
