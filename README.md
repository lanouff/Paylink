# PayLink – Handle-Based Payment System Using Open Banking APIs

## Overview

PayLink is a web-based final year project that allows users to send and request payments using unique handles instead of sharing sensitive bank account details such as sort codes and account numbers.

The system is designed to reduce payment friction, improve user privacy, and demonstrate how Open Banking APIs can support a more secure and user-friendly payment request system.

PayLink uses a Django backend, a React frontend, and TrueLayer sandbox APIs for Open Banking account connectivity and financial data retrieval.

---

## Key Features

- User registration and login
- Token-based authentication
- Create a unique PayLink handle
- Check handle availability
- Send payment requests to another user's handle
- View outgoing payment requests
- View incoming payment requests
- Cancel outgoing payment requests
- Decline incoming payment requests
- Connect a bank account using TrueLayer Open Banking sandbox
- Retrieve linked bank accounts
- View account balance
- View recent transactions
- Simulated payment completion flow for demonstration purposes

---

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework
- SQLite database
- TrueLayer API integration

### Frontend

- React
- Vite
- JavaScript
- CSS

### External API

- TrueLayer Open Banking API Sandbox

---

## Project Structure

```text
Paylink/
│
├── backend/
│   ├── api/
│   ├── config/
│   ├── handles/
│   ├── payments/
│   ├── users/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/lanouff/Paylink.git
cd Paylink
```

---

## Backend Setup

### 2. Go to the Backend Folder

```bash
cd backend
```

### 3. Create and Activate a Virtual Environment

On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

On macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run Database Migrations

```bash
python manage.py migrate
```

### 6. Start the Django Backend Server

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Open a new terminal window.

### 7. Go to the Frontend Folder

```bash
cd frontend
```

### 8. Install Frontend Dependencies

```bash
npm install
```

### 9. Start the React Development Server

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## Environment Variables

The TrueLayer integration requires API credentials. These should be placed in an environment file and should not be committed to GitHub.

Example environment variables:

```text
TRUELAYER_CLIENT_ID=
TRUELAYER_CLIENT_SECRET=
TRUELAYER_REDIRECT_URI=
TRUELAYER_AUTH_BASE=
TRUELAYER_TOKEN_URL=
```

The project uses the TrueLayer sandbox environment for development and demonstration.

---

## TrueLayer Sandbox Limitation

TrueLayer is used in this project for Open Banking-style bank connectivity in the sandbox environment, including account access, balances, and transactions.

However, full real payment execution is not enabled in the sandbox setup used for this project. Therefore, the payment completion step is simulated to demonstrate the intended PayLink payment request workflow.

---

## Testing

The system was tested through:

- Manual frontend testing
- Backend API endpoint testing
- Authentication testing
- Handle creation and availability testing
- Incoming and outgoing payment request testing
- TrueLayer sandbox connection testing
- Balance and transaction retrieval testing

Further testing details and screenshots are included in the final project report.

---

## Main API Functionality

The backend provides endpoints for:

- User authentication
- Handle creation and lookup
- Payment request creation
- Incoming payment requests
- Outgoing payment requests
- Cancelling requests
- Declining requests
- TrueLayer authentication
- Bank account retrieval
- Balance retrieval
- Transaction retrieval

---

## Limitations

- Real payment execution is simulated because the TrueLayer Payments API was not enabled in the sandbox environment used.
- The system is a final year project prototype and is not intended for production use.
- TrueLayer credentials are required to test Open Banking features.
- Some financial data is retrieved from the TrueLayer sandbox/mock provider.

---

## Project Context

This project was developed as part of the Final Year Project module at Queen Mary University of London.

Project title:

**PayLink – Handle-Based Payment System Using Open Banking APIs**

---

## Author

Noufel Khelkhal
