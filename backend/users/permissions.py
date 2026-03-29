from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "student")


class IsHOD(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "hod")


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "admin")


class IsHODOfStudentBranch(BasePermission):
    """HOD can access only students matching their branch."""

    def has_object_permission(self, request, view, obj):
        hod = request.user
        student = obj if getattr(obj, "role", None) == "student" else getattr(obj, "student", None)
        if student is None:
            return False
        return hod.role == "hod" and hod.branch and student.branch == hod.branch
