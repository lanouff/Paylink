import re

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Handle
from .serializers import HandleSerializer

HANDLE_RE = re.compile(r"^[a-z0-9_\.]{3,30}$")


def normalize_handle(raw: str) -> str:
    h = (raw or "").strip().lower()
    if h.startswith("@"):
        h = h[1:]
    return h


class HandleListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/handles/   -> list ONLY the current user's handle(s)
    POST /api/handles/   -> create a handle for current user (one per user)
    """
    serializer_class = HandleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Handle.objects.filter(user=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        value = normalize_handle(request.data.get("value"))
        display_name = (request.data.get("display_name") or "").strip()

        if not value:
            return Response({"detail": "value is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not HANDLE_RE.match(value):
            return Response({"detail": "Invalid handle format"}, status=status.HTTP_400_BAD_REQUEST)

        # One handle per user (you can loosen this later)
        if Handle.objects.filter(user=request.user).exists():
            return Response({"detail": "You already have a handle"}, status=status.HTTP_409_CONFLICT)

        # Globally unique handle
        if Handle.objects.filter(value=value).exists():
            return Response({"detail": "Handle already taken"}, status=status.HTTP_409_CONFLICT)

        handle = Handle.objects.create(user=request.user, value=value, display_name=display_name)
        serializer = self.get_serializer(handle)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HandleAvailabilityView(APIView):
    """
    GET /api/handles/check/?value=noufel  (or ?value=@noufel)
    Public endpoint: tells whether a handle is available.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        value = normalize_handle(request.query_params.get("value"))
        if not value:
            return Response(
                {"detail": "Query param 'value' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not HANDLE_RE.match(value):
            return Response({"value": value, "available": False, "detail": "Invalid handle format"}, status=400)

        exists = Handle.objects.filter(value=value).exists()
        return Response({"value": value, "available": not exists})