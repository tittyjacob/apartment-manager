from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', '')))

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    flat_number: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str
    flat_number: Optional[str] = None
    phone: Optional[str] = None
    is_super_admin: bool = False
    approved: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Flat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    flat_number: str
    owner_name: str
    owner_email: str
    owner_phone: str
    flat_size: str
    custom_charge: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FlatCreate(BaseModel):
    flat_number: str
    owner_name: str
    owner_email: str
    owner_phone: str
    flat_size: str
    custom_charge: Optional[float] = None

class MonthlyCharge(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: int
    year: int
    base_charge: float
    breakdown: Dict[str, float]
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MonthlyChargeCreate(BaseModel):
    month: int
    year: int
    base_charge: float
    breakdown: Dict[str, float]

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    flat_id: str
    flat_number: str
    month: int
    year: int
    amount: float
    payment_date: str
    payment_method: str
    receipt_number: str
    status: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PaymentCreate(BaseModel):
    flat_id: str
    month: int
    year: int
    amount: float
    payment_method: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    flat_id: str
    month: int
    year: int
    amount: float
    currency: str
    payment_status: str
    metadata: Optional[Dict] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CheckoutRequest(BaseModel):
    flat_id: str
    month: int
    year: int
    origin_url: str

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    hashed_pw = hash_password(user_dict.pop('password'))
    user_dict['password_hash'] = hashed_pw
    
    # Check if this is the first admin
    is_first_admin = False
    approved = True
    if user_data.role == 'admin':
        admin_count = await db.users.count_documents({"role": "admin"})
        if admin_count == 0:
            is_first_admin = True
        else:
            approved = False
    
    user_dict['is_super_admin'] = is_first_admin
    user_dict['approved'] = approved
    user_obj = User(**{k: v for k, v in user_dict.items() if k in User.model_fields})
    
    doc = user_obj.model_dump()
    doc['password_hash'] = hashed_pw
    await db.users.insert_one(doc)
    
    if user_data.role == 'admin' and not approved:
        return {
            "message": "Registration successful. Your admin account is pending approval from the super admin.",
            "pending_approval": True
        }
    
    token = create_token(user_obj.id, user_obj.email, user_obj.role)
    return {"token": token, "user": user_obj.model_dump()}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    user.pop('password_hash', None)
    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Flats Routes
@api_router.get("/flats", response_model=List[Flat])
async def get_flats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'resident':
        user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
        flats = await db.flats.find({"flat_number": user.get('flat_number')}, {"_id": 0}).to_list(1000)
    else:
        flats = await db.flats.find({}, {"_id": 0}).to_list(1000)
    return flats

@api_router.post("/flats", response_model=Flat)
async def create_flat(flat_data: FlatCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.flats.find_one({"flat_number": flat_data.flat_number}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Flat number already exists")
    
    flat_obj = Flat(**flat_data.model_dump())
    await db.flats.insert_one(flat_obj.model_dump())
    return flat_obj

@api_router.put("/flats/{flat_id}", response_model=Flat)
async def update_flat(flat_id: str, flat_data: FlatCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    updated_data = flat_data.model_dump()
    result = await db.flats.update_one({"id": flat_id}, {"$set": updated_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flat not found")
    
    flat = await db.flats.find_one({"id": flat_id}, {"_id": 0})
    return flat

@api_router.delete("/flats/{flat_id}")
async def delete_flat(flat_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.flats.delete_one({"id": flat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flat not found")
    return {"message": "Flat deleted successfully"}

# Monthly Charges Routes
@api_router.get("/charges", response_model=List[MonthlyCharge])
async def get_charges(current_user: dict = Depends(get_current_user)):
    charges = await db.monthly_charges.find({}, {"_id": 0}).sort("year", -1).sort("month", -1).to_list(1000)
    return charges

@api_router.post("/charges", response_model=MonthlyCharge)
async def create_charge(charge_data: MonthlyChargeCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.monthly_charges.find_one(
        {"month": charge_data.month, "year": charge_data.year}, {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Charges for this month already exist")
    
    charge_obj = MonthlyCharge(**charge_data.model_dump())
    await db.monthly_charges.insert_one(charge_obj.model_dump())
    return charge_obj

# Payments Routes
@api_router.get("/payments", response_model=List[Payment])
async def get_payments(current_user: dict = Depends(get_current_user), flat_id: Optional[str] = None):
    query = {}
    if current_user['role'] == 'resident':
        user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
        flat = await db.flats.find_one({"flat_number": user.get('flat_number')}, {"_id": 0})
        if flat:
            query["flat_id"] = flat['id']
    elif flat_id:
        query["flat_id"] = flat_id
    
    payments = await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return payments

@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    flat = await db.flats.find_one({"id": payment_data.flat_id}, {"_id": 0})
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")
    
    receipt_number = f"REC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    payment_obj = Payment(
        **payment_data.model_dump(),
        flat_number=flat['flat_number'],
        payment_date=datetime.now(timezone.utc).isoformat(),
        receipt_number=receipt_number,
        status="paid"
    )
    await db.payments.insert_one(payment_obj.model_dump())
    return payment_obj

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_flats = await db.flats.count_documents({})
    total_payments = await db.payments.count_documents({"status": "paid"})
    
    payments_list = await db.payments.find({"status": "paid"}, {"_id": 0}).to_list(10000)
    total_collected = sum(p['amount'] for p in payments_list)
    
    current_month = datetime.now(timezone.utc).month
    current_year = datetime.now(timezone.utc).year
    current_charge = await db.monthly_charges.find_one(
        {"month": current_month, "year": current_year}, {"_id": 0}
    )
    
    paid_flats = await db.payments.distinct("flat_id", 
        {"month": current_month, "year": current_year, "status": "paid"})
    pending_count = total_flats - len(paid_flats)
    
    base_charge = current_charge['base_charge'] if current_charge else 0
    pending_amount = pending_count * base_charge
    
    recent_payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_flats": total_flats,
        "total_collected": total_collected,
        "pending_dues": pending_amount,
        "pending_count": pending_count,
        "recent_payments": recent_payments
    }

@api_router.get("/dashboard/resident")
async def get_resident_dashboard(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user or not user.get('flat_number'):
        raise HTTPException(status_code=404, detail="Flat not found for user")
    
    flat = await db.flats.find_one({"flat_number": user['flat_number']}, {"_id": 0})
    if not flat:
        raise HTTPException(status_code=404, detail="Flat details not found")
    
    current_month = datetime.now(timezone.utc).month
    current_year = datetime.now(timezone.utc).year
    
    current_charge = await db.monthly_charges.find_one(
        {"month": current_month, "year": current_year}, {"_id": 0}
    )
    
    due_amount = flat.get('custom_charge') or (current_charge['base_charge'] if current_charge else 0)
    
    payment = await db.payments.find_one(
        {"flat_id": flat['id'], "month": current_month, "year": current_year, "status": "paid"},
        {"_id": 0}
    )
    
    payments_history = await db.payments.find(
        {"flat_id": flat['id']}, {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "flat": flat,
        "current_due": due_amount,
        "payment_status": "paid" if payment else "pending",
        "payment_history": payments_history,
        "current_charge_breakdown": current_charge.get('breakdown', {}) if current_charge else {}
    }

# Stripe Payment Routes
@api_router.post("/payments/checkout")
async def create_checkout_session(checkout_req: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    flat = await db.flats.find_one({"id": checkout_req.flat_id}, {"_id": 0})
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")
    
    charge = await db.monthly_charges.find_one(
        {"month": checkout_req.month, "year": checkout_req.year}, {"_id": 0}
    )
    if not charge:
        raise HTTPException(status_code=404, detail="Charges not set for this month")
    
    amount = flat.get('custom_charge') or charge['base_charge']
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    webhook_url = f"{checkout_req.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    success_url = f"{checkout_req.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/dashboard"
    
    metadata = {
        "flat_id": checkout_req.flat_id,
        "month": str(checkout_req.month),
        "year": str(checkout_req.year),
        "user_id": current_user['user_id']
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    transaction = PaymentTransaction(
        session_id=session.session_id,
        flat_id=checkout_req.flat_id,
        month=checkout_req.month,
        year=checkout_req.year,
        amount=amount,
        currency="usd",
        payment_status="pending",
        metadata=metadata
    )
    await db.payment_transactions.insert_one(transaction.model_dump())
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, current_user: dict = Depends(get_current_user)):
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    if checkout_status.payment_status == "paid" and transaction['payment_status'] != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid"}}
        )
        
        existing_payment = await db.payments.find_one(
            {"flat_id": transaction['flat_id'], "month": transaction['month'], 
             "year": transaction['year'], "status": "paid"},
            {"_id": 0}
        )
        
        if not existing_payment:
            flat = await db.flats.find_one({"id": transaction['flat_id']}, {"_id": 0})
            receipt_number = f"REC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
            
            payment = Payment(
                flat_id=transaction['flat_id'],
                flat_number=flat['flat_number'],
                month=transaction['month'],
                year=transaction['year'],
                amount=transaction['amount'],
                payment_date=datetime.now(timezone.utc).isoformat(),
                payment_method="stripe",
                receipt_number=receipt_number,
                status="paid"
            )
            await db.payments.insert_one(payment.model_dump())
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount": checkout_status.amount_total / 100,
        "currency": checkout_status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Razorpay Payment Routes
class RazorpayOrderRequest(BaseModel):
    flat_id: str
    month: int
    year: int

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    flat_id: str
    month: int
    year: int

@api_router.post("/payments/razorpay/create-order")
async def create_razorpay_order(order_req: RazorpayOrderRequest, current_user: dict = Depends(get_current_user)):
    flat = await db.flats.find_one({"id": order_req.flat_id}, {"_id": 0})
    if not flat:
        raise HTTPException(status_code=404, detail="Flat not found")
    
    charge = await db.monthly_charges.find_one(
        {"month": order_req.month, "year": order_req.year}, {"_id": 0}
    )
    if not charge:
        raise HTTPException(status_code=404, detail="Charges not set for this month")
    
    amount = flat.get('custom_charge') or charge['base_charge']
    amount_paise = int(amount * 100)
    
    try:
        razor_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "flat_id": order_req.flat_id,
                "month": str(order_req.month),
                "year": str(order_req.year),
                "user_id": current_user['user_id']
            }
        })
        
        transaction = PaymentTransaction(
            session_id=razor_order["id"],
            flat_id=order_req.flat_id,
            month=order_req.month,
            year=order_req.year,
            amount=amount,
            currency="INR",
            payment_status="pending",
            metadata={
                "flat_id": order_req.flat_id,
                "month": str(order_req.month),
                "year": str(order_req.year),
                "user_id": current_user['user_id']
            }
        )
        await db.payment_transactions.insert_one(transaction.model_dump())
        
        return {
            "order_id": razor_order["id"],
            "amount": amount_paise,
            "currency": "INR",
            "key_id": os.environ.get('RAZORPAY_KEY_ID')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments/razorpay/verify")
async def verify_razorpay_payment(verify_req: RazorpayVerifyRequest, current_user: dict = Depends(get_current_user)):
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': verify_req.razorpay_order_id,
            'razorpay_payment_id': verify_req.razorpay_payment_id,
            'razorpay_signature': verify_req.razorpay_signature
        })
        
        transaction = await db.payment_transactions.find_one(
            {"session_id": verify_req.razorpay_order_id}, {"_id": 0}
        )
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if transaction['payment_status'] == "paid":
            return {"status": "success", "message": "Payment already recorded"}
        
        await db.payment_transactions.update_one(
            {"session_id": verify_req.razorpay_order_id},
            {"$set": {"payment_status": "paid", "razorpay_payment_id": verify_req.razorpay_payment_id}}
        )
        
        existing_payment = await db.payments.find_one(
            {"flat_id": verify_req.flat_id, "month": verify_req.month, 
             "year": verify_req.year, "status": "paid"},
            {"_id": 0}
        )
        
        if not existing_payment:
            flat = await db.flats.find_one({"id": verify_req.flat_id}, {"_id": 0})
            receipt_number = f"REC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
            
            payment = Payment(
                flat_id=verify_req.flat_id,
                flat_number=flat['flat_number'],
                month=verify_req.month,
                year=verify_req.year,
                amount=transaction['amount'],
                payment_date=datetime.now(timezone.utc).isoformat(),
                payment_method="razorpay",
                receipt_number=receipt_number,
                status="paid"
            )
            await db.payments.insert_one(payment.model_dump())
        
        return {"status": "success", "message": "Payment verified and recorded"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    try:
        razorpay_client.utility.verify_webhook_signature(
            body.decode(),
            signature,
            os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
        )
        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()