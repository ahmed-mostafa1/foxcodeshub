from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, api_view
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from paypalrestsdk import notifications
import json
from paypalpayoutssdk.payouts import PayoutsPostRequest
from paypalhttp import HttpError
from paypalhttp.encoder import Encoder
from paypalhttp.serializers.json_serializer import Json
from django.views.generic import View
import json
from account.api.v1.serializers import UserDataSerializer
from transactions.models import *
from paypalpayoutssdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from account.models import UserProfile
from items.models import Item
from .serializers import *
from account.utils import Util
from django.utils import timezone


environment_class = SandboxEnvironment if settings.PAYPAL_USE_SANDBOX else LiveEnvironment
environment = environment_class(
    client_id=settings.PAYPAL_CLIENT_ID, client_secret=settings.PAYPAL_CLIENT_SECRET)
client = PayPalHttpClient(environment)

# @api_view(['POST'])
# @method_decorator(csrf_exempt, name='dispatch')
# @permission_classes([])
# def process_webhook(request):
#     if "HTTP_PAYPAL_TRANSMISSION_ID" not in request.META:
#         return HttpResponseBadRequest()

#     auth_algo = request.META['HTTP_PAYPAL_AUTH_ALGO']
#     cert_url = request.META['HTTP_PAYPAL_CERT_URL']
#     transmission_id = request.META['HTTP_PAYPAL_TRANSMISSION_ID']
#     transmission_sig = request.META['HTTP_PAYPAL_TRANSMISSION_SIG']
#     transmission_time = request.META['HTTP_PAYPAL_TRANSMISSION_TIME']
#     webhook_id = settings.PAYPAL_WEBHOOK_ID
#     event_body = request.body.decode(request.encoding or "utf-8")

#     valid = notifications.WebhookEvent.verify(
#         transmission_id=transmission_id,
#         timestamp=transmission_time,
#         webhook_id=webhook_id,
#         event_body=event_body,
#         cert_url=cert_url,
#         actual_sig=transmission_sig,
#         auth_algo=auth_algo,
#     )

#     if not valid:
#         return HttpResponseBadRequest()

#     webhook_event = json.loads(event_body)
#     pprint(webhook_event)
#     event_type = webhook_event["event_type"]

#     print(event_type)

#     return HttpResponse()


@method_decorator(csrf_exempt, name='dispatch')
class process_webhook(View):
    def post(self, request):
        if "HTTP_PAYPAL_TRANSMISSION_ID" not in request.META:
            return HttpResponseBadRequest()

        auth_algo = request.META['HTTP_PAYPAL_AUTH_ALGO']
        cert_url = request.META['HTTP_PAYPAL_CERT_URL']
        transmission_id = request.META['HTTP_PAYPAL_TRANSMISSION_ID']
        transmission_sig = request.META['HTTP_PAYPAL_TRANSMISSION_SIG']
        transmission_time = request.META['HTTP_PAYPAL_TRANSMISSION_TIME']
        webhook_id = settings.PAYPAL_WEBHOOK_ID
        event_body = request.body.decode(request.encoding or "utf-8")

        valid = notifications.WebhookEvent.verify(
            transmission_id=transmission_id,
            timestamp=transmission_time,
            webhook_id=webhook_id,
            event_body=event_body,
            cert_url=cert_url,
            actual_sig=transmission_sig,
            auth_algo=auth_algo,
        )

        if not valid:
            return HttpResponseBadRequest()

        webhook_event = json.loads(event_body)
        resource = webhook_event['resource']
        buyer = UserProfile.objects.get(
            id=resource["purchase_units"][0]["custom_id"].split('&')[1])
        item = Item.objects.get(
            id=resource["purchase_units"][0]["custom_id"].split('&')[0])
        if not Payment.objects.filter(trans_id=resource['id']).exists():
            payment = Payment()
            payment.trans_id = resource['id']
            payment.buyer = buyer
            payment.buyer_paypal_id = resource['payer']['payer_id']
            payment.seller = item.seller
            payment.item = item
            payment.paypal_email = resource['payer']['email_address']
            payment.date = timezone.now()
            payment.total_amount = item.discount_price if item.discount_price else item.price
            payment.net_amount = item.discount_price * \
                0.75 if item.discount_price else item.price * 0.75
            payment.save()
            try:
                Util.send_email({
                    'email_subject': 'Your purchace details on Fox Source Code',
                    'email_body': f"Hello {payment.buyer.fullname} \n You have just purchaced {payment.item.name} and this is the details \n Item:{payment.item.name}\n Transaction Date:{payment.date}\n Transaction Amount:{payment.total_amount}$ \n We hope you enjoy your purchace \n If you faced any problem please contact us at: \n {settings.SUPPORT_EMAIL}",
                    'to_email': [payment.buyer.email]
                })

                Util.send_email({
                    'email_subject': 'You have new Earning with us',
                    'email_body': f"Hello {payment.seller.fullname}, Hope you are doing well \n We send this email to inform you that you have new earning and {payment.net_amount}$ has just added to your credit \n Earning details: \n Item:{payment.item.name} \n Transaction Date:{payment.date} \n Transaction Amount:{payment.net_amount}$ \n Buyer:{payment.buyer.username} \n Enjoy your new earning and feel free to contact us ifyou faced any problem \n {settings.SUPPORT_EMAIL}",
                    'to_email': [payment.seller.email]
                })
            except:
                pass

            return HttpResponse()
        return HttpResponseBadRequest()


@api_view(['POST'])
def create_payout(request):
    credit = UserDataSerializer(instance=request.user).data.credit
    if request.data['amount'] > credit or request.data['amount'] < 30:
        return Response(data={'error': 'Your credit not enough for this withdraw'})
    batch_id = BatchID.objects.get(pk=1)
    body = {
        "sender_batch_header": {
            "recipient_type": "EMAIL",
            "email_message": f"We have sent {request.data['amount']} dollars to you as you requested",
            "note": "Enjoy your Payout!!",
            "sender_batch_id": str(batch_id.batch_id+1),
            "email_subject": f"you requested to withdraw {request.data['amount']} dollars"
        },
        "items": [{
            "note": f"Your {request.data['amount']}$ Payout!",
            "amount": {
                "currency": "USD",
                "value": request.data['amount']-0.25
            },
            "receiver": request.data['paypal_email'],
            "sender_item_id": "12549638745"
        }]
    }

    request_1 = PayoutsPostRequest()
    request_1.request_body(body)

    try:
        # Call API with your client and get a response for your call
        response = client.execute(request_1)
        # If call returns body in response, you can get the deserialized version from the result attribute of the response
        withdraw = Withdraw()
        withdraw.user = request.user
        withdraw.trans_id = response.result.batch_header.payout_batch_id
        withdraw.paypal_email = request.data['paypal_email']
        withdraw.amount = request.data['amount']
        withdraw.save()
        batch_id.batch_id = batch_id.batch_id + 1
        batch_id.save()
        return Response(
            data={'success': 'Your withdraw has done'}, status=status.HTTP_200_OK)

    except HttpError as httpe:
        # Handle server side API failure
        encoder = Encoder([Json()])
        error = encoder.deserialize_response(httpe.message, httpe.headers)
        # print("Error: " + error["name"])
        # print("Error message: " + error["message"])
        # print("Information link: " + error["information_link"])
        # print("Debug id: " + error["debug_id"])
        # print("Details: ")
        # for detail in error["details"]:
        #     print("Error location: " + detail["location"])
        #     print("Error field: " + detail["field"])
        #     print("Error issue: " + detail["issue"])

        return Response(data={'error': error['message']}, status=status.HTTP_400_BAD_REQUEST)

    except IOError as ioe:
        # Handle cient side connection failures
        return Response(data={'error': ioe.message}, status=status.HTTP_400_BAD_REQUEST)
