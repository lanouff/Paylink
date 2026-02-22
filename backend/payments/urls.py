from django.urls import path
from .views import (
    PaymentRequestListCreateView,
    OutgoingPaymentRequestsView,
    IncomingPaymentRequestsView,
)

urlpatterns = [
    path("payment-requests/", PaymentRequestListCreateView.as_view(), name="payment-requests"),
    path("payment-requests/outgoing/", OutgoingPaymentRequestsView.as_view(), name="payment-requests-outgoing"),
    path("payment-requests/incoming/", IncomingPaymentRequestsView.as_view(), name="payment-requests-incoming"),
]