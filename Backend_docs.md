# GrainTrust AI: Backend Documentation 🌾🤖

GrainTrust AI is a high-trust agricultural marketplace that leverages **Gemini AI** for rice yield prediction and quality verification, integrated with a simulated **Interswitch Escrow** system to ensure secure, transparent transactions between farmers and mills.

## 🚀 Key Features
- **AI Field Scan**: Predicts rice yield and maturity from field photos.
- **AI Rice Visualization**: Generates professional marketplace imagery based on real field data.
- **Interswitch Escrow**: Secure payment locking and automated disbursement.
- **AI Quality Verification**: Scans rice grains upon delivery to trigger payment release.
- **Real-time Notifications**: Keeps all parties updated on transaction status.

---

## 🛠 Tech Stack
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **AI Engine**: Google Gemini (Multimodal)
- **Security**: JWT Authentication & Role-Based Access Control (RBAC)
- **Documentation**: Markdown / Postman-ready

---

## 🔑 Authentication
All protected routes require a **JWT Bearer Token** in the `Authorization` header.

| Endpoint | Method | Description | Role |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user | Any |
| `/api/auth/login` | `POST` | Login and receive JWT | Any |
| `/api/auth/profile` | `GET` | Get current user details | Auth Required |

---

## 🌾 Grain Management (Farmer Flow)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/grains/scan-field` | `POST` | AI analysis of field photo for yield prediction |
| `/api/grains/visualize` | `POST` | AI generation of professional grain imagery |
| `/api/grains` | `POST` | Create a new grain listing |
| `/api/grains` | `GET` | List all available grains (Marketplace) |
| `/api/grains/my-listings` | `GET` | List grains owned by the logged-in farmer |
| `/api/grains/:id` | `PUT` | Update a grain listing |
| `/api/grains/:id` | `DELETE` | Delete a grain listing |

---

## 💰 Escrow & Payments (Mill Flow)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/escrow/fund/:grainId` | `POST` | Lock funds in Interswitch Escrow |
| `/api/escrow/verify/:grainId` | `POST` | AI Quality Scan of delivered grains |
| `/api/escrow/disburse/:grainId` | `POST` | Release funds to Farmer's bank account |
| `/api/escrow/my-escrows` | `GET` | View active escrow transactions |

---

## 🔔 Notifications

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/notifications` | `GET` | Get all user notifications |
| `/api/notifications/:id/read` | `PUT` | Mark a notification as read |

---

## 🔄 The "Golden Path" Workflow (Step-by-Step)

### Phase 1: The Farmer (Field to Market)
1. **Scan Field**: Farmer uploads a photo of their rice field to `/api/grains/scan-field`. AI returns a yield prediction (e.g., 15 tons).
2. **Visualize**: Farmer calls `/api/grains/visualize` with their field photo. AI generates a professional photo of the grains.
3. **List**: Farmer calls `POST /api/grains` combining the yield data and the AI image to create a listing.

### Phase 2: The Mill (Purchase & Escrow)
4. **Fund**: A Mill finds the listing and calls `/api/escrow/fund/:id`. Money is secured via Interswitch.
5. **Verify**: Upon delivery, the Mill calls `/api/escrow/verify/:id` with a photo of the actual grains. AI confirms quality.
6. **Disburse**: Once verified, the Mill calls `/api/escrow/disburse/:id`. Funds are moved to the Farmer's account.

---

## 🛡 Security & Validation
- **RBAC**: Only `farmer` roles can list grains; only `mill` roles can fund/verify escrows.
- **AI Integrity**: Every transaction is backed by verifiable AI analysis data stored in the database.
- **Error Handling**: Comprehensive error reporting for AI quotas, auth failures, and invalid state transitions.

---
*Developed for GrainTrust AI - Revolutionizing Agricultural Trust.*
