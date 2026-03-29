from django.urls import path

from .views import (
    HODMarkSeenView,
    HODStatsView,
    HODStudentDetailView,
    HODStudentListView,
    HODVerifyView,
)

urlpatterns = [
    path("students/", HODStudentListView.as_view(), name="hod_students"),
    path("students/<uuid:pk>/", HODStudentDetailView.as_view(), name="hod_student_detail"),
    path(
        "students/<uuid:student_id>/seen/<str:category>/",
        HODMarkSeenView.as_view(),
        name="hod_mark_seen",
    ),
    path(
        "verify/<str:item_type>/<int:pk>/",
        HODVerifyView.as_view(),
        name="hod_verify",
    ),
    path("stats/", HODStatsView.as_view(), name="hod_stats"),
]
