from django.urls import path
from .views import HandleListCreateView, HandleAvailabilityView

urlpatterns = [
    path("handles/", HandleListCreateView.as_view(), name="handles-list-create"),
    path("handles/check/", HandleAvailabilityView.as_view(), name="handles-check"),
]