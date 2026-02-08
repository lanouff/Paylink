from rest_framework import generics,status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Handle
from .serializers import HandleSerializer


class HandleListCreateView(generics.ListCreateAPIView):
    queryset = Handle.objects.all().order_by("-created_at")
    serializer_class = HandleSerializer

class HandleAvailabilityView(APIView):
    def get(self, request):
        value = (request.query_params.get("value") or "").strip()
        if not value:
            return Response(
                {"detail": "Query param 'value' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        exists = Handle.objects.filter(value=value).exists()
        return Response({"value": value, "available": not exists})