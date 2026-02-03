from django.urls import path
from .views import health, check_handle, create_handle
from .views import csrf, signup, login_view, logout_view

urlpatterns = [
    path("health/", health),
    path("handle/check/", check_handle),
    path("handle/create/", create_handle),
    path("csrf/", csrf),
    path("auth/signup/", signup),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),
]
