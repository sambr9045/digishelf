from celery import shared_task
from . import models
import json, os
from reloady import urls, reloady
from dotenv import load_dotenv

load_dotenv()

@shared_task
def make_api_requests(product_data_request,index, transaction_data, transaction_id):
    transaction_ = models.GiftCardTransaction.objects.get(pk=transaction_id)
    reloady_object = reloady.Reloady(os.getenv("api_clien"), os.getenv("api_client_secret"), urls.token_url)
    audience = "https://giftcards-sandbox.reloadly.com"

    data = {
        "productId": product_data_request["productId"],
        "quantity": product_data_request["quantity"],
        "unitPrice": product_data_request["recipientAmount"],
        "customIdentifier": f"{transaction_data.get('reference')}_{index}",
        "senderName": "DigiShelf",
        "preOrder": False
    }
    result = reloady_object.make_api_request(urls.gift_card_order, "application/com.reloadly.giftcards-v1+json", audience, "POST", data)
    
    if result:
        transaction_product, created = models.TransactionProduct.objects.update_or_create(
            transactionId=result.get("transactionId"),
            defaults={
                'GiftCardTransaction': transaction_,
                'transactionId':result.get("transactionId"),
                'amount': result.get("amount"),
                'discount': result.get("discount"),
                'currencyCode': result.get('currencyCode'),
                'fee': result.get('fee'),
                'status': result.get("status"),
                'product': json.dumps(result.get("product")),
                'transaction_created_at': result.get("transactionCreatedTime")
            }
        )

        if result.get("status") == "SUCCESSFUL":
            # Get redeem code
            response = reloady_object.make_api_request(
                urls.get_giftcard_redeem_code(result.get("transactionId")),
                "application/com.reloadly.giftcards-v1+json",
                audience
            )       
            if response:
                models.TransactionProduct.objects.filter(transactionId=result.get("transactionId")).update(redeem_card_number=response[0].get("cardNumber"), redeem_card_pin=response[0].get("pinCode"))
                
    return "done"
    