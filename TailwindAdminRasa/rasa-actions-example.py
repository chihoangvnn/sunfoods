"""
RASA Action: Check Customer by Facebook PSID Before Asking Phone

📋 USAGE INSTRUCTIONS:
1. Copy this code into your RASA bot's actions.py file
2. Update the API_BASE_URL to your backend URL
3. Add this action to your domain.yml
4. Use in stories/rules to check customer before asking phone

📌 WORKFLOW:
Bot receives message → Extract PSID → Call API → If found: skip phone question → If not found: ask phone
"""

import requests
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

# 🔧 CONFIGURATION
API_BASE_URL = "https://your-backend-url.replit.dev"  # Update this to your actual backend URL


class ActionCheckExistingCustomer(Action):
    """
    Check if customer exists by Facebook PSID before asking for phone number
    
    This action:
    1. Extracts PSID from sender_id
    2. Calls backend API to check if customer exists
    3. Sets customer slots if found
    4. Returns flag to skip phone question if customer exists
    """
    
    def name(self) -> Text:
        return "action_check_existing_customer"
    
    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        # 1️⃣ EXTRACT PSID FROM SENDER
        sender_id = tracker.sender_id
        
        if not sender_id:
            print("❌ No sender_id found")
            return [
                SlotSet("customer_found", False),
                SlotSet("customer_id", None),
                SlotSet("customer_name", None),
                SlotSet("customer_phone", None)
            ]
        
        print(f"🔍 Checking customer by PSID: {sender_id}")
        
        # 2️⃣ CALL BACKEND API
        try:
            api_url = f"{API_BASE_URL}/api/rasa/customer-by-psid/{sender_id}"
            response = requests.get(api_url, timeout=5)
            
            if response.status_code != 200:
                print(f"❌ API error: {response.status_code}")
                return [SlotSet("customer_found", False)]
            
            data = response.json()
            
            # 3️⃣ CUSTOMER FOUND - SET SLOTS
            if data.get("found") and data.get("customer"):
                customer = data["customer"]
                
                print(f"✅ Customer found: {customer.get('name')} ({customer.get('id')})")
                
                # Welcome back message
                customer_name = customer.get("name", "bạn")
                dispatcher.utter_message(text=f"Chào {customer_name}! Em nhận ra bạn rồi ạ 😊")
                
                return [
                    SlotSet("customer_found", True),
                    SlotSet("customer_id", customer.get("id")),
                    SlotSet("customer_name", customer.get("name")),
                    SlotSet("customer_phone", customer.get("phone")),
                    SlotSet("customer_email", customer.get("email"))
                ]
            
            # 4️⃣ CUSTOMER NOT FOUND
            else:
                print(f"❌ No customer found for PSID: {sender_id}")
                dispatcher.utter_message(text="Chào bạn! Để em hỗ trợ tốt hơn, bạn cho em xin số điện thoại nhé 📱")
                
                return [
                    SlotSet("customer_found", False),
                    SlotSet("customer_id", None),
                    SlotSet("customer_name", None),
                    SlotSet("customer_phone", None)
                ]
        
        except requests.exceptions.RequestException as e:
            print(f"❌ API request failed: {str(e)}")
            dispatcher.utter_message(text="Chào bạn! Để em hỗ trợ tốt hơn, bạn cho em xin số điện thoại nhé 📱")
            
            return [SlotSet("customer_found", False)]


class ActionProcessPhoneNumber(Action):
    """
    Process phone number when customer provides it (for new customers)
    """
    
    def name(self) -> Text:
        return "action_process_phone_number"
    
    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        # Get phone number from user message
        phone = tracker.latest_message.get('text', '').strip()
        
        # Basic Vietnamese phone validation
        phone = phone.replace(" ", "").replace(".", "").replace("-", "")
        
        if not phone.startswith('0') or len(phone) != 10:
            dispatcher.utter_message(text="Số điện thoại không hợp lệ ạ. Bạn vui lòng nhập lại số điện thoại 10 chữ số nhé (VD: 0912345678)")
            return []
        
        # Save phone to slot
        dispatcher.utter_message(text=f"Cảm ơn bạn! Em đã lưu số điện thoại {phone} ạ 📝")
        
        return [
            SlotSet("customer_phone", phone),
            SlotSet("phone_validated", True)
        ]


"""
📝 DOMAIN.YML CONFIGURATION:

slots:
  customer_found:
    type: bool
    initial_value: false
    influence_conversation: true
    
  customer_id:
    type: text
    initial_value: null
    
  customer_name:
    type: text
    initial_value: null
    
  customer_phone:
    type: text
    initial_value: null
    
  customer_email:
    type: text
    initial_value: null
    
  phone_validated:
    type: bool
    initial_value: false

actions:
  - action_check_existing_customer
  - action_process_phone_number


📝 STORIES.YML EXAMPLE:

stories:
  - story: check existing customer at start
    steps:
      - intent: greet
      - action: action_check_existing_customer
      - slot_was_set:
        - customer_found: true
      - action: utter_ask_order
  
  - story: new customer needs phone
    steps:
      - intent: greet
      - action: action_check_existing_customer
      - slot_was_set:
        - customer_found: false
      - action: utter_ask_phone
      - intent: provide_phone
      - action: action_process_phone_number


📝 RULES.YML EXAMPLE:

rules:
  - rule: check customer on conversation start
    steps:
      - intent: greet
      - action: action_check_existing_customer
  
  - rule: skip phone if customer found
    condition:
      - slot_was_set:
        - customer_found: true
    steps:
      - action: utter_welcome_back
  
  - rule: ask phone if customer not found
    condition:
      - slot_was_set:
        - customer_found: false
    steps:
      - action: utter_ask_phone


📝 NLU.YML EXAMPLE:

nlu:
  - intent: greet
    examples: |
      - chào
      - hello
      - hi
      - xin chào
      - chào shop
  
  - intent: provide_phone
    examples: |
      - 0912345678
      - 0987654321
      - sdt 0912345678
      - số của em là 0912345678
      - 091 234 5678
"""
