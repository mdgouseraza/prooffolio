import io

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from notifications.models import Notification
from users.permissions import IsAdminRole, IsHOD, IsStudent
from users.serializers import StudentProfileSerializer, UserMeSerializer

from .models import Achievement, Certification, Document, SemesterRecord
from .ocr import extract_marksheet_data
from .serializers import (
    AchievementSerializer,
    CertificationSerializer,
    DocumentSerializer,
    SemesterRecordSerializer,
)
from .utils import qr_unlocked

User = get_user_model()
MAX_SCAN_BYTES = 10 * 1024 * 1024


class StudentProfileAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = StudentProfileSerializer

    def get_object(self):
        u = self.request.user
        if not u.college:
            u.college = settings.UNIVERSITY_NAME
            u.save(update_fields=["college"])
        return u


class SemesterRecordListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = SemesterRecordSerializer

    def get_queryset(self):
        return SemesterRecord.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, entry_method=SemesterRecord.EntryMethod.MANUAL)


class AcademicsScanView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        f = request.FILES.get("file")
        if not f:
            return Response({"detail": "file required"}, status=status.HTTP_400_BAD_REQUEST)
        data = f.read()
        if len(data) > MAX_SCAN_BYTES:
            return Response({"detail": "file too large"}, status=status.HTTP_400_BAD_REQUEST)
        result = extract_marksheet_data(data, getattr(f, "content_type", None))
        return Response(result)


class CertificationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = CertificationSerializer

    def get_queryset(self):
        return Certification.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, status=Certification.Status.SUBMITTED)


class CertificationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = CertificationSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return Certification.objects.filter(student=self.request.user)

    def perform_update(self, serializer):
        obj = self.get_object()
        if obj.status != Certification.Status.REJECTED:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only rejected entries can be edited.")
        serializer.save(status=Certification.Status.SUBMITTED, seen_by_hod=False)


class CertificationRerequestView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, pk):
        c = get_object_or_404(Certification, pk=pk, student=request.user)
        if c.status != Certification.Status.REJECTED:
            return Response({"detail": "invalid state"}, status=status.HTTP_400_BAD_REQUEST)
        c.status = Certification.Status.SUBMITTED
        c.student_note = request.data.get("student_note", "")
        c.rejection_reason = ""
        c.seen_by_hod = False
        c.save()
        return Response(CertificationSerializer(c).data)


class AchievementListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = AchievementSerializer

    def get_queryset(self):
        return Achievement.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, status=Achievement.Status.SUBMITTED)


class AchievementDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = AchievementSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return Achievement.objects.filter(student=self.request.user)

    def perform_update(self, serializer):
        obj = self.get_object()
        if obj.status != Achievement.Status.REJECTED:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only rejected entries can be edited.")
        serializer.save(status=Achievement.Status.SUBMITTED, seen_by_hod=False)


class AchievementRerequestView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, pk):
        a = get_object_or_404(Achievement, pk=pk, student=request.user)
        if a.status != Achievement.Status.REJECTED:
            return Response({"detail": "invalid state"}, status=status.HTTP_400_BAD_REQUEST)
        a.status = Achievement.Status.SUBMITTED
        a.student_note = request.data.get("student_note", "")
        a.rejection_reason = ""
        a.seen_by_hod = False
        a.save()
        return Response(AchievementSerializer(a).data)


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = DocumentSerializer

    def get_queryset(self):
        return Document.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user, status=Document.Status.SUBMITTED)


class StudentQRView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        user = request.user
        if not qr_unlocked(user):
            return Response(
                {
                    "unlocked": False,
                    "checklist": {
                        "profile": bool(user.first_name and user.branch and user.grad_year),
                        "semester": user.semester_records.exists(),
                        "cert_or_achievement": user.certifications.exists()
                        or user.achievements.exists(),
                    },
                }
            )
        import qrcode
        import base64

        public_url = request.build_absolute_uri(f"/portfolio/{user.id}")
        img = qrcode.make(public_url)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return Response(
            {
                "unlocked": True,
                "url": public_url,
                "qr_png_base64": b64,
            }
        )


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = None

    def list(self, request, *args, **kwargs):
        qs = Notification.objects.filter(user=request.user)[:200]
        data = [
            {
                "id": str(n.id),
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
                "notification_type": n.notification_type,
            }
            for n in qs
        ]
        return Response(data)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def put(self, request, pk):
        n = get_object_or_404(Notification, pk=pk, user=request.user)
        n.is_read = True
        n.save(update_fields=["is_read"])
        return Response({"detail": "ok"})


class PublicPortfolioView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, student_id):
        student = get_object_or_404(User, pk=student_id, role=User.Role.STUDENT)
        if student.suspended:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        hod = User.objects.filter(role=User.Role.HOD, branch=student.branch).first()
        semesters = SemesterRecord.objects.filter(student=student)
        certs = Certification.objects.filter(student=student, status=Certification.Status.APPROVED)
        achievements = Achievement.objects.filter(student=student, status=Achievement.Status.APPROVED)
        docs = Document.objects.filter(student=student)
        verified_count = (
            student.certifications.filter(status=Certification.Status.APPROVED).count()
            + student.achievements.filter(status=Achievement.Status.APPROVED).count()
        )
        any_verified = verified_count > 0
        resume_doc = docs.filter(title__icontains="resume").first() or docs.first()
        return Response(
            {
                "student": {
                    "name": student.get_full_name() or student.email.split("@")[0],
                    "photo": student.profile_photo,
                    "college": student.college,
                    "branch": student.branch,
                    "grad_year": student.grad_year,
                    "linkedin_url": student.linkedin_url,
                    "github_url": student.github_url,
                    "last_updated": student.last_updated.isoformat() if student.last_updated else None,
                },
                "verified_portfolio_badge": any_verified,
                "academics": SemesterRecordSerializer(semesters, many=True).data,
                "certifications": CertificationSerializer(
                    Certification.objects.filter(student=student), many=True
                ).data,
                "achievements": AchievementSerializer(
                    Achievement.objects.filter(student=student), many=True
                ).data,
                "documents": DocumentSerializer(docs, many=True).data,
                "resume_url": resume_doc.file if resume_doc else None,
                "hod": (
                    {
                        "name": hod.get_full_name() or hod.email,
                        "email": hod.email,
                        "branch": hod.branch,
                        "photo": hod.profile_photo,
                        "verified_cert_count": student.certifications.filter(
                            status=Certification.Status.APPROVED
                        ).count(),
                        "verified_achievement_count": student.achievements.filter(
                            status=Achievement.Status.APPROVED
                        ).count(),
                    }
                    if hod
                    else None
                ),
            }
        )


class HODStudentListView(APIView):
    permission_classes = [IsAuthenticated, IsHOD]

    def get(self, request, *args, **kwargs):
        q = request.query_params.get("q", "")
        year = request.query_params.get("year")
        qs = User.objects.filter(role=User.Role.STUDENT, branch=request.user.branch, suspended=False)
        if q:
            qs = qs.filter(Q(first_name__icontains=q) | Q(email__icontains=q) | Q(last_name__icontains=q))
        if year:
            qs = qs.filter(grad_year=year)
        out = []
        for s in qs:
            pending = (
                s.certifications.filter(
                    status__in=[Certification.Status.SUBMITTED, Certification.Status.SEEN]
                ).count()
                + s.achievements.filter(
                    status__in=[Achievement.Status.SUBMITTED, Achievement.Status.SEEN]
                ).count()
                + s.documents.filter(
                    status__in=[Document.Status.SUBMITTED, Document.Status.SEEN]
                ).count()
            )
            out.append(
                {
                    "id": str(s.id),
                    "name": s.get_full_name() or s.email,
                    "branch": s.branch,
                    "grad_year": s.grad_year,
                    "photo": s.profile_photo,
                    "pending_count": pending,
                    "last_updated": s.last_updated.isoformat() if s.last_updated else None,
                }
            )
        return Response(out)


class HODStudentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsHOD]

    def get(self, request, pk):
        student = get_object_or_404(User, pk=pk, role=User.Role.STUDENT, branch=request.user.branch)
        return Response(
            {
                "profile": UserMeSerializer(student).data,
                "certifications": CertificationSerializer(
                    student.certifications.all(), many=True
                ).data,
                "achievements": AchievementSerializer(student.achievements.all(), many=True).data,
                "documents": DocumentSerializer(student.documents.all(), many=True).data,
                "academics": SemesterRecordSerializer(student.semester_records.all(), many=True).data,
            }
        )


class HODMarkSeenView(APIView):
    permission_classes = [IsAuthenticated, IsHOD]

    def post(self, request, student_id, category):
        student = get_object_or_404(User, pk=student_id, role=User.Role.STUDENT, branch=request.user.branch)
        if category == "certifications":
            student.certifications.filter(status=Certification.Status.SUBMITTED).update(
                seen_by_hod=True, status=Certification.Status.SEEN
            )
        elif category == "achievements":
            student.achievements.filter(status=Achievement.Status.SUBMITTED).update(
                seen_by_hod=True, status=Achievement.Status.SEEN
            )
        elif category == "documents":
            student.documents.filter(status=Document.Status.SUBMITTED).update(
                seen_by_hod=True, status=Document.Status.SEEN
            )
        else:
            return Response({"detail": "bad category"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "ok"})


class HODVerifyView(APIView):
    permission_classes = [IsAuthenticated, IsHOD]

    def put(self, request, item_type, pk):
        action = request.data.get("action")
        reason = request.data.get("rejection_reason", "")
        hod = request.user
        if item_type == "certification":
            obj = get_object_or_404(Certification, pk=pk)
        elif item_type == "achievement":
            obj = get_object_or_404(Achievement, pk=pk)
        elif item_type == "document":
            obj = get_object_or_404(Document, pk=pk)
        else:
            return Response({"detail": "bad type"}, status=status.HTTP_400_BAD_REQUEST)
        if obj.student.branch != hod.branch:
            return Response({"detail": "forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if action == "approve":
            obj.status = (
                Certification.Status.APPROVED
                if item_type == "certification"
                else Achievement.Status.APPROVED
                if item_type == "achievement"
                else Document.Status.APPROVED
            )
            obj.verified_by = hod
            obj.rejection_reason = ""
        elif action == "reject":
            obj.status = (
                Certification.Status.REJECTED
                if item_type == "certification"
                else Achievement.Status.REJECTED
                if item_type == "achievement"
                else Document.Status.REJECTED
            )
            obj.rejection_reason = reason
            obj.verified_by = None
        else:
            return Response({"detail": "action required"}, status=status.HTTP_400_BAD_REQUEST)
        obj.save()
        Notification.objects.create(
            user=obj.student,
            message=f"Your item was {obj.status} by {hod.get_full_name() or hod.email}",
            notification_type=Notification.NotificationType.VERIFICATION
            if action == "approve"
            else Notification.NotificationType.REJECTION,
        )
        return Response({"detail": "ok", "status": obj.status})


class HODStatsView(APIView):
    permission_classes = [IsAuthenticated, IsHOD]

    def get(self, request):
        branch = request.user.branch
        total = User.objects.filter(role=User.Role.STUDENT, branch=branch).count()
        pending = (
            Certification.objects.filter(student__branch=branch).exclude(
                status__in=[Certification.Status.APPROVED, Certification.Status.REJECTED]
            ).count()
        )
        return Response({"total_students": total, "pending_verifications": pending})
