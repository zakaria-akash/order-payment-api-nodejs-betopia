# Beginner's Testing Guide
## Phase 1: Installation & Setup

### 1. Install Node.js
- Download and install from [nodejs.org](https://nodejs.org/).
- Verify by opening a terminal (Command Prompt/Terminal) and typing: `node -v`.

### 2. Set up MongoDB (Database)
- **Option A (Easiest):** Use MongoDB Atlas (Cloud).
  - Create a free account.
  - Create a cluster.
  - Get the connection string (looks like `mongodb+srv://...`).
- **Option B (Local):** Install MongoDB Community Server.
  - Run it locally. Connection string is usually `mongodb://localhost:27017/order_payment_db`.

### 3. Set up Redis (Cache)
- **Windows:** Redis is not natively supported.
  - **Option A (Recommended):** Use a free cloud Redis like Upstash.
  - **Option B:** Install via WSL (Windows Subsystem for Linux).
- **Mac/Linux:** Install via Homebrew (`brew install redis`) or package manager.
- **Verify:** Ensure you have a Redis URL (e.g., `redis://localhost:6379` or `rediss://...`).

### 4. Configure the Project
1.  Open the project folder in VS Code.
2.  Copy the file `.env.example` and rename it to `.env`.
3.  Open `.env` and fill in the details:
    - `MONGODB_URI`: Paste your connection string.
    - `REDIS_URL`: Paste your Redis URL.
    - `SMTP_USER` & `SMTP_PASS`: You need a Gmail App Password.
      - Go to Google Account > Security > 2-Step Verification > App Passwords.
      - Generate one and paste it in `SMTP_PASS`.

### 5. Install Dependencies & Start
1.  Open terminal in the project folder.
2.  Run: `npm install`
3.  Run: `npm run dev`
4.  You should see:
    ```
    ✅ MongoDB connected
    ✅ Redis connected
    🚀 Server running on http://localhost:4000
    ```

---

## Phase 2: Testing the API

We will simulate a user buying an item.

### Tool: Postman (Recommended for Beginners)
Download Postman.

#### Step 1: Register a User
1.  Click **New Request** (+).
2.  Method: **POST**.
3.  URL: `http://localhost:4000/auth/register`
4.  Body tab -> **raw** -> Select **JSON**.
5.  Paste:
    ```json
    {
      "email": "your_email@gmail.com",
      "password": "securePassword123"
    }
    ```
6.  Click **Send**.
7.  Response: `201 Created`.

#### Step 2: Login (Get Token)
1.  New Request -> Method: **POST**.
2.  URL: `http://localhost:4000/auth/login`
3.  Body -> raw -> JSON:
    ```json
    {
      "email": "your_email@gmail.com",
      "password": "securePassword123"
    }
    ```
4.  Click **Send**.
5.  **Copy the `token`** from the response (without quotes).

#### Step 3: Create an Order
1.  New Request -> Method: **POST**.
2.  URL: `http://localhost:4000/orders`
3.  **Authorization** tab -> Type: **Bearer Token**.
4.  Paste the token from Step 2.
5.  Body -> raw -> JSON:
    ```json
    { "amount": 2500 }
    ```
6.  Click **Send**.
7.  **Copy the `_id`** from the response (this is your `ORDER_ID`).

#### Step 4: Request OTP
1.  New Request -> Method: **POST**.
2.  URL: `http://localhost:4000/otp/request`
3.  Authorization -> Bearer Token -> Paste Token.
4.  Body -> raw -> JSON:
    ```json
    { "orderId": "PASTE_ORDER_ID_HERE" }
    ```
5.  Click **Send**.
6.  **Check your Email** for the 6-digit code.

#### Step 5: Verify OTP
1.  New Request -> Method: **POST**.
2.  URL: `http://localhost:4000/otp/verify`
3.  Authorization -> Bearer Token -> Paste Token.
4.  Body -> raw -> JSON:
    ```json
    {
      "orderId": "PASTE_ORDER_ID_HERE",
      "otp": "123456"
    }
    ```
    *(Replace "123456" with the code from email)*.
5.  Click **Send**. Response: "OTP verified".

#### Step 6: Make Payment
1.  New Request -> Method: **POST**.
2.  URL: `http://localhost:4000/payments/pay`
3.  Authorization -> Bearer Token -> Paste Token.
4.  Body -> raw -> JSON:
    ```json
    { "orderId": "PASTE_ORDER_ID_HERE" }
    ```
5.  Click **Send**.
6.  Response: "Payment processed".

---

## Troubleshooting

- **Redis Client Error:** Ensure Redis is running. If on Windows, use a Cloud Redis URL in `.env`.
- **SMTP Error:** Ensure you are using an **App Password**, not your login password.
- **Token Error:** Tokens expire in 1 hour. Login again if you get "Unauthorized".