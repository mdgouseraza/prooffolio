from django.urls import path

from .views import (
    AdminBroadcastView,
    AdminChartsView,
    AdminHODListCreateView,
    AdminHODRetrieveUpdateDestroyView,
    AdminStatsView,
    AdminStudentListView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin_stats"),
    path("students/", AdminStudentListView.as_view(), name="admin_students"),
    path("hods/", AdminHODListCreateView.as_view(), name="admin_hods"),
    path("hods/<uuid:pk>/", AdminHODRetrieveUpdateDestroyView.as_view(), name="admin_hod_detail"),
    path("broadcast/", AdminBroadcastView.as_view(), name="admin_broadcast"),
    path("charts/", AdminChartsView.as_view(), name="admin_charts"),
]
