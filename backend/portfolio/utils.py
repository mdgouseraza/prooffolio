from django.contrib.auth import get_user_model

User = get_user_model()


def profile_sections_filled(user) -> tuple[int, int]:
    """Returns (filled, total) for progress bar."""
    total = 6
    filled = 0
    if user.first_name and user.branch and user.grad_year:
        filled += 1
    if user.profile_photo:
        filled += 1
    if user.linkedin_url or user.github_url:
        filled += 1
    if user.phone:
        filled += 1
    if user.email:
        filled += 1
    if user.college:
        filled += 1
    return filled, total


def profile_completion_percent(user) -> int:
    f, t = profile_sections_filled(user)
    return int(round(100 * f / t)) if t else 0


def qr_unlocked(user) -> bool:
    if not (user.first_name and user.branch and user.grad_year):
        return False
    has_sem = user.semester_records.exists()
    has_extra = user.certifications.exists() or user.achievements.exists()
    return has_sem and has_extra
