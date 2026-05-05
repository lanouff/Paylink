# PayLink – Handle-Based Payment System using Open Banking APIs

## Overview

PayLink is a web-based application that enables users to send and request payments using unique handles instead of sharing sensitive bank account details.

The system leverages Open Banking APIs (TrueLayer) to securely connect bank accounts and retrieve financial data, providing a modern and user-friendly alternative to traditional bank transfers.

---

## Key Features

- Create a unique payment handle (e.g. @username)
- Send and receive payment requests
- View incoming and outgoing requests
- Connect bank accounts using TrueLayer Open Banking APIs
- View account balances and transaction history
- Simulated payment flow for demonstration purposes

---

## Technologies Used

### Backend
- Django
- Django REST Framework

### Frontend
- React (Vite)

### APIs
- TrueLayer Open Banking API (Sandbox)

---

## System Architecture

The application follows a client-server architecture:

- **Frontend (React):** User interface and interaction
- **Backend (Django):** API endpoints, business logic, authentication
- **TrueLayer API:** Bank account integration and financial data

---

## How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
backend will run on : http://127.0.0.1:8000

### 3- Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
frontend will run on : http://localhost:5173
