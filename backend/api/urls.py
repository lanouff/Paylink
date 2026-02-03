from django.urls import path
from .views import health, check_handle, create_handle

urlpatterns = [
    path("health/", health),
    path("handle/check/", check_handle),
    path("handle/create/", create_handle),
]
