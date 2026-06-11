# KlickTour Project Workflow

This document explains the complete project flow in a simple, step-by-step way. The project is a tour and travel web app with a React frontend, an Express backend, MongoDB database, OTP-based authentication, package booking, hotel search/booking, contact messages, and an admin dashboard.

## 1. Project Structure Flow

```text
D:\A\project 2
|
|-- backend
|   |-- server.js                 Main Express server entry
|   |-- config/db.js              MongoDB connection
|   |-- routes                    API route definitions
|   |-- controllers               Business logic for packages, destinations, hotels
|   |-- models                    MongoDB schemas
|   |-- middleware                JWT auth and admin protection
|   |-- utils/emailService.js     OTP email sending
|   |-- seed.js                   Seed demo package/destination/hotel data
|   |-- seedAdmin.js              Seed admin user
|
|-- tour-website
|   |-- src/App.jsx               Frontend route setup
|   |-- src/main.jsx              React app mount point
|   |-- src/context/AuthContext.jsx
|   |-- src/services/api.js       General backend API calls
|   |-- src/services/hotelApi.js  Hotel-specific API calls
|   |-- src/pages                 User and admin pages
|   |-- src/components            Shared UI components
|   |-- public                    Logos and icons
```

## 2. High-Level Application Flow

```text
User opens website
  -> React frontend loads from tour-website/src/main.jsx
  -> App.jsx sets up BrowserRouter, AuthProvider, Navbar, Routes, Footer
  -> AuthContext checks localStorage token
  -> If token exists, frontend calls GET /api/auth/me
  -> Backend verifies JWT and returns user profile
  -> User can browse packages, destinations, hotels, blog, about, and contact pages
```

Main project flow:

```text
Frontend UI
  -> API service layer
  -> Express backend routes
  -> Controller / route logic
  -> Mongoose model
  -> MongoDB database
  -> JSON response
  -> Frontend updates screen
```

## 3. Backend Startup Flow

Backend starts from:

```text
backend/server.js
```

Flow:

```text
npm run dev / npm start
  -> Load environment variables using dotenv
  -> Create Express app
  -> Enable CORS
  -> Enable JSON body parsing
  -> Connect MongoDB using config/db.js
  -> Register API routes
  -> Add 404 handler
  -> Add global error handler
  -> Start server on PORT or 5000
```

Registered backend routes:

```text
/api/auth          Authentication, OTP, profile
/api/packages      Tour package list and admin CRUD
/api/destinations  Destination list, filters, details, admin CRUD
/api/bookings      Tour package bookings
/api/hotels        Hotel search, details, admin CRUD, hotel booking
/api/contact       Contact form messages
```

## 4. Frontend Routing Flow

Frontend route file:

```text
tour-website/src/App.jsx
```

Routes:

```text
/                     Home page
/destinations         Destination listing
/destinations/:id     Destination/package detail page
/packages             Package listing
/packages/:id         Package detail page
/booking              Package booking page
/hotels               Hotel listing/search page
/hotels/:id           Hotel detail page
/hotels/:id/book      Hotel booking page
/about                About page
/blog                 Blog page
/contact              Contact form
/login                Login page
/register             Register page
/forgot-password      Password reset flow
/profile              Protected user profile
/admin/*              Protected admin dashboard
```

Protected routes:

```text
/profile
  -> Requires logged-in user
  -> If no user, redirects to /login

/admin/*
  -> Requires logged-in user with role admin
  -> If not admin, redirects to /login
```

## 5. Authentication And OTP Flow

Important files:

```text
Frontend:
tour-website/src/context/AuthContext.jsx
tour-website/src/pages/Login.jsx
tour-website/src/pages/Register.jsx
tour-website/src/pages/ForgotPassword.jsx
tour-website/src/components/OtpVerify.jsx

Backend:
backend/routes/authRoutes.js
backend/models/User.js
backend/models/Otp.js
backend/middleware/authMiddleware.js
backend/utils/emailService.js
```

### 5.1 Register Flow

```text
User opens /register
  -> Enters name, email, password
  -> Frontend calls POST /api/auth/register
  -> Backend validates required fields
  -> Backend checks if email already exists
  -> Backend hashes password
  -> Backend creates OTP record with purpose register
  -> Backend sends OTP by email
  -> Frontend shows OTP verification screen
  -> User enters OTP
  -> Frontend calls POST /api/auth/verify-register
  -> Backend checks OTP record
  -> Backend verifies hashed OTP
  -> Backend creates User in MongoDB
  -> Backend deletes OTP record
  -> Backend returns JWT token and user data
  -> Frontend stores token in localStorage
  -> User becomes logged in
  -> User is redirected to home
```

### 5.2 Login Flow

```text
User opens /login
  -> Enters email and password
  -> Frontend calls POST /api/auth/login
  -> Backend finds user by email
  -> Backend compares password using bcrypt
  -> If user role is admin:
       -> Backend directly returns JWT token
       -> No OTP required
  -> If user role is user:
       -> Backend creates login OTP
       -> Backend sends OTP by email
       -> Frontend shows OTP verification screen
       -> User enters OTP
       -> Frontend calls POST /api/auth/verify-login
       -> Backend verifies OTP
       -> Backend deletes OTP
       -> Backend returns JWT token and user data
  -> Frontend stores token
  -> User becomes logged in
```

### 5.3 Forgot Password Flow

```text
User opens /forgot-password
  -> Enters email
  -> Frontend calls POST /api/auth/forgot-password
  -> Backend checks user and creates reset OTP
  -> Backend sends OTP
  -> User enters OTP
  -> User enters new password
  -> Frontend calls POST /api/auth/reset-password
  -> Backend verifies OTP
  -> Backend updates user password
  -> User can login with new password
```

### 5.4 Token/Profile Flow

```text
After login/register
  -> Token saved in localStorage
  -> AuthContext loads on app start
  -> AuthContext calls GET /api/auth/me with Bearer token
  -> protect middleware verifies JWT
  -> Backend returns current user
```

## 6. Home Page Flow

Important file:

```text
tour-website/src/pages/Home.jsx
```

Flow:

```text
User opens /
  -> Home page loads
  -> Frontend fetches destinations and packages
  -> Shows hero/search, featured sections, cards, and CTA content
  -> Search navigates user toward /packages with query
  -> Cards link to package or destination detail pages
```

## 7. Package Browsing Flow

Important files:

```text
Frontend:
tour-website/src/pages/Packages.jsx
tour-website/src/pages/PackageDetails.jsx
tour-website/src/services/api.js

Backend:
backend/routes/packageRoutes.js
backend/controllers/packageController.js
backend/models/Package.js
```

Flow:

```text
User opens /packages
  -> Frontend calls GET /api/packages
  -> Backend reads Package collection
  -> Backend sorts by popularity
  -> Frontend displays packages
  -> User clicks package
  -> Frontend opens /packages/:id
  -> Frontend calls GET /api/packages/:id
  -> Backend returns selected package
  -> User clicks Book Now
  -> Frontend opens /booking?pkg=PACKAGE_ID
```

Package model fields:

```text
name
duration
image
price
rating
popularity
createdAt
updatedAt
```

## 8. Package Booking Flow

Important files:

```text
Frontend:
tour-website/src/pages/Booking.jsx
tour-website/src/services/api.js

Backend:
backend/routes/bookingRoutes.js
backend/models/Booking.js
```

Flow:

```text
User opens /booking?pkg=PACKAGE_ID
  -> Frontend reads pkg from URL
  -> Frontend calls GET /api/packages/:id
  -> Package price is loaded
  -> User enters full name, email, phone, travel date, travelers, requests
  -> User selects payment method
  -> Frontend calculates total price = package price * travelers
  -> User clicks Pay and Book
  -> Frontend calls POST /api/bookings
  -> Backend optionally reads JWT token if available
  -> Backend creates Booking record
  -> Booking status defaults to Pending
  -> Frontend shows success alert
  -> User is redirected to home
```

Booking status lifecycle:

```text
Pending
  -> Admin can change to Confirmed
  -> Admin can change to Cancelled
```

Booking model fields:

```text
userId
packageId
fullName
email
phone
travelDate
travelers
specialRequests
paymentMethod
totalPrice
status
createdAt
updatedAt
```

## 9. Destination Browsing Flow

Important files:

```text
Frontend:
tour-website/src/pages/Destinations.jsx
tour-website/src/pages/PackageDetails.jsx
tour-website/src/services/api.js

Backend:
backend/routes/destinationRoutes.js
backend/controllers/destinationController.js
backend/models/Destination.js
```

Flow:

```text
User opens /destinations
  -> Frontend calls GET /api/destinations
  -> Optional filters are passed: type, budget, duration
  -> Backend fetches DB destinations
  -> Backend also tries OpenTripMap external destinations if API key exists
  -> Backend merges DB and external data
  -> Backend applies filters
  -> Frontend displays destination cards
  -> User clicks destination
  -> Frontend opens /destinations/:id
  -> Frontend fetches details by ID
```

Destination filters:

```text
type: Adventure, Family, Luxury
budget: Low, Medium, High
duration: text value
```

Destination data sources:

```text
MongoDB Destination collection
OpenTripMap API if OPENTRIPMAP_API_KEY is configured
```

## 10. Hotel Search Flow

Important files:

```text
Frontend:
tour-website/src/pages/Hotels.jsx
tour-website/src/components/HotelCard.jsx
tour-website/src/services/hotelApi.js

Backend:
backend/routes/hotelRoutes.js
backend/controllers/hotelController.js
backend/models/Hotel.js
```

Flow:

```text
User opens /hotels
  -> Frontend calls GET /api/hotels
  -> Query can include destination, minPrice, maxPrice, stars
  -> Backend checks cache for destination search
  -> Backend fetches hotels from MongoDB by city
  -> Backend fetches external accommodation data from OpenTripMap if API key exists
  -> Backend enriches external data with price, rating, rooms, amenities, images
  -> Backend merges DB hotels and external hotels
  -> Backend applies price/star filters
  -> Frontend optionally filters amenities
  -> Frontend displays hotel cards
```

Hotel search filters:

```text
destination
minPrice
maxPrice
stars
amenities
```

Hotel data sources:

```text
MongoDB Hotel collection
OpenTripMap API if OPENTRIPMAP_API_KEY is configured
```

## 11. Hotel Details And Booking Flow

Important files:

```text
Frontend:
tour-website/src/pages/HotelDetails.jsx
tour-website/src/pages/HotelBooking.jsx
tour-website/src/services/hotelApi.js

Backend:
backend/routes/hotelRoutes.js
backend/controllers/hotelController.js
backend/models/HotelBooking.js
```

Hotel details flow:

```text
User clicks hotel card
  -> Frontend opens /hotels/:id
  -> Frontend calls GET /api/hotels/:id
  -> Backend checks if ID is MongoDB ID
  -> If MongoDB ID, backend returns DB hotel
  -> If external ID, backend fetches OpenTripMap details
  -> Frontend displays hotel images, amenities, rooms, price, and CTA
  -> User clicks reserve/book
  -> Frontend opens /hotels/:id/book
```

Hotel booking flow:

```text
User opens /hotels/:id/book
  -> Frontend loads selected hotel details
  -> User enters personal details
  -> User enters payment information
  -> Frontend calculates mock 5-night total and taxes
  -> User clicks Confirm and Pay
  -> Frontend calls POST /api/hotels/booking
  -> Backend creates reservation ID
  -> Backend saves HotelBooking
  -> Frontend shows booking confirmation screen
```

Hotel booking model fields:

```text
userId
hotelId
roomId
firstName
lastName
email
phone
requests
checkIn
checkOut
totalPrice
status
reservationId
createdAt
updatedAt
```

## 12. Contact Flow

Important files:

```text
Frontend:
tour-website/src/pages/Contact.jsx
tour-website/src/services/api.js

Backend:
backend/routes/contactRoutes.js
backend/models/Contact.js
```

Flow:

```text
User opens /contact
  -> User enters name, email, subject, message
  -> Frontend calls POST /api/contact
  -> Backend saves Contact record
  -> Contact read status defaults to false
  -> Admin can later view message in dashboard
  -> Admin can mark message as read
```

Contact model fields:

```text
name
email
subject
message
read
createdAt
updatedAt
```

## 13. User Profile Flow

Important files:

```text
Frontend:
tour-website/src/pages/Profile.jsx
tour-website/src/context/AuthContext.jsx
tour-website/src/services/api.js

Backend:
backend/routes/authRoutes.js
backend/routes/bookingRoutes.js
```

Flow:

```text
Logged-in user opens /profile
  -> ProtectedRoute checks user from AuthContext
  -> Frontend calls GET /api/bookings/my
  -> Backend protect middleware verifies JWT
  -> Backend finds bookings where userId = current user ID
  -> Backend populates package details
  -> Frontend displays user bookings/trips
```

Profile update flow:

```text
User edits profile
  -> Frontend calls PUT /api/auth/profile
  -> Backend verifies JWT
  -> Backend updates name, phone, or password
  -> Backend returns fresh token and user data
  -> Frontend updates AuthContext user state
```

## 14. Admin Dashboard Flow

Important files:

```text
Frontend:
tour-website/src/pages/admin/AdminDashboard.jsx

Backend:
backend/middleware/authMiddleware.js
backend/routes/packageRoutes.js
backend/routes/destinationRoutes.js
backend/routes/bookingRoutes.js
backend/routes/contactRoutes.js
```

Admin entry flow:

```text
Admin logs in
  -> Admin login bypasses OTP
  -> Backend returns JWT with admin user data
  -> Frontend sets user role admin
  -> Admin opens /admin
  -> AdminRoute checks user and isAdmin
  -> Admin dashboard loads
```

Admin dashboard sections:

```text
/admin
  -> Shows counts for packages, destinations, bookings, messages

/admin/packages
  -> Admin can add, edit, delete packages

/admin/destinations
  -> Admin can add, edit, delete destinations

/admin/bookings
  -> Admin can view bookings
  -> Admin can confirm or cancel pending bookings

/admin/contacts
  -> Admin can view messages
  -> Admin can mark messages as read
```

Admin API protection:

```text
POST /api/packages
PUT /api/packages/:id
DELETE /api/packages/:id
POST /api/destinations
PUT /api/destinations/:id
DELETE /api/destinations/:id
POST /api/hotels
PUT /api/hotels/:id
DELETE /api/hotels/:id

These use:
  protect middleware
  adminOnly middleware
```

## 15. Database Collection Flow

MongoDB collections used by project:

```text
users
  -> Stores registered users and admins

otps
  -> Stores temporary hashed OTP codes
  -> Auto expires using expiresAt TTL index

packages
  -> Stores tour packages

destinations
  -> Stores destination data

bookings
  -> Stores package bookings

hotels
  -> Stores admin-created hotels

hotelbookings
  -> Stores hotel reservations

contacts
  -> Stores contact form messages
```

Database relationship flow:

```text
User
  -> can have many Booking records

Package
  -> can be referenced by many Booking records

Hotel
  -> can be booked through HotelBooking

Contact
  -> independent message collection for admin

Otp
  -> temporary support collection for register/login/reset
```

## 16. External Service Flow

External services used:

```text
MongoDB
  -> Main database

SMTP / Gmail
  -> OTP email delivery

OpenTripMap API
  -> External destination and accommodation data

Unsplash image URLs
  -> Fallback/static images used in UI and generated data
```

Environment variables expected:

```text
Backend:
MONGODB_URI
JWT_SECRET
PORT
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
FROM_EMAIL
OPENTRIPMAP_API_KEY

Frontend:
VITE_API_URL
```

If SMTP is not configured:

```text
OTP is logged in backend terminal instead of being emailed.
```

If OpenTripMap API key is not configured:

```text
Backend still works with MongoDB data.
External destination/hotel enrichment returns empty or fallback data.
```

## 17. Deployment Flow

Backend deployment:

```text
backend/render.yaml
  -> Designed for Render deployment
  -> Backend runs Express server
  -> Needs production environment variables
```

Frontend deployment:

```text
tour-website/vercel.json
  -> Designed for Vercel deployment
  -> Frontend builds with Vite
  -> Needs VITE_API_URL pointing to deployed backend API
```

Local development flow:

```text
Backend:
cd backend
npm install
npm run dev

Frontend:
cd tour-website
npm install
npm run dev
```

Seed data flow:

```text
cd backend
npm run seed
node seedAdmin.js
```

## 18. Complete User Journey Flow

```text
Visitor lands on Home
  -> Browses packages/destinations/hotels
  -> Registers or logs in if they want account features
  -> OTP verification completes authentication
  -> User selects package
  -> User books package
  -> Booking saved with Pending status
  -> Admin confirms or cancels booking
  -> User can view bookings in Profile
```

Hotel journey:

```text
Visitor opens Hotels
  -> Searches destination
  -> Applies filters
  -> Opens hotel detail
  -> Books hotel
  -> Reservation ID generated
  -> Confirmation screen shown
```

Contact journey:

```text
Visitor opens Contact
  -> Sends message
  -> Message saved in MongoDB
  -> Admin views message
  -> Admin marks it as read
```

Admin journey:

```text
Admin logs in
  -> Direct login without OTP
  -> Opens Admin Dashboard
  -> Manages packages and destinations
  -> Reviews bookings
  -> Confirms/cancels package bookings
  -> Reads contact messages
```

## 19. Current Completion Summary

Completed project parts:

```text
Frontend React app with routing
Navbar and footer layout
Theme toggle using localStorage
Authentication context
Register with OTP
Login with OTP for users
Admin login without OTP
Forgot password with OTP
Package listing and package details
Package booking form
Destination listing and filters
Hotel listing/search
Hotel details page
Hotel booking confirmation flow
Contact form
Protected profile page
Protected admin dashboard
Backend Express API
MongoDB models
JWT authentication middleware
Admin-only middleware
Email OTP utility
Seed scripts
Render/Vercel deployment config
```

Areas to improve later:

```text
Add full payment gateway integration instead of mock payment fields
Protect admin booking/contact routes on backend also, not only frontend
Save logged-in user ID for hotel bookings
Fix hotel booking form fields so email, phone, requests, roomId, dates are fully submitted
Add validation for all booking/payment forms
Add automated tests
Add loading/error UI consistency across pages
Clean encoding symbols that appear as broken characters in some files
```

## 20. One-Line Flow

```text
React UI -> AuthContext/API services -> Express routes -> Controllers -> Mongoose models -> MongoDB/OpenTripMap/SMTP -> JSON response -> UI update
```
