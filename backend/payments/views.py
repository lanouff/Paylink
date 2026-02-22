from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from handles.models import Handle
from .models import PaymentRequest
from .serializers import PaymentRequestSerializer


class PaymentRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentRequest.objects.filter(requester=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        target = (request.data.get("target_handle") or "").strip().lower()
        amount = request.data.get("amount_in_minor")

        if not target or not amount:
            return Response({"detail": "target_handle and amount_in_minor required"}, status=400)

        # Check that target handle exists
        if not Handle.objects.filter(value=target).exists():
            return Response({"detail": "Target handle does not exist"}, status=404)

        payment = PaymentRequest.objects.create(
            requester=request.user,
            target_handle=target,
            amount_in_minor=int(amount),
            currency=request.data.get("currency", "GBP"),
            note=request.data.get("note", ""),
        )

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)