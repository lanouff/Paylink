import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie


from .models import Handle


@require_GET
def health(request):
    return JsonResponse({"ok": True, "service": "paylink-backend"})


@require_GET
def check_handle(request):
    """
    /api/handle/check/?handle=somehandle
    Returns whether handle is available.
    """
    handle = (request.GET.get("handle") or "").strip().lower()
    if not handle:
        return JsonResponse({"ok": False, "error": "handle query param required"}, status=400)

    exists = Handle.objects.filter(handle=handle).exists()
    return JsonResponse({"ok": True, "handle": handle, "available": not exists})


@csrf_exempt
@require_POST
def create_handle(request):
    if not request.user.is_authenticated:
        return JsonResponse({"ok": False, "error": "Not logged in"}, status=401)

    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    handle = (body.get("handle") or "").strip().lower()
    if not handle:
        return JsonResponse({"ok": False, "error": "handle is required"}, status=400)

    if Handle.objects.filter(handle=handle).exists():
        return JsonResponse({"ok": False, "error": "Handle already taken"}, status=409)

    if Handle.objects.filter(user=request.user).exists():
        return JsonResponse({"ok": False, "error": "You already have a handle"}, status=409)

    h = Handle.objects.create(user=request.user, handle=handle)
    return JsonResponse({"ok": True, "username": request.user.username, "handle": f"@{h.handle}"})

@ensure_csrf_cookie
@require_GET
def csrf(request):
    # Sets the CSRF cookie for the browser
    return JsonResponse({"ok": True})


@csrf_exempt
@require_POST
def signup(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    username = (body.get("username") or "").strip()
    password = (body.get("password") or "").strip()

    if len(username) < 3 or len(password) < 6:
        return JsonResponse({"ok": False, "error": "Username >= 3 chars, password >= 6 chars"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"ok": False, "error": "Username already exists"}, status=409)

    user = User.objects.create_user(username=username, password=password)
    login(request, user)
    return JsonResponse({"ok": True, "username": user.username})


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

    login(request, user)
    return JsonResponse({"ok": True, "username": user.username})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})
