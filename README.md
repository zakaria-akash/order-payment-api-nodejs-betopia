# Order & Payment API

A simple Node.js API that handles user orders and payments, enforcing strict OTP verification via Email before processing transactions. This project demonstrates the integration of MongoDB for persistence and Redis for caching and temporary security tokens.

## 🚀 Technology Stack
- **Runtime:** Node.js with Express
- **Database:** MongoDB (Mongoose)
- **Caching & Session:** Redis
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer (Gmail SMTP)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB running (Local or Atlas)
- Redis running (Local or Cloud)
- A Gmail account with an **App Password** generated (for sending emails)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
1. Create a `.env` file in the root directory (copy from `.env.example`).
2. Fill in your credentials:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/order_payment_db
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret_key
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   ```

### Running the App
- **Development Mode:**
  ```bash
  npm run dev
  ```
- **Production Start:**
  ```bash
  npm start
  ```

## 🔐 How OTP Works
The One-Time Password (OTP) system ensures secure payments through the following flow:

1.  **Request:** User calls `POST /otp/request` with an `orderId`.
    *   System generates a random 6-digit code.
    *   Code is stored in **Redis** with a **2-minute expiry**.
    *   Code is sent to the user's registered email via Nodemailer.
2.  **Verify:** User calls `POST /otp/verify` with the code.
    *   System checks Redis.
    *   If valid, the OTP is deleted immediately to prevent reuse.
    *   A "verified" flag is set in Redis for that specific order (valid for 5 minutes).
3.  **Payment:** User calls `POST /payments/pay`.
    *   System checks for the "verified" flag in Redis.
    *   If found, payment proceeds. If missing, payment is rejected.

## 💾 Database Usage

### MongoDB
Used as the primary persistent storage for the application.
- **Users Collection:** Stores user credentials (email and hashed passwords).
- **Orders Collection:** Stores order details (Amount, Status, User ID).
  - Statuses: `PENDING`, `PAID`, `FAILED`.

### Redis
Used for temporary storage, security tokens, and performance optimization.
1.  **OTP Storage:** Stores the 6-digit OTP code (`TTL: 120s`).
2.  **Verification State:** Stores a flag indicating an order is ready for payment (`TTL: 300s`).
3.  **Response Caching:** Caches the output of `GET /orders/my` (`TTL: 60s`).
    - Cache is automatically cleared (invalidated) when a payment is processed to ensure the user sees the updated order status immediately.

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and get JWT | No |
| `POST` | `/orders` | Create a new order | Yes |
| `GET` | `/orders/my` | Get user orders (Cached) | Yes |
| `POST` | `/otp/request` | Request OTP for an order | Yes |
| `POST` | `/otp/verify` | Verify the OTP code | Yes |
| `POST` | `/payments/pay` | Complete payment (Requires OTP) | Yes |

## 🧪 Testing (Example Flow)

```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"yourgmail@gmail.com","password":"Passw0rd!"}'

# Login to get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yourgmail@gmail.com","password":"Passw0rd!"}' | jq -r .token)

# Create order (PENDING)
ORDER_ID=$(curl -s -X POST http://localhost:4000/orders \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"amount":2500}' | jq -r '._id')

# Request OTP (check your Gmail)
curl -X POST http://localhost:4000/otp/request \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}"

# Verify OTP (replace 123456 with real code)
curl -X POST http://localhost:4000/otp/verify \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\",\"otp\":\"123456\"}"

# Pay
curl -X POST http://localhost:4000/payments/pay \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"orderId\":\"$ORDER_ID\"}"
```