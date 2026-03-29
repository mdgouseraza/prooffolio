from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Achievement, Certification, Document, SemesterRecord


def _touch_user_last_updated(user):
    if user and user.pk:
        from django.contrib.auth import get_user_model

        User = get_user_model()
        User.objects.filter(pk=user.pk).update(last_updated=timezone.now())


@receiver(post_save, sender=SemesterRecord)
def semester_saved(sender, instance, **kwargs):
    _touch_user_last_updated(instance.student)


@receiver(post_save, sender=Certification)
def cert_saved(sender, instance, **kwargs):
    _touch_user_last_updated(instance.student)


@receiver(post_save, sender=Achievement)
def achievement_saved(sender, instance, **kwargs):
    _touch_user_last_updated(instance.student)


@receiver(post_save, sender=Document)
def document_saved(sender, instance, **kwargs):
    _touch_user_last_updated(instance.student)
