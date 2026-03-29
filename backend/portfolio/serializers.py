from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Achievement, Certification, Document, SemesterRecord
from .utils import profile_completion_percent, qr_unlocked

User = get_user_model()


class SemesterRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SemesterRecord
        fields = (
            "id",
            "semester_number",
            "subjects_json",
            "cgpa",
            "percentage",
            "entry_method",
            "updated_at",
        )
        read_only_fields = ("id", "entry_method", "updated_at")


class CertificationSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = (
            "id",
            "title",
            "org",
            "date",
            "file",
            "status",
            "seen_by_hod",
            "verified_by",
            "verified_by_name",
            "rejection_reason",
            "student_note",
            "submitted_at",
        )
        read_only_fields = (
            "id",
            "status",
            "seen_by_hod",
            "verified_by",
            "rejection_reason",
            "submitted_at",
        )

    def get_verified_by_name(self, obj):
        if obj.verified_by_id:
            return obj.verified_by.get_full_name() or obj.verified_by.email
        return None


class AchievementSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = (
            "id",
            "title",
            "description",
            "date",
            "category",
            "photos",
            "status",
            "seen_by_hod",
            "verified_by",
            "verified_by_name",
            "rejection_reason",
            "student_note",
            "submitted_at",
        )
        read_only_fields = (
            "id",
            "status",
            "seen_by_hod",
            "verified_by",
            "rejection_reason",
            "submitted_at",
        )

    def get_verified_by_name(self, obj):
        if obj.verified_by_id:
            return obj.verified_by.get_full_name() or obj.verified_by.email
        return None


class DocumentSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = (
            "id",
            "title",
            "file",
            "status",
            "seen_by_hod",
            "verified_by",
            "verified_by_name",
            "rejection_reason",
            "submitted_at",
        )
        read_only_fields = (
            "id",
            "status",
            "seen_by_hod",
            "verified_by",
            "rejection_reason",
            "submitted_at",
        )

    def get_verified_by_name(self, obj):
        if obj.verified_by_id:
            return obj.verified_by.get_full_name() or obj.verified_by.email
        return None


class PublicPortfolioSerializer(serializers.Serializer):
    """Nested structure built in view — placeholder for OpenAPI."""

    pass
