# DOCKER DEPLOYMENT FIX

## Issue
The `emergentintegrations` library is a private package that requires special configuration.

## Solution 1: Use Private Package Index (Recommended)

The Dockerfile has been updated to include the private package index. Simply rebuild:

```bash
# Stop existing containers
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache backend

# Start services
docker-compose up -d
```

## Solution 2: Use Standard Stripe SDK (Alternative)

If the private index is not accessible, use the standard Stripe library instead:

### Step 1: Update requirements.txt

Replace in `/app/backend/requirements.txt`:
```
# Remove or comment out:
# emergentintegrations==0.1.0

# Add:
stripe==7.0.0
```

### Step 2: Update server.py imports

Replace the Stripe import section in `/app/backend/server.py`:

```python
# OLD:
# from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# NEW:
import stripe
```

### Step 3: Update Stripe functions

The Stripe payment functions will need to be rewritten to use the standard SDK. Would you like me to provide the updated code?

## Solution 3: Remove Stripe Integration

If you only need Razorpay (India), you can remove Stripe completely:

1. Remove `emergentintegrations` from requirements.txt
2. Remove Stripe-related endpoints from server.py
3. Update frontend to only show Razorpay option

## Recommended Action

**For immediate deployment**, try Solution 1 first:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

If that doesn't work due to network/access issues, I can help you implement Solution 2 (standard Stripe SDK).

## Check Logs

After rebuilding, check if the build succeeded:

```bash
# Check build logs
docker-compose logs backend

# Check if backend is running
docker-compose ps
```

Let me know which solution you'd like to proceed with!