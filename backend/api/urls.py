from django.urls import path, include
from .views import health, csrf, signup, login_view, logout_view

urlpatterns = [
    path("health/", health),
    path("csrf/", csrf),

    path("auth/signup/", signup),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),

    # DRF handles endpoints
    path("", include("handles.urls")),
]
