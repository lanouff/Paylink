from django.shortcuts import render
from django.http import JsonResponse

def health(request):
    return JsonResponse({"ok": True, "service": "paylink-backend"})
