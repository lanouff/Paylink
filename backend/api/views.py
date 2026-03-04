import json

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication


@require_GET
def health(request):
    return JsonResponse({"ok": True, "service": "paylink-backend"})


@csrf_exempt
@require_POST
def signup(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    username = (body.get("username") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()

    if len(username) < 3 or len(password) < 6:
        return JsonResponse(
            {"ok": False, "error": "Username >= 3 chars, password >= 6 chars"},
            status=400,
        )

    if not email or "@" not in email:
        return JsonResponse(
            {"ok": False, "error": "Valid email is required"},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse({"ok": False, "error": "Username already exists"}, status=409)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"ok": False, "error": "Email already exists"}, status=409)

    user = User.objects.create_user(username=username, email=email, password=password)
    token = Token.objects.create(user=user)

    return JsonResponse(
        {"ok": True, "username": user.username, "email": user.email, "token": token.key},
        status=201,
    )

@csrf_exempt
@require_POST
def login_view(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    username = (body.get("username") or "").strip()
    password = (body.get("password") or "").strip()

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"ok": False, "error": "Invalid credentials"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    return JsonResponse({"ok": True, "username": user.username, "token": token.key})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Token logout = delete current token.
    Client should also clear token from localStorage.
    """
    # request.auth is the token instance/key when TokenAuthentication succeeds
    if request.auth:
        try:
            Token.objects.filter(key=str(request.auth)).delete()
        except Exception:
            pass
    return JsonResponse({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return JsonResponse(
        {"ok": True, "username": request.user.username, "email": request.user.email}
    )