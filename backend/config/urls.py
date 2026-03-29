from django.contrib import admin
from django.urls import include, path

from portfolio.views import PublicPortfolioView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/student/", include("portfolio.student_urls")),
    path("api/hod/", include("portfolio.hod_urls")),
    path("api/admin/", include("admin_panel.urls")),
    path("api/portfolio/<uuid:student_id>/", PublicPortfolioView.as_view(), name="public_portfolio"),
]
