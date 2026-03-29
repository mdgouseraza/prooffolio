import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create the platform admin user from ADMIN_EMAIL and ADMIN_PASSWORD env vars (idempotent)."

    def handle(self, *args, **options):
        email = os.getenv("ADMIN_EMAIL", "").strip().lower()
        password = os.getenv("ADMIN_PASSWORD", "")
        if not email or not password:
            self.stderr.write("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.")
            return
        if User.objects.filter(email=email, role=User.Role.ADMIN).exists():
            self.stdout.write(self.style.WARNING(f"Admin already exists: {email}"))
            return
        user = User.objects.create(
            username=email,
            email=email,
            first_name="Admin",
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Created admin: {email}"))
