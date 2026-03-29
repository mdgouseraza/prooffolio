from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        VERIFICATION = "verification", "Verification"
        REJECTION = "rejection", "Rejection"
        MONTHLY = "monthly", "Monthly"
        NUDGE = "nudge", "Nudge"
        MILESTONE = "milestone", "Milestone"
        BROADCAST = "broadcast", "Broadcast"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(
        max_length=32,
        choices=NotificationType.choices,
        default=NotificationType.VERIFICATION,
    )

    class Meta:
        ordering = ["-created_at"]


class AdminBroadcast(models.Model):
    message = models.TextField()
    target_branch = models.CharField(max_length=64, blank=True, null=True)
    target_year = models.PositiveSmallIntegerField(blank=True, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)
