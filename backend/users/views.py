import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenViewBase

from .models import OTPChallenge
from .serializers import (
    ForgotPasswordSerializer,
    OTPSendSerializer,
    OTPVerifySerializer,
    ResetPasswordSerializer,
    StudentRegisterSerializer,
    UserMeSerializer,
)

User = get_user_model()


def _issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


from rest_framework_simplejwt.views import TokenObtainPairView



class CookieTokenRefreshView(TokenViewBase):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        data = dict(request.data) if hasattr(request.data, "keys") else {}
        if "refresh" not in data and request.COOKIES.get("refresh_token"):
            data["refresh"] = request.COOKIES.get("refresh_token")
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        access = validated.get("access")
        refresh = validated.get("refresh")
        response = Response({"access": access}, status=status.HTTP_200_OK)
        if refresh:
            response.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=settings.JWT_AUTH_COOKIE_SECURE,
                samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
                max_age=7 * 24 * 60 * 60,
                path="/",
            )
        return response


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = StudentRegisterSerializer

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        tokens = _issue_tokens(user)
        out = UserMeSerializer(user).data
        out.update({"tokens": {"access": tokens["access"]}})
        response = Response(out, status=status.HTTP_201_CREATED)
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh"],
            httponly=True,
            secure=settings.JWT_AUTH_COOKIE_SECURE,
            samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
            max_age=7 * 24 * 60 * 60,
            path="/",
        )
        return response


class MeView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserMeSerializer

    def get_object(self):
        return self.request.user


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token") or request.data.get("id_token")
        if not token:
            return Response({"detail": "token required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            cid = settings.GOOGLE_OAUTH_CLIENT_ID
            if not cid:
                return Response(
                    {"detail": "Google OAuth not configured"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            info = id_token.verify_oauth2_token(token, google_requests.Request(), cid)
            email = info.get("email")
            sub = info.get("sub")
            if not email:
                return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email.lower(),
            defaults={
                "username": email.lower(),
                "first_name": info.get("given_name", "")[:150],
                "last_name": info.get("family_name", "")[:150],
                "role": User.Role.STUDENT,
                "college": settings.UNIVERSITY_NAME,
                "google_id": sub,
            },
        )
        if not created and not user.google_id:
            user.google_id = sub
            user.save(update_fields=["google_id"])
        tokens = _issue_tokens(user)
        out = UserMeSerializer(user).data
        out["tokens"] = {"access": tokens["access"]}
        response = Response(out)
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh"],
            httponly=True,
            secure=settings.JWT_AUTH_COOKIE_SECURE,
            samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
            max_age=7 * 24 * 60 * 60,
            path="/",
        )
        return response


def _send_otp(target: str, code: str, channel: str):
    OTPChallenge.objects.filter(target=target).delete()
    expires = timezone.now() + timedelta(minutes=10)
    OTPChallenge.objects.create(target=target, code=code, expires_at=expires)
    if channel == "email":
        # Enhanced email sending for Gmail integration
        subject = "ProofFolio - Verification Code"
        message = f"""
Hello,

Your verification code for ProofFolio is: {code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
ProofFolio Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [target],
                fail_silently=True,
                html_message=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #4F46E5; padding: 20px; border-radius: 8px;">
                        <h2 style="color: white; margin: 0 0 20px 0;">ProofFolio Verification</h2>
                        <p style="color: white; margin: 0 0 10px 0;">Hello!</p>
                        <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                            <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">Your verification code is:</p>
                            <div style="background: #F3F4F6; padding: 15px; border-radius: 4px; text-align: center; margin: 10px 0;">
                                <span style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 2px;">{code}</span>
                            </div>
                        </div>
                        <p style="color: white; font-size: 12px; margin: 20px 0 0 10px;">This code expires in 10 minutes.</p>
                        <p style="color: white; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
                    </div>
                </div>
                """,
            )
        except Exception as e:
            # Fallback to plain text if HTML fails
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [target],
                fail_silently=True,
            )
    # SMS: integrate Twilio etc.


class OTPSendView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = OTPSendSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        target = ser.validated_data["target"]
        channel = ser.validated_data["channel"]
        code = f"{random.randint(0, 999999):06d}"
        _send_otp(target, code, channel)
        return Response({"detail": "sent"})


class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = OTPVerifySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        target = ser.validated_data["target"]
        code = ser.validated_data["code"]
        ch = OTPChallenge.objects.filter(target=target).order_by("-id").first()
        if not ch or not ch.is_valid() or ch.code != code:
            return Response({"detail": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
        ch.delete()
        return Response({"detail": "ok"})


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = ForgotPasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        target = ser.validated_data["target"]
        channel = ser.validated_data["channel"]
        code = f"{random.randint(0, 999999):06d}"
        _send_otp(target, code, channel)
        return Response({"detail": "sent"})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = ResetPasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        target = ser.validated_data["target"]
        code = ser.validated_data["code"]
        new_password = ser.validated_data["new_password"]
        ch = OTPChallenge.objects.filter(target=target).order_by("-id").first()
        if not ch or not ch.is_valid() or ch.code != code:
            return Response({"detail": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
        ch.delete()
        user = User.objects.filter(email__iexact=target).first()
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"detail": "password updated"})


class LogoutView(APIView):
    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie("refresh_token", path="/")
        return response
