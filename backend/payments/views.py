from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from handles.models import Handle
from .models import PaymentRequest
from .serializers import PaymentRequestSerializer


class PaymentRequestListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/payment-requests/ -> outgoing (requests I made)  [kept for backward compatibility]
    POST /api/payment-requests/ -> create outgoing request
    """
    serializer_class = PaymentRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentRequest.objects.filter(requester=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        target = (request.data.get("target_handle") or "").strip().lower().lstrip("@")
        amount = request.data.get("amount_in_minor")
        currency = (request.data.get("currency") or "GBP").strip().upper()
        note = (request.data.get("note") or "").strip()

        if not target or amount is None:
            return Response({"detail": "target_handle and amount_in_minor required"}, status=400)

        try:
            amount_int = int(amount)
            if amount_int <= 0:
                raise ValueError
        except Exception:
            return Response({"detail": "amount_in_minor must be a positive integer"}, status=400)

        # Check that target handle exists
        if not Handle.objects.filter(value=target).exists():
            return Response({"detail": "Target handle does not exist"}, status=404)

        payment = PaymentRequest.objects.create(
            requester=request.user,
            target_handle=target,
            amount_in_minor=amount_int,
            currency=currency,
            note=note,
        )

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OutgoingPaymentRequestsView(generics.ListAPIView):
    """
    GET /api/payment-requests/outgoing/
    """
    serializer_class = PaymentRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentRequest.objects.filter(requester=self.request.user).order_by("-created_at")


class IncomingPaymentRequestsView(generics.ListAPIView):
    """
    GET /api/payment-requests/incoming/
    Incoming = requests where target_handle matches MY handle(s).
    """
    serializer_class = PaymentRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        my_handles = Handle.objects.filter(user=self.request.user).values_list("value", flat=True)
        return PaymentRequest.objects.filter(target_handle__in=my_handles).order_by("-created_at")