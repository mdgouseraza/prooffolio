from django.conf import settings
from django.db import models


class SemesterRecord(models.Model):
    class EntryMethod(models.TextChoices):
        OCR = "ocr", "OCR"
        MANUAL = "manual", "Manual"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="semester_records",
    )
    semester_number = models.PositiveSmallIntegerField()
    subjects_json = models.JSONField(default=list)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    entry_method = models.CharField(
        max_length=10,
        choices=EntryMethod.choices,
        default=EntryMethod.MANUAL,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["semester_number"]
        unique_together = [["student", "semester_number"]]


class Certification(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        SEEN = "seen", "Seen"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="certifications",
    )
    title = models.CharField(max_length=255)
    org = models.CharField(max_length=255)
    date = models.DateField()
    file = models.URLField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    seen_by_hod = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_certifications",
    )
    rejection_reason = models.TextField(blank=True)
    student_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]


class Achievement(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        SEEN = "seen", "Seen"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="achievements",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    category = models.CharField(max_length=32, default="other")
    photos = models.JSONField(default=list)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    seen_by_hod = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_achievements",
    )
    rejection_reason = models.TextField(blank=True)
    student_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]


class Document(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        SEEN = "seen", "Seen"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    title = models.CharField(max_length=255)
    file = models.URLField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    seen_by_hod = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_documents",
    )
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-submitted_at"]
