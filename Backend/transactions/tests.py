from unittest.mock import patch

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from account.models import UserProfile
from items.models import Catigory, Item, SubCatigory
from transactions.models import Payment


@override_settings(
    FRONTEND_URL='http://localhost:3000',
    SUPPORT_EMAIL='support@foxcodeshub.com',
    STRIPE_WEBHOOK_SECRET='whsec_test_secret',
)
class StripeCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = UserProfile.objects.create_user(
            email='seller@example.com',
            username='seller',
            password='pass1234',
            fullname='Seller User',
        )
        self.buyer = UserProfile.objects.create_user(
            email='buyer@example.com',
            username='buyer',
            password='pass1234',
            fullname='Buyer User',
        )
        category = Catigory.objects.create(name='Web')
        sub_category = SubCatigory.objects.create(name='React', catigory=category)
        self.item = Item.objects.create(
            seller=self.seller,
            name='Premium Template',
            price=100,
            discount_price=80,
            short_describtion='Short description',
            describtion='Full description',
            featurs='Feature list',
            size=12,
            catigory=category,
            sub_catigory=sub_category,
            demo_url='https://example.com/demo',
        )

    @patch('transactions.api.v1.stripe_views.stripe.checkout.Session.create')
    def test_create_checkout_session_returns_session_url(self, mock_create_session):
        mock_create_session.return_value.url = 'https://checkout.stripe.com/session/test'
        self.client.force_authenticate(user=self.buyer)

        response = self.client.post(
            '/api/payments/stripe/create-checkout/',
            {'item_id': self.item.id},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data['session_url'],
            'https://checkout.stripe.com/session/test',
        )
        mock_create_session.assert_called_once()
        call_kwargs = mock_create_session.call_args.kwargs
        self.assertEqual(call_kwargs['mode'], 'payment')
        self.assertEqual(call_kwargs['metadata']['item_id'], str(self.item.id))
        self.assertEqual(call_kwargs['metadata']['user_id'], str(self.buyer.id))
        self.assertEqual(call_kwargs['line_items'][0]['price_data']['unit_amount'], 8000)
        self.assertEqual(
            call_kwargs['success_url'],
            f'http://localhost:3000/item?id={self.item.id}&payment=success',
        )
        self.assertEqual(
            call_kwargs['cancel_url'],
            f'http://localhost:3000/item?id={self.item.id}&payment=cancelled',
        )

    @patch('transactions.api.v1.stripe_views.Util.send_email')
    @patch('transactions.api.v1.stripe_views.stripe.Webhook.construct_event')
    def test_webhook_creates_payment_record(self, mock_construct_event, mock_send_email):
        mock_construct_event.return_value = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'payment_intent': 'pi_test_123',
                    'metadata': {
                        'item_id': str(self.item.id),
                        'user_id': str(self.buyer.id),
                    },
                },
            },
        }

        response = self.client.post(
            '/api/payments/webhook/stripe/',
            data=b'{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='stripe-signature',
        )

        self.assertEqual(response.status_code, 200)
        payment = Payment.objects.get(stripe_payment_intent_id='pi_test_123')
        self.assertEqual(payment.payment_method, 'stripe')
        self.assertEqual(payment.buyer, self.buyer)
        self.assertEqual(payment.seller, self.seller)
        self.assertEqual(payment.item, self.item)
        self.assertEqual(payment.total_amount, 80)
        self.assertEqual(payment.net_amount, 60.0)
        self.assertEqual(mock_send_email.call_count, 2)

    @patch('transactions.api.v1.stripe_views.Util.send_email')
    @patch('transactions.api.v1.stripe_views.stripe.Webhook.construct_event')
    def test_webhook_is_idempotent_for_duplicate_events(self, mock_construct_event, mock_send_email):
        mock_construct_event.return_value = {
            'type': 'checkout.session.completed',
            'data': {
                'object': {
                    'payment_intent': 'pi_test_duplicate',
                    'metadata': {
                        'item_id': str(self.item.id),
                        'user_id': str(self.buyer.id),
                    },
                },
            },
        }

        first_response = self.client.post(
            '/api/payments/webhook/stripe/',
            data=b'{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='stripe-signature',
        )
        second_response = self.client.post(
            '/api/payments/webhook/stripe/',
            data=b'{}',
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='stripe-signature',
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertEqual(
            Payment.objects.filter(stripe_payment_intent_id='pi_test_duplicate').count(),
            1,
        )
        self.assertEqual(mock_send_email.call_count, 2)
