NestJS Backend with TypeORM, JWT Auth, and Wallet System
========================================================

📝 Overview
-----------

This is a comprehensive NestJS backend application featuring:

-   MySQL database integration with TypeORM

-   JWT authentication system

-   Google OAuth 2.0 integration

-   Complete wallet management system

-   Transaction history tracking

-   RESTful API endpoints with proper validation

🚀 Features
-----------

### 🔐 Authentication System

-   **User Registration** with email verification

-   **Login/Logout** functionality

-   **Password Reset** flow (forgot password + reset)

-   **Google OAuth** integration

-   JWT token-based authentication

-   Secure password hashing with bcrypt

### 💰 Wallet Management

-   **Check balance**

-   **Add funds** to wallet

-   **Withdraw funds** from wallet

-   **Transfer funds** between users

-   **Transaction history** with filtering

-   **Transaction details** view

📋 API Endpoints
----------------

### Authentication Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/forget-password` | Initiate password reset |
| POST | `/auth/reset-password` | Complete password reset |
| GET | `/auth/google/url` | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | Google OAuth callback endpoint |

### Wallet Endpoints (All require authentication)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/wallet/balance` | Get current wallet balance |
| POST | `/wallet/fund` | Add funds to wallet |
| POST | `/wallet/withdraw` | Withdraw funds from wallet |
| POST | `/wallet/transfer` | Transfer funds to another user |

### Transaction Endpoints (All require authentication)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/transactions` | Get all user transactions |
| GET | `/transactions/:id` | Get specific transaction details |

⚙️ Environment Variables
------------------------

Create a `.env` file in the root directory:

env

Copy

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=wallet_app

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
JWT_REFRESH_SECRET=refresh-secret-key
TOKEN_EXPIRY_TIME=90d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Email (for password reset)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password


# App
FRONTEND_URL=http://localhost:5173

🛠 Installation & Setup
-----------------------

1.  Clone the repository:

    bash

    Copy

    git clone https://github.com/davidwale/wallet-system-srv.git
    cd credpal-server

2.  Install dependencies:

    bash

    Copy

    npm install

3.  Set up MySQL database:

    sql

    Copy

    CREATE DATABASE db_name;

4.  Run migrations:

    bash

    Copy

    npm run migration:run

5.  Start the development server:

    bash

    Copy

    npm run start:dev

📦 Dependencies
---------------

### Core Dependencies

-   `@nestjs/core`

-   `@nestjs/common`

-   `typeorm`

-   `mysql2`

-   `@nestjs/jwt`

-   `passport`

-   `passport-jwt`

-   `passport-google-oauth20`

-   `bcrypt`

-   `class-validator`

-   `class-transformer`

### Development Dependencies

-   `@nestjs/cli`

-   `@nestjs/testing`

-   `@types/passport-jwt`

-   `@types/passport-google-oauth20`

-   `@types/bcrypt`

📄 Request/Response Examples
----------------------------

### Register User

**Request:**

json

Copy

POST /auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

**Response:**

json

Copy

{
    "status": true,
    "message": "Account Registered Successfully",
    "data": null
}

### Check Wallet Balance

**Request:**

Copy

GET /wallet/balance
Authorization: Bearer <JWT_TOKEN>

**Response:**

json

Copy

{
    "status": false,
    "message": "Balance Retrieved Successfully",
    "data": {
        "balance": "400.02",
        "walletId": "9521562490"
    }
}

### Transfer Funds

**Request:**

json

Copy

POST /wallet/transfer
Authorization: Bearer <JWT_TOKEN>
{
  "recipientWalletId": "454567997",
  "amount": 100.00,
  "description": "Dinner bill"
}

**Response:**

json

Copy

{
    "id": "1fe3e9bc-6960-4790-9f91-bf824a9ad9ae",
    "amount": 2000,
    "type": "transfer",
    "status": "pending",
    "description": null,
    "recipientWalletId": 565960690,
    "timestamp": "2025-04-09T23:15:34.156Z",
    "user": {
        "id": "87b08356-4db0-42e3-b57e-0e83e39a1cd3"
    },
    "wallet": {
        "id": "73e419b2-26f5-46ef-80a4-5c91c1cb71f1"
    }

🔒 Security Features
--------------------

-   All sensitive routes protected with JWT authentication

-   Password hashing with bcrypt

-   HTTPS recommended for production

-   Rate limiting implemented

-   Input validation on all endpoints

-   Secure HTTP headers

-   CSRF protection for web routes

