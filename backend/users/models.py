import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        HOD = "hod", "HOD"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    profile_photo = models.URLField(blank=True)
    college = models.CharField(max_length=255, blank=True)
    branch = models.CharField(max_length=64, blank=True)
    grad_year = models.PositiveSmallIntegerField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    employee_id = models.CharField(max_length=64, blank=True)
    show_onboarding = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)
    suspended = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def save(self, *args, **kwargs):
        if self.email and (not self.username or self.username == str(self.id)):
            self.username = self.email
        super().save(*args, **kwargs)


class OTPChallenge(models.Model):
    target = models.CharField(max_length=255, db_index=True)
    code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return timezone.now() <= self.expires_at
