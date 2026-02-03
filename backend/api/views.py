import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt

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
    """
    POST /api/handle/create/
    Body: {"username": "...", "handle": "..."}
    Creates a user (if not exists) and assigns a handle (if available).
    This is TEMP for MVP setup; we'll replace with proper auth later.
    """
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"ok": False, "error": "Invalid JSON body"}, status=400)

    username = (body.get("username") or "").strip()
    handle = (body.get("handle") or "").strip().lower()

    if not username or not handle:
        return JsonResponse({"ok": False, "error": "username and handle are required"}, status=400)

    if Handle.objects.filter(handle=handle).exists():
        return JsonResponse({"ok": False, "error": "Handle already taken"}, status=409)

    user, created = User.objects.get_or_create(username=username)
    if Handle.objects.filter(user=user).exists():
        return JsonResponse({"ok": False, "error": "User already has a handle"}, status=409)

    try:
        h = Handle.objects.create(user=user, handle=handle)
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=400)

    return JsonResponse({"ok": True, "username": user.username, "handle": f"@{h.handle}"})
