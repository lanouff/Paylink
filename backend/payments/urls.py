from django.urls import path
from .views import PaymentRequestListCreateView

urlpatterns = [
    path("payment-requests/", PaymentRequestListCreateView.as_view(), name="payment-requests"),
]