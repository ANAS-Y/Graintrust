# 🌾 GrainTrust AI: Securing the Rice Supply Chain

**GrainTrust AI** is a full-stack Agri-FinTech platform designed to bridge the trust gap between smallholder farmers and grain mills in Nigeria. By combining **AI-powered quality verification** with **secure Interswitch escrow payments**, we ensure transparent, fair, and efficient trading.

[![Demo](https://img.shields.io/badge/Demo-Live_Preview-4A90E2?style=for-the-badge)](https://ais-pre-3or2ms6ssjuwvldizpjspa-379472719793.europe-west2.run.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 🧠 The Problem & Our Solution

### The Trust Gap
*   **Farmers:** Fear shipping produce without payment guarantee; lack access to fair market pricing.
*   **Millers:** Fear paying for sub-standard grains; struggle with manual quality verification.

### Our Solution
*   **AI Quality Scan:** Uses Google Gemini to analyze grain moisture, grade, and impurities from a simple photo.
*   **Interswitch Escrow:** Funds are secured by a trusted third party and only released when the AI confirms quality matches the listing.
*   **Yield Prediction:** Farmers can scan their fields to get AI-driven harvest estimates.

---

## 🚀 Core Features

### 👨‍🌾 For Farmers
*   **AI Field Scan:** Predict harvest yields using satellite/field imagery analysis.
*   **Smart Listings:** Create listings with AI-enhanced visuals and verified quality metrics.
*   **Payment Security:** Real-time notifications when a miller funds an escrow for your produce.

### 🏭 For Millers
*   **Direct Sourcing:** Browse verified listings directly from local farmers.
*   **Escrow Funding:** Secure produce instantly by locking funds in a digital escrow.
*   **On-Site Verification:** Scan grains upon delivery to trigger automatic payment release.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Motion (Animations) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **AI/ML** | Google Gemini API (Vision & Pro) |
| **Auth** | JWT (JSON Web Tokens), bcrypt.js |
| **Payments** | Interswitch API (Sandbox Integration) |

---

## 📁 Project Structure

```text
graintrust-ai/
├── src/
│   ├── api/            # Axios configuration & interceptors
│   ├── components/     # Reusable UI (Navbar, ProtectedRoute)
│   ├── context/        # AuthContext for global state
│   ├── pages/          # Farmer & Mill Dashboards, Auth pages
│   └── server/         # Express Backend
│       ├── controllers/# Business logic (Escrow, AI, Auth)
│       ├── models/     # Mongoose Schemas (Grain, Escrow, User)
│       ├── routes/     # API Endpoints
│       └── services/   # AI Integration (Gemini SDK)
└── package.json        # Dependencies & Scripts
```
---

## 📡 API Documentation (Key Endpoints)

### Authentication
*   `POST /api/auth/register` - Create a new Farmer or Mill account.
*   `POST /api/auth/login` - Authenticate and receive JWT.

### Grain Management
*   `GET /api/grains` - List all available grains (Mill view).
*   `POST /api/grains` - Create a new listing (Farmer view).
*   `POST /api/grains/scan-field` - AI yield prediction.

### Escrow & Payments
*   `POST /api/escrow/fund/:grainId` - Mill secures produce by funding escrow.
*   `POST /api/escrow/verify/:grainId` - AI quality check upon delivery.
*   `POST /api/escrow/disburse/:grainId` - Release funds to farmer bank account.

---

## ⚙️ Setup & Installation

1.  **Clone the Repository**
    ```bash

    git clone https://github.com/HARDECOMM/Graintrust.git

    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root:

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key
    
    # Secure random string for JWT signing 
    JWT_SECRET=strong_random_jwt
    
    # Google Gemini API Key (For AI features)
    GEMINI_API_KEY=your_google_gemini_api_key

    # Interswitch Configuration
    INTERSWITCH_CLIENT_ID=interswitch_client_id
    INTERSWITCH_CLIENT_SECRET=client_secrete
    INTERSWITCH_MERCHANT_CODE=merchant_code
    INTERSWITCH_TERMINAL_ID=terminal_id
    INTERSWITCH_WEBHOOK_SECRET=interswitch_webhook
    ```

4.  **Run the Application**
    ```bash
    npm run dev
    ```

---

## 💳 Real Interswitch Integration Guide

To move from the current simulation to a **Live Interswitch Integration**, follow these steps:

### 1. Requirements
*   **Merchant Account:** Register at [Interswitch Quickteller Business](https://business.quickteller.com/).
*   **API Credentials:** Obtain your `Client ID`, `Client Secret`, and `Terminal ID`.
*   **Certificate:** For production, you'll need an SSL certificate and potentially a signed request header (Interswitch Auth v2).

### 2. Implementation Steps
1.  **Authentication:** Implement the OAuth2 Client Credentials flow to get an `access_token`.
2.  **Payment Initiation:** Use the `POST /payments` endpoint to generate a payment URL or trigger a USSD/Card prompt.
3.  **Escrow Logic:** 
    *   Use the **Split Payments** feature. 
    *   Initiate the payment with the full amount.
    *   Keep the funds in the Interswitch "Settlement Account" until the verification trigger.
4.  **Disbursement:** Use the **Transfer API** to move funds from the settlement account to the farmer's verified bank account.
5.  **Webhooks:** Set up an endpoint (e.g., `/api/payments/webhook`) to listen for `TRANSACTION_SUCCESS` events from Interswitch.

---

## 👨‍💻 Author

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
