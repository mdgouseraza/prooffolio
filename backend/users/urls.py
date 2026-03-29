from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    ForgotPasswordView,
    GoogleAuthView,
    LogoutView,
    MeView,
    OTPSendView,
    OTPVerifyView,
    RegisterView,
    ResetPasswordView,
)

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("register/", RegisterView.as_view(), name="register"),
    path("google/", GoogleAuthView.as_view(), name="google_auth"),
    path("otp/send/", OTPSendView.as_view(), name="otp_send"),
    path("otp/verify/", OTPVerifyView.as_view(), name="otp_verify"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
