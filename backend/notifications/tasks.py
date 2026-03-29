from datetime import timedelta

from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone

from .constants import MONTHLY_MESSAGES
from .models import Notification

User = get_user_model()


@shared_task
def send_monthly_messages():
    idx = timezone.now().month - 1
    message = MONTHLY_MESSAGES[idx % len(MONTHLY_MESSAGES)]
    students = User.objects.filter(role="student", suspended=False)
    rows = [
        Notification(
            user=u,
            message=message,
            notification_type=Notification.NotificationType.MONTHLY,
        )
        for u in students
    ]
    Notification.objects.bulk_create(rows)


@shared_task
def send_thirty_day_nudges():
    cutoff = timezone.now() - timedelta(days=30)
    stale = User.objects.filter(role="student", suspended=False, last_updated__lt=cutoff)
    msg = "It's been 30 days — refresh your ProofFolio so recruiters see recent wins."
    rows = [
        Notification(
            user=u,
            message=msg,
            notification_type=Notification.NotificationType.NUDGE,
        )
        for u in stale
    ]
    Notification.objects.bulk_create(rows)
