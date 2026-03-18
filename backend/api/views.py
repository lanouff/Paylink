import json

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import PasswordResetRequest, ContactMessage


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


@csrf_exempt
@require_POST
def forgot_password(request):
    """
    Demo-friendly reset flow:
    - user enters email
    - if email exists, create a reset request with a token
    - return a generic success message
    - for demo purposes also return the token when an account exists
    """
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    email = (body.get("email") or "").strip().lower()

    if not email or "@" not in email:
        return JsonResponse({"ok": False, "error": "Valid email is required"}, status=400)

    user = User.objects.filter(email=email).first()

    if user:
        reset_request = PasswordResetRequest.objects.create(email=email, user=user)
        return JsonResponse(
            {
                "ok": True,
                "message": "If an account with that email exists, a password reset request has been recorded.",
                "reset_token": reset_request.token,
            }
        )

    return JsonResponse(
        {
            "ok": True,
            "message": "If an account with that email exists, a password reset request has been recorded.",
        }
    )


@csrf_exempt
@require_POST
def reset_password(request):
    """
    User provides email + token + new password.
    If valid, update password and mark token as used.
    """
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    email = (body.get("email") or "").strip().lower()
    token_value = (body.get("token") or "").strip()
    new_password = (body.get("new_password") or "").strip()

    if not email or "@" not in email:
        return JsonResponse({"ok": False, "error": "Valid email is required"}, status=400)

    if not token_value:
        return JsonResponse({"ok": False, "error": "Reset token is required"}, status=400)

    if len(new_password) < 6:
        return JsonResponse({"ok": False, "error": "New password must be at least 6 characters"}, status=400)

    reset_request = (
        PasswordResetRequest.objects
        .filter(email=email, token=token_value, used=False)
        .select_related("user")
        .order_by("-created_at")
        .first()
    )

    if not reset_request or not reset_request.user:
        return JsonResponse({"ok": False, "error": "Invalid or expired reset token"}, status=400)

    user = reset_request.user
    user.set_password(new_password)
    user.save()

    reset_request.used = True
    reset_request.save(update_fields=["used"])

    return JsonResponse(
        {
            "ok": True,
            "message": "Password reset successfully. You can now log in with your new password.",
        }
    )


@csrf_exempt
@require_POST
def contact_us(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    subject = (body.get("subject") or "").strip()
    message = (body.get("message") or "").strip()

    if not name or len(name) < 2:
        return JsonResponse({"ok": False, "error": "Name is required"}, status=400)

    if not email or "@" not in email:
        return JsonResponse({"ok": False, "error": "Valid email is required"}, status=400)

    if not subject:
        return JsonResponse({"ok": False, "error": "Subject is required"}, status=400)

    if len(message) < 10:
        return JsonResponse({"ok": False, "error": "Message must be at least 10 characters"}, status=400)

    ContactMessage.objects.create(
        name=name,
        email=email,
        subject=subject,
        message=message,
    )

    return JsonResponse({"ok": True, "message": "Your message has been sent successfully."}, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
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