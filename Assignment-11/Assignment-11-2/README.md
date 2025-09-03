# 🔐 User Authentication & Password Reset System

A secure **Node.js + Express + MongoDB** backend for user authentication, login, and password reset via email.  
Implements best practices with **bcrypt** for password hashing, **JWT** for authentication, and **secure random reset tokens** with expiry.  

---

## ✨ Features

- **User Signup**
  - `POST /signup`
  - Stores hashed password using bcrypt
  - Ensures email uniqueness

- **User Login**
  - `POST /login`
  - Verifies email & password
  - Returns JWT access token

- **Forgot Password**
  - `POST /forgot-password`
  - Accepts user email
  - Generates a secure, time-limited reset token (15 min)
  - Sends reset link via email
  - Response does not reveal if email exists (prevents enumeration)

- **Reset Password**
  - `POST /reset-password/:token`
  - Accepts new password
  - Verifies token & expiry
  - Updates user password after hashing
  - Invalidates token after use
  - Returns fresh JWT

- **Security**
  - Bcrypt password hashing
  - Hashed reset tokens stored in DB
  - Rate limiting on login & forgot-password
  - JWT-based authentication
  - Generic responses to prevent email leaks

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT, bcrypt
- **Email**: Nodemailer (Gmail / SMTP)
- **Other**: dotenv, express-rate-limit

---

## 📂 Project Structure

```
project/
├─ server.js # Main server & routes
├─ models/
│ └─ User.js # User schema & methods
├─ utils/
│ └─ email.js # Nodemailer helper
├─ middleware/
│ └─ rateLimiter.js # Rate limiter config
├─ .env # Environment variables (not committed)
├─ package.json
└─ README.md
```