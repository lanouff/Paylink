from django.urls import path, include
from .views import health, signup, login_view, logout_view, me

urlpatterns = [
    path("health/", health),

    path("auth/signup/", signup),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),
    path("auth/me/", me),

    # DRF handles endpoints
    path("", include("handles.urls")),
    path("", include("payments.urls")),
]