from django.urls import path

from .views import (
    AcademicsScanView,
    AchievementDetailView,
    AchievementListCreateView,
    AchievementRerequestView,
    CertificationDetailView,
    CertificationListCreateView,
    CertificationRerequestView,
    DocumentListCreateView,
    NotificationListView,
    NotificationReadView,
    SemesterRecordListCreateView,
    StudentProfileAPIView,
    StudentQRView,
)

urlpatterns = [
    path("profile/", StudentProfileAPIView.as_view(), name="student_profile"),
    path("academics/", SemesterRecordListCreateView.as_view(), name="student_academics"),
    path("academics/scan/", AcademicsScanView.as_view(), name="student_academics_scan"),
    path("certifications/", CertificationListCreateView.as_view(), name="student_certs"),
    path(
        "certifications/<int:pk>/",
        CertificationDetailView.as_view(),
        name="student_cert_detail",
    ),
    path(
        "certifications/<int:pk>/rerequest/",
        CertificationRerequestView.as_view(),
        name="student_cert_rerequest",
    ),
    path("achievements/", AchievementListCreateView.as_view(), name="student_achievements"),
    path(
        "achievements/<int:pk>/",
        AchievementDetailView.as_view(),
        name="student_achievement_detail",
    ),
    path(
        "achievements/<int:pk>/rerequest/",
        AchievementRerequestView.as_view(),
        name="student_achievement_rerequest",
    ),
    path("documents/", DocumentListCreateView.as_view(), name="student_documents"),
    path("qr/", StudentQRView.as_view(), name="student_qr"),
    path("notifications/", NotificationListView.as_view(), name="student_notifications"),
    path(
        "notifications/<int:pk>/read/",
        NotificationReadView.as_view(),
        name="student_notification_read",
    ),
]
