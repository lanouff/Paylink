from django.urls import path
from .views_truelayer import truelayer_auth_url, truelayer_callback
from .views_truelayer import truelayer_accounts, truelayer_balance,truelayer_transactions
from .views import (
    PaymentRequestListCreateView,
    OutgoingPaymentRequestsView,
    IncomingPaymentRequestsView,
)

urlpatterns = [
    path("payment-requests/", PaymentRequestListCreateView.as_view(), name="payment-requests"),
    path("payment-requests/outgoing/", OutgoingPaymentRequestsView.as_view(), name="payment-requests-outgoing"),
    path("payment-requests/incoming/", IncomingPaymentRequestsView.as_view(), name="payment-requests-incoming"),
    path("truelayer/auth-url/", truelayer_auth_url),
    path("truelayer/callback/", truelayer_callback),
    path("truelayer/accounts/", truelayer_accounts),
    path("truelayer/accounts/<str:account_id>/balance/", truelayer_balance),
    path("truelayer/accounts/<str:account_id>/transactions/", truelayer_transactions),
]