from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import AdminBroadcast, Notification
from portfolio.models import Certification
from portfolio.utils import profile_completion_percent
from users.permissions import IsAdminRole
from users.serializers import HODCreateSerializer

User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        total_students = User.objects.filter(role=User.Role.STUDENT).count()
        total_hods = User.objects.filter(role=User.Role.HOD).count()
        pending = (
            Certification.objects.filter(
                status__in=[Certification.Status.SUBMITTED, Certification.Status.SEEN]
            ).count()
        )
        verified = Certification.objects.filter(status=Certification.Status.APPROVED).count()
        return Response(
            {
                "total_students": total_students,
                "total_hods": total_hods,
                "verifications_this_month": verified,
                "pending_verifications": pending,
            }
        )


class AdminStudentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        qs = User.objects.filter(role=User.Role.STUDENT)
        data = []
        for u in qs:
            data.append(
                {
                    "id": str(u.id),
                    "name": u.get_full_name() or u.email,
                    "branch": u.branch,
                    "grad_year": u.grad_year,
                    "profile_completion": profile_completion_percent(u),
                    "last_updated": u.last_updated.isoformat() if u.last_updated else None,
                    "hod_email": User.objects.filter(role=User.Role.HOD, branch=u.branch)
                    .values_list("email", flat=True)
                    .first(),
                }
            )
        return Response(data)


class AdminHODListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = HODCreateSerializer

    def get_queryset(self):
        return User.objects.filter(role=User.Role.HOD)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        data = [
            {
                "id": str(u.id),
                "name": u.get_full_name() or u.email,
                "branch": u.branch,
                "email": u.email,
                "employee_id": u.employee_id,
                "verifications_done": u.verified_certifications.count(),
                "date_joined": u.date_joined.isoformat() if u.date_joined else None,
            }
            for u in qs
        ]
        return Response(data)


class AdminHODRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = User.objects.filter(role=User.Role.HOD)
    lookup_field = "pk"

    def get_serializer_class(self):
        class S(serializers.ModelSerializer):
            class Meta:
                model = User
                fields = ("first_name", "last_name", "branch", "employee_id")

        return S

    def retrieve(self, request, *args, **kwargs):
        u = self.get_object()
        return Response(
            {
                "id": str(u.id),
                "name": u.get_full_name() or u.email,
                "branch": u.branch,
                "email": u.email,
                "employee_id": u.employee_id,
                "verifications_done": u.verified_certifications.count(),
                "date_joined": u.date_joined.isoformat() if u.date_joined else None,
            }
        )


class AdminBroadcastView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        message = request.data.get("message", "")
        target_branch = request.data.get("target_branch") or None
        target_year = request.data.get("target_year")
        if target_year is not None:
            try:
                target_year = int(target_year)
            except (TypeError, ValueError):
                target_year = None
        b = AdminBroadcast.objects.create(
            message=message,
            target_branch=target_branch,
            target_year=target_year,
        )
        qs = User.objects.filter(role=User.Role.STUDENT, suspended=False)
        if target_branch:
            qs = qs.filter(branch=target_branch)
        if target_year:
            qs = qs.filter(grad_year=target_year)
        rows = [
            Notification(
                user=u,
                message=message,
                notification_type=Notification.NotificationType.BROADCAST,
            )
            for u in qs
        ]
        Notification.objects.bulk_create(rows)
        for u in qs:
            if u.email:
                send_mail(
                    "ProofFolio announcement",
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [u.email],
                    fail_silently=True,
                )
        return Response({"detail": "sent", "id": b.id}, status=status.HTTP_201_CREATED)


class AdminChartsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        by_branch = (
            User.objects.filter(role=User.Role.STUDENT)
            .values("branch")
            .annotate(c=Count("id"))
        )
        signups = (
            User.objects.filter(role=User.Role.STUDENT)
            .annotate(m=TruncMonth("date_joined"))
            .values("m")
            .annotate(c=Count("id"))
            .order_by("m")
        )
        return Response(
            {
                "verifications_by_branch": list(by_branch),
                "signups_over_time": [
                    {"month": x["m"].isoformat() if x["m"] else None, "count": x["c"]} for x in signups
                ],
            }
        )
