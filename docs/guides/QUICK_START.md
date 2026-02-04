# PropEquityLab Quick Start Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for production rate limiting)

## 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env and set required variables:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET_KEY (generate with: openssl rand -hex 32)
# - RESEND_API_KEY (optional, for email sending)

# Start server
python server.py
```

Backend will start on `http://localhost:8000`

## 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env if backend is not on localhost:8000

# Start development server
npm start
```

Frontend will open at `http://localhost:3000`

## 3. Test the Application

### Register a New User

1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form
3. Click "Create Account"
4. Check backend console for email simulation (if RESEND_API_KEY not set)

### Login

1. Navigate to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Sign In"
4. You'll be redirected to the dashboard

### Access Protected Routes

- Dashboard: `http://localhost:3000/dashboard`
- Properties: `http://localhost:3000/finances/properties`
- Plans: `http://localhost:3000/plans`

All routes require authentication. If not logged in, you'll be redirected to login.

## 4. Email Configuration (Optional)

To enable real email sending:

1. Sign up for Resend: https://resend.com
2. Verify your sending domain
3. Get your API key
4. Set `RESEND_API_KEY` in backend/.env
5. Set `FROM_EMAIL` to your verified domain

## 5. Redis Configuration (Production)

For production rate limiting:

1. Provision Redis instance (Upstash recommended: https://upstash.com)
2. Get Redis connection URL
3. Set `REDIS_URL` in backend/.env

## Troubleshooting

### Backend won't start
- Check MongoDB is running and accessible
- Verify all required environment variables are set
- Check port 8000 is not already in use

### Frontend won't start
- Run `npm install` to ensure all dependencies are installed
- Check port 3000 is not already in use
- Verify `REACT_APP_BACKEND_URL` points to running backend

### Can't login
- Check backend console for errors
- Verify user was created successfully
- Check MongoDB connection

### Emails not sending
- If `RESEND_API_KEY` is not set, emails are logged to backend console
- Check backend console for email simulation output
- Verify Resend API key is correct and domain is verified

## API Documentation

FastAPI automatic documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Next Steps

- Complete onboarding wizard
- Create your first portfolio
- Add properties and track net worth
- Create FIRE plans

## Support

For issues or questions, check the implementation report or backend console logs.
