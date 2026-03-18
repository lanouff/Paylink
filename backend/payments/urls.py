from django.urls import path
from .views_truelayer import (
    truelayer_auth_url,
    truelayer_callback,
    truelayer_accounts,
    truelayer_balance,
    truelayer_transactions,
    truelayer_start_payment_for_request,
    paylink_balance,
)
from .views import (
    PaymentRequestListCreateView,
    OutgoingPaymentRequestsView,
    IncomingPaymentRequestsView,
    DeclinePaymentRequestView,
    CancelPaymentRequestView,
)

urlpatterns = [
    path("payment-requests/", PaymentRequestListCreateView.as_view(), name="payment-requests"),
    path("payment-requests/outgoing/", OutgoingPaymentRequestsView.as_view(), name="payment-requests-outgoing"),
    path("payment-requests/incoming/", IncomingPaymentRequestsView.as_view(), name="payment-requests-incoming"),
    path(
        "payment-requests/<int:payment_request_id>/decline/",
        DeclinePaymentRequestView.as_view(),
        name="payment-request-decline",
    ),
    path(
        "payment-requests/<int:payment_request_id>/cancel/",
        CancelPaymentRequestView.as_view(),
        name="payment-request-cancel",
    ),

    path("truelayer/auth-url/", truelayer_auth_url),
    path("truelayer/callback/", truelayer_callback),
    path("truelayer/accounts/", truelayer_accounts),
    path("truelayer/accounts/<str:account_id>/balance/", truelayer_balance),
    path("truelayer/accounts/<str:account_id>/transactions/", truelayer_transactions),
    path("paylink/balance/", paylink_balance),
    path(
        "truelayer/payment-requests/<int:payment_request_id>/start/",
        truelayer_start_payment_for_request,
        name="truelayer-start-payment-for-request",
    ),
]