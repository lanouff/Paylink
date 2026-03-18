from django.urls import path, include
from .views import (
    health,
    signup,
    login_view,
    logout_view,
    me,
    forgot_password,
    reset_password,
    contact_us,
)

urlpatterns = [
    path("health/", health),

    path("auth/signup/", signup),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),
    path("auth/me/", me),
    path("auth/forgot-password/", forgot_password),
    path("auth/reset-password/", reset_password),

    path("contact/", contact_us),

    path("", include("handles.urls")),
    path("", include("payments.urls")),
]