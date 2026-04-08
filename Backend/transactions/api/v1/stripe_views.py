import stripe
from django.conf import settings
from django.db import IntegrityError
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone

from transactions.models import Payment
from items.models import Item
from account.models import UserProfile
from account.utils import Util

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout_session(request):
    """
    Creates a Stripe Checkout Session and returns the hosted checkout URL.
    Expected body: { item_id: <int> }
    """
    item_id = request.data.get('item_id')
    if not item_id:
        return Response({'error': 'item_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        item = Item.objects.get(pk=item_id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    # Prevent duplicate purchase
    if Payment.objects.filter(buyer=request.user, item=item).exists():
        return Response({'error': 'You have already purchased this item'}, status=status.HTTP_400_BAD_REQUEST)

    price = item.discount_price if item.discount_price else item.price

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'usd',
                'unit_amount': price * 100,  # Stripe uses cents
                'product_data': {
                    'name': item.name,
                },
            },
            'quantity': 1,
        }],
        mode='payment',
        metadata={
            'item_id': str(item.id),
            'user_id': str(request.user.id),
        },
        success_url=f'{settings.FRONTEND_URL}/item?id={item.id}&payment=success',
        cancel_url=f'{settings.FRONTEND_URL}/item?id={item.id}&payment=cancelled',
    )

    return Response({'session_url': session.url}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(View):
    """
    Receives and verifies Stripe webhook events.
    Idempotent: skips duplicate payment_intent IDs.
    """
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse(status=400)

        if event['type'] != 'checkout.session.completed':
            return HttpResponse(status=200)

        session = event['data']['object']
        payment_intent_id = session.get('payment_intent')
        metadata = session.get('metadata', {})
        item_id = metadata.get('item_id')
        user_id = metadata.get('user_id')

        if not item_id or not user_id or not payment_intent_id:
            return HttpResponse(status=400)

        # Idempotency check
        if Payment.objects.filter(stripe_payment_intent_id=payment_intent_id).exists():
            return HttpResponse(status=200)

        # Users can only own one payment per item in this project.
        # If the purchase already exists, acknowledge the webhook so Stripe stops retrying.
        if Payment.objects.filter(buyer_id=user_id, item_id=item_id).exists():
            return HttpResponse(status=200)

        try:
            buyer = UserProfile.objects.get(pk=user_id)
            item = Item.objects.get(pk=item_id)
        except (UserProfile.DoesNotExist, Item.DoesNotExist):
            return HttpResponse(status=400)

        price = item.discount_price if item.discount_price else item.price
        payment = Payment(
            trans_id=payment_intent_id,
            stripe_payment_intent_id=payment_intent_id,
            payment_method='stripe',
            buyer=buyer,
            seller=item.seller,
            item=item,
            date=timezone.now(),
            total_amount=price,
            net_amount=price * 0.75,
        )
        try:
            payment.save()
        except IntegrityError:
            return HttpResponse(status=200)

        try:
            Util.send_email({
                'email_subject': 'Your purchase details on Fox Source Code',
                'email_body': (
                    f"Hello {buyer.fullname}\n"
                    f"You have just purchased {item.name}.\n"
                    f"Transaction Date: {payment.date}\n"
                    f"Amount: ${payment.total_amount}\n"
                    f"If you need help, contact us at: {settings.SUPPORT_EMAIL}"
                ),
                'to_email': [buyer.email],
            })
            Util.send_email({
                'email_subject': 'You have a new earning on Fox Source Code',
                'email_body': (
                    f"Hello {item.seller.fullname},\n"
                    f"${payment.net_amount} has been added to your credit.\n"
                    f"Item: {item.name} | Buyer: {buyer.username}"
                ),
                'to_email': [item.seller.email],
            })
        except Exception:
            pass

        return HttpResponse(status=200)
