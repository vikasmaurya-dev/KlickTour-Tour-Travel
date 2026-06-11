# ✈️ KlickTour - Travel & Tour Management Platform

KlickTour is a premium, full-stack Travel and Tour Management Platform designed to offer users an interactive, seamless, and AI-powered trip booking experience. The system is built with a React frontend (Vite), an Express backend, and a MongoDB database, integrating multiple external services like OpenTripMap APIs, Google/OpenAI AI services, and SMTP-based OTP mailing.

---

## 🌟 Key Features

### 👤 User Portal
- **AI-Powered Trip Planner**: Automatically generate personalized daily travel itineraries using Google Gemini or OpenAI GPT models.
- **Dynamic Search & Filtering**: Find tour packages, destinations, and hotels using dynamic criteria (budget, duration, stars, amenities, and location).
- **Comprehensive Bookings**: Register booking details for custom tour packages and hotels with full billing breakdowns (taxes, guest counts, and customized special requests).
- **Transportation Hub**: Seamless search, filtration, and reservation of transport routes (flights, buses, and trains) with seat availability.
- **Promo Code Discounts**: Redeem custom coupons to receive price reductions on checkout.
- **Secure OTP Authentication**: Hashed OTP codes sent via email for user registration, login verification (optional/bypassed for admins), and secure password recovery.
- **Personal Dashboard**: Manage personal profile parameters, track current bookings, and save desired locations to a Wishlist.

### 🛡️ Admin Dashboard (Command Center)
- **Interactive Analytics**: Visual graphs powered by Recharts indicating packages, bookings, earnings, and user registration activity.
- **Inventory CRUD**: Manage and update packages, destination catalogs, hotels, and transit routes.
- **Booking Management**: Confirm, reject, or update the lifecycle of user package and hotel bookings.
- **Audit Logs & Security**: Track admin activities and events with a secure database audit logger.
- **Client Communications**: Read, filter, and mark user contact form submissions.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, React Router, TailwindCSS, Custom CSS, Framer Motion, Leaflet Maps, Recharts, React Icons, Axios |
| **Backend** | Node.js, Express.js, MongoDB + Mongoose, JWT (jsonwebtoken), BcryptJS, express-rate-limit, Node-Cache |
| **Integrations** | Google Gemini API, OpenAI API, OpenTripMap API, Nodemailer (SMTP OTP Service) |

---

## 📁 Project Architecture

```text
d:/A/project 2
├── backend/                       # Node/Express API Server
│   ├── config/                    # Database configurations
│   ├── controllers/               # Route controllers (Auth, AI, Hotel, Package, Transportation)
│   ├── middleware/                # Rate limiters, JWT authorization, admin guards
│   ├── models/                    # MongoDB/Mongoose models
│   ├── routes/                    # API Route declarations
│   ├── services/                  # Business logic (AI Trip Planner, Hotel Catalog, Smart Images)
│   ├── utils/                     # Handlers (Email service, token generator, async handlers)
│   ├── seed.js                    # Database seed scripts
│   ├── server.js                  # Express App entry point
│   └── package.json
│
├── tour-website/                  # React Frontend Application (Vite)
│   ├── public/                    # Logos, icons, and static assets
│   ├── src/
│   │   ├── components/            # Shared components (Navbar, Footer, HotelCard, OtpVerify)
│   │   ├── context/               # AuthContext state management
│   │   ├── pages/                 # User views and Admin dashboard modules
│   │   ├── services/              # API Client instances (axios configuration)
│   │   ├── styles/                # Global style settings
│   │   ├── App.jsx                # Application Routing configuration
│   │   └── main.jsx               # Render mounting point
│   └── package.json
```

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Setup Backend
Go to the backend folder, install dependencies, and create the environment configuration:
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=tour-website
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

# Email OTP SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com

# External API Integrations
OPENTRIPMAP_API_KEY=your_opentripmap_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```
> 💡 *If SMTP parameters are omitted, OTP codes will be printed directly in the backend terminal console for development ease.*

#### Seed Database
Populate your database with sample packages, hotels, and transportation data:
```bash
# Seed standard tour packages, hotels and destinations
npm run seed

# Seed transportation/route catalog
npm run seed:transport
```

#### Start Backend server
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

---

### 2. Setup Frontend
Go to the frontend directory, install dependencies, and start the development server:
```bash
cd tour-website
npm install
npm run dev
```
The app will run on `http://localhost:5173`. Make sure the backend server is running in parallel.

---

## 🔒 Security Practices
- **Data Sanitization**: Prevents NoSQL injections using `express-mongo-sanitize`.
- **Rate Limiting**: Protects authentication/OTP endpoints from brute force requests using `express-rate-limit`.
- **JWT Protection**: Encrypted tokens passed via authorization headers to secure protected user and admin resource controllers.
- **Admin Guards**: Controller middleware checks for authenticated users and filters queries by role verification.
