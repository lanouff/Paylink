from urllib.parse import urlencode
import secrets
import requests
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.shortcuts import redirect

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import TrueLayerAuthSession, BankConnection


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def truelayer_auth_url(request):
    """
    Creates a TrueLayer auth URL and stores OAuth 'state' to link callback -> user.
    """
    if not request.user.email:
        return Response(
            {"error": "Your user account has no email. Add an email to continue."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    state = secrets.token_urlsafe(24)

    # store state -> user mapping (used once)
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
    """
    Validates 'state', exchanges code for token, stores token for correct user.
    """
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        return Response(
            {"error": "Missing code/state"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # state must exist and be unused
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

    # store token for user
    BankConnection.objects.update_or_create(
        user=sess.user,
        defaults={
            "access_token": token_json.get("access_token", ""),
            "refresh_token": token_json.get("refresh_token"),
            "expires_at": expires_at,
            "token_type": token_json.get("token_type", "Bearer"),
        },
    )

    # mark state as used
    sess.used_at = timezone.now()
    sess.save(update_fields=["used_at"])

    # redirect back to frontend (don’t expose token in URL/response)
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

    # TrueLayer Data API (sandbox)
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
        return Response({"error": "No bank connection found. Connect a bank first."}, status=status.HTTP_400_BAD_REQUEST)

    url = f"https://api.truelayer-sandbox.com/data/v1/accounts/{account_id}/balance"
    headers = {"Authorization": f"Bearer {conn.access_token}"}

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return Response({"error": "Failed to fetch balance", "details": r.text}, status=status.HTTP_400_BAD_REQUEST)

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

    # Optional query params: from=YYYY-MM-DD, to=YYYY-MM-DD
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