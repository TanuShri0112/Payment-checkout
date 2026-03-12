# Payment Checkout Application

A React-based payment checkout application with Tilled.js integration for processing card payments.

## 🎯 Project Overview

This is a complete payment checkout flow application that handles:
- Session-based checkout processing
- Card payment form with Tilled.js integration
- Payment success/failure handling
- Responsive UI design

## 🏗️ Project Structure

```
src/
├── components/
│   └── CardForm.jsx          # Payment form component with Tilled.js
├── pages/
│   ├── Checkout.jsx          # Main checkout page
│   ├── PaymentSuccess.jsx    # Payment success page
│   ├── PaymentFailed.jsx     # Payment failure page
│   └── Home.jsx              # Landing page with demo option
├── services/
│   └── paymentService.js     # API service for checkout sessions
├── utils/
│   └── getSessionId.js       # Utility to extract session_id from URL
├── styles/
│   └── checkout.css          # Custom CSS styling
├── App.jsx                   # Main app with routing
└── main.jsx                  # React app entry point
```

## 🎨 UI Components & Design

### **1. Home Page (`/`)**
- Welcome screen with demo checkout option
- Instructions for developers
- Clean, centered layout

### **2. Checkout Page (`/checkout`)**
- **Order Summary Section**: 
  - Product name and price display
  - Gradient background design
- **Payment Form Section**:
  - Card Number field
  - Expiry Date field  
  - CVV field
  - "Pay Now" button
- **Features**:
  - Loading states
  - Error handling
  - Responsive design

### **3. Payment Success Page (`/success`)**
- Success message with checkmark icon
- "Return to Home" button
- Clean, celebratory design

### **4. Payment Failed Page (`/failed`)**
- Failure message with X icon
- "Try Again" and "Return to Home" buttons
- Error recovery options

## 🔧 Technical Implementation

### **Frontend Logic Flow**

1. **Session Initialization**:
   ```javascript
   // URL: /checkout?session_id=abc123
   const sessionId = getSessionId(); // Extract from URL params
   ```

2. **API Integration**:
   ```javascript
   // Calls backend API
   GET /api/checkout-session/:sessionId
   
   // Expected Response:
   {
     product_name: string,
     amount: number,        // in cents
     client_secret: string  // for Tilled.js
   }
   ```

3. **Payment Processing**:
   ```javascript
   // Tilled.js integration
   tilled.confirmPayment(clientSecret)
   ```

4. **Result Handling**:
   - Success → Navigate to `/success`
   - Failure → Navigate to `/failed`

### **Key Components**

#### **CardForm Component**
- Initializes Tilled.js with publishable key
- Creates and mounts card fields (cardNumber, cardExpiry, cardCvv)
- Handles payment confirmation
- Error handling and loading states

#### **Checkout Page**
- Fetches session data from backend
- Displays product information
- Renders payment form
- Handles navigation based on payment results

#### **Payment Service**
- Centralized API calls
- Error handling for network requests
- Session data fetching

## 🔌 Backend API Requirements

### **Required Endpoint**

**GET `/api/checkout-session/:sessionId`**

**Response Format:**
```json
{
  "product_name": "Example Product",
  "amount": 2999,
  "client_secret": "pi_12345_secret_abcde"
}
```

**Response Fields:**
- `product_name`: Display name of the product
- `amount`: Price in cents (e.g., 2999 = $29.99)
- `client_secret`: Tilled.js client secret for payment processing

### **Demo Mode Support**
The app supports demo sessions with `session_id` starting with `demo_session_`:
- Uses mock data for testing
- Displays "Demo Product" at $29.99
- Generates random client secret

## 🎨 Design System

### **Colors**
- Primary: `#667eea` (purple gradient)
- Success: `#10b981` (green)
- Error: `#ef4444` (red)
- Background: `#f5f5f5` (light gray)

### **Typography**
- Font: System fonts (Segoe UI, Roboto, etc.)
- Sizes: 14px (body), 16px (form), 18-24px (headers)

### **Responsive Design**
- Mobile-first approach
- Breakpoint: 768px
- Stacked layout on mobile
- Grid layout on desktop

## 🚀 Getting Started

### **Prerequisites**
- Node.js installed
- Backend API running
- Tilled.js credentials (for production)

### **Installation**
```bash
npm install
npm run dev
```

### **Configuration**
1. Update Tilled credentials in `src/components/CardForm.jsx`:
   ```javascript
   const tilledInstance = new window.Tilled('YOUR_PUBLISHABLE_KEY', {
     account: 'YOUR_ACCOUNT_ID'
   });
   ```

2. Ensure backend API is available at `/api/checkout-session/:sessionId`

### **Testing**
- Demo mode: Visit `/` and click "Start Demo Checkout"
- Real mode: Visit `/checkout?session_id=your_session_id`

## 🔄 Payment Flow

1. **User Access**: User visits checkout URL with session_id
2. **Session Fetch**: Frontend calls backend API for session data
3. **Form Display**: Product info and payment form are shown
4. **Payment Input**: User enters card details
5. **Payment Processing**: Tilled.js processes payment
6. **Result Navigation**: User redirected to success/failed page

## 🛠️ Technologies Used

- **React 19.2.0** - UI framework
- **React Router 7.13.1** - Client-side routing
- **Axios 1.13.6** - HTTP client
- **Tilled.js v2** - Payment processing
- **Vite 7.3.1** - Build tool
- **CSS3** - Styling (no frameworks)

## 📱 Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔐 Security Notes

- Client secret should never be exposed in frontend logs
- Use HTTPS in production
- Validate session_id on backend
- Implement proper CORS policies

## 🐛 Troubleshooting

### **Common Issues**
1. **"No session ID found"**: Add `?session_id=abc123` to URL
2. **"Tilled.js not loaded"**: Check script tag in index.html
3. **Half-screen layout**: Clear browser cache and refresh
4. **API errors**: Check backend endpoint and CORS settings

### **Demo Mode**
For testing without real credentials, use session IDs starting with `demo_session_` to see mock data.

---

**For Backend Developers**: Please implement the `/api/checkout-session/:sessionId` endpoint with the specified response format to enable full payment functionality.
