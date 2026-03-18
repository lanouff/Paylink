from urllib.parse import urlencode
import secrets
import requests
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.shortcuts import redirect
from django.db import transaction

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from handles.models import Handle
from .models import TrueLayerAuthSession, BankConnection, PaymentRequest, PayLinkBalance


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def truelayer_auth_url(request):
    if not request.user.email:
        return Response(
            {"error": "Your user account has no email. Add an email to continue."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    state = secrets.token_urlsafe(24)

    TrueLayerAuthSession.objects.create(user=request.user, state=state)

    params = {
        "response_type": "code",
        "client_id": settings.TRUELAYER_CLIENT_ID,
        "redirect_uri": settings.TRUELAYER_REDIRECT_URI,
        "scope": "info accounts balance transactions",
        "user_email": request.user.email,
        "providers": "uk-ob-all uk-oauth-all uk-cs-mock",
        "state": state,
    }

    url = f"{settings.TRUELAYER_AUTH_BASE}/?{urlencode(params)}"
    return Response({"auth_url": url})


@api_view(["GET"])
@permission_classes([AllowAny])
def truelayer_callback(request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        return Response(
            {"error": "Missing code/state"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    sess = (
        TrueLayerAuthSession.objects
        .filter(state=state, used_at__isnull=True)
        .select_related("user")
        .first()
    )

    if not sess:
        return Response(
            {"error": "Invalid or already-used state"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = {
        "grant_type": "authorization_code",
        "client_id": settings.TRUELAYER_CLIENT_ID,
        "client_secret": settings.TRUELAYER_CLIENT_SECRET,
        "redirect_uri": settings.TRUELAYER_REDIRECT_URI,
        "code": code,
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    r = requests.post(settings.TRUELAYER_TOKEN_URL, data=data, headers=headers)

    if r.status_code != 200:
        return Response(
            {"error": "Token exchange failed", "details": r.text},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token_json = r.json()
    expires_in = int(token_json.get("expires_in", 3600))
    expires_at = timezone.now() + timedelta(seconds=expires_in)

    BankConnection.objects.update_or_create(
        user=sess.user,
        defaults={
            "access_token": token_json.get("access_token", ""),
            "refresh_token": token_json.get("refresh_token"),
            "expires_at": expires_at,
            "token_type": token_json.get("token_type", "Bearer"),
        },
    )

    PayLinkBalance.objects.get_or_create(user=sess.user)

    sess.used_at = timezone.now()
    sess.save(update_fields=["used_at"])

    return redirect("http://localhost:5173/?bank_connected=1")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def truelayer_accounts(request):
    conn = BankConnection.objects.filter(user=request.user).first()
    if not conn:
        return Response(
            {"error": "No bank connection found. Connect a bank first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    url = "https://api.truelayer-sandbox.com/data/v1/accounts"
    headers = {"Authorization": f"Bearer {conn.access_token}"}

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return Response(
            {"error": "Failed to fetch accounts", "details": r.text},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(r.json())


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def truelayer_balance(request, account_id: str):
    conn = BankConnection.objects.filter(user=request.user).first()
    if not conn:
        return Response(
            {"error": "No bank connection found. Connect a bank first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    url = f"https://api.truelayer-sandbox.com/data/v1/accounts/{account_id}/balance"
    headers = {"Authorization": f"Bearer {conn.access_token}"}

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return Response(
            {"error": "Failed to fetch balance", "details": r.text},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(r.json())


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def truelayer_transactions(request, account_id: str):
    conn = BankConnection.objects.filter(user=request.user).first()
    if not conn:
        return Response(
            {"error": "No bank connection found. Connect a bank first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    date_from = request.query_params.get("from")
    date_to = request.query_params.get("to")

    url = f"https://api.truelayer-sandbox.com/data/v1/accounts/{account_id}/transactions"
    params = {}
    if date_from:
      params["from"] = date_from
    if date_to:
      params["to"] = date_to

    headers = {"Authorization": f"Bearer {conn.access_token}"}

    r = requests.get(url, headers=headers, params=params)
    if r.status_code != 200:
        return Response(
            {"error": "Failed to fetch transactions", "details": r.text},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(r.json())


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def paylink_balance(request):
    balance_obj, _ = PayLinkBalance.objects.get_or_create(user=request.user)
    return Response(
        {
            "amount_in_minor": balance_obj.amount_in_minor,
            "currency": "GBP",
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def truelayer_start_payment_for_request(request, payment_request_id: int):
    payment_request = PaymentRequest.objects.filter(id=payment_request_id).select_related("requester").first()
    if not payment_request:
        return Response(
            {"error": "Payment request not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if payment_request.status != PaymentRequest.Status.CREATED:
        return Response(
            {"error": f"Payment request cannot be paid in status {payment_request.status}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    my_handles = set(
        Handle.objects.filter(user=request.user).values_list("value", flat=True)
    )

    if payment_request.target_handle not in my_handles:
        return Response(
            {"error": "You can only pay requests sent to your own handle"},
            status=status.HTTP_403_FORBIDDEN,
        )

    conn = BankConnection.objects.filter(user=request.user).first()
    if not conn:
        return Response(
            {"error": "No bank connection found. Connect a bank first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        payer_balance, _ = PayLinkBalance.objects.get_or_create(user=request.user)
        requester_balance, _ = PayLinkBalance.objects.get_or_create(user=payment_request.requester)

        payer_balance.amount_in_minor -= payment_request.amount_in_minor
        requester_balance.amount_in_minor += payment_request.amount_in_minor

        payer_balance.save(update_fields=["amount_in_minor", "updated_at"])
        requester_balance.save(update_fields=["amount_in_minor", "updated_at"])

        payment_request.payer_user = request.user
        payment_request.status = PaymentRequest.Status.PAID
        payment_request.paid_at = timezone.now()
        payment_request.save(update_fields=["payer_user", "status", "paid_at"])

    return Response(
        {
            "payment_request_id": payment_request.id,
            "status": payment_request.status,
            "message": "Payment simulated successfully.",
        },
        status=status.HTTP_200_OK,
    )