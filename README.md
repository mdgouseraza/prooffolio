# ProofFolio

> **Proof over promises.**  
> A student achievement portfolio platform where achievements are verified, not just claimed.

---

## What Is ProofFolio?

ProofFolio is a web application built for university students to create a verified digital portfolio of their academic records, certifications, and achievements.

A student fills in their profile, uploads their marksheets (via scan or manual entry), adds certifications and achievements, and submits them to their HOD (Head of Department) for verification. Once verified, a QR code is generated that links to a beautiful public portfolio page — which any recruiter can scan and view instantly, with no login required.

---

## The Problem It Solves

Professors often struggle to recommend students to companies because there is no documented proof of their achievements — just memory. LinkedIn is self-reported and unverified. ProofFolio fixes this by creating a verified, shareable, always-updated portfolio backed by institutional authority.

---

## Who Uses It

| Role | What They Do |
|---|---|
| **Student** | Signs up, builds portfolio, shares QR code |
| **HOD / Professor** | Reviews and verifies student uploads |
| **Admin (You)** | Creates HOD accounts, manages the platform |
| **Recruiter** | Scans QR code, views verified portfolio — no login needed |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS |
| Backend | Django + Django REST Framework |
| Database | PostgreSQL |
| Auth | Google OAuth2 + JWT + OTP (email & phone) |
| File Storage | Cloudinary |
| OCR | Tesseract / Google Vision (for marksheet scanning) |
| QR Code | react-qr-code (frontend) + qrcode (Python) |
| PWA | manifest.json + service worker |
| Scheduler | Celery / django-cron |

---

## Folder Structure

```
prooffolio/
│
├── frontend/                  # React.js app
│   └── src/
│       ├── pages/             # One file per screen (Dashboard, Profile, etc.)
│       ├── components/        # Reusable UI pieces (cards, badges, modals)
│       ├── context/           # AuthContext — stores logged-in user globally
│       ├── api/               # All axios API call functions
│       └── assets/            # Logo, icons, images
│
├── backend/                   # Django project
│   ├── users/                 # Auth app — signup, login, OTP, Google OAuth
│   ├── portfolio/             # Core app — models, views, serializers
│   ├── notifications/         # Notification engine + scheduled tasks
│   └── admin_panel/           # Admin management — HODs, students, broadcasts
│
├── README.md                  # This file
└── .env.example               # Environment variable template
```

---

## Getting Started

### Prerequisites

Make sure you have these installed:
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/prooffolio.git
cd prooffolio
```

### 2. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables template
cp .env.example .env
# Fill in your values in .env (see Environment Variables section below)

# Run database migrations
python manage.py migrate

# Create the admin account
python manage.py create_admin

# Start the backend server
python manage.py runserver
```

### 3. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend dev server
npm start
```

App runs at `http://localhost:3000`  
API runs at `http://localhost:8000`

---

## Environment Variables

Create a `.env` file in the `/backend` folder with these values:

```env
# Django
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=prooffolio
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (for OTP sending)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# JWT
JWT_SECRET_KEY=your_jwt_secret
```

---

## Key Features

### For Students
- Sign up via Google or email/phone OTP
- Upload marksheets — scan to auto-extract OR enter manually
- Add certifications, achievements, documents
- Track verification status (WhatsApp-style ticks: Submitted → Seen → Verified)
- Re-request after rejection without re-filling everything
- Generate a QR code once profile is complete
- Get monthly motivational notifications + 30-day nudge if inactive

### For HODs
- Institutional email verified account (no Gmail allowed)
- See all students in their branch with pending counts
- Open any student's uploads and approve or reject with a reason
- Student is notified instantly on every action

### For Admin
- Create HOD accounts manually (no self-signup for HODs)
- Manage all students and reassign branches if needed
- Broadcast notifications to all students or specific branches
- View platform-wide stats

### For Recruiters
- Scan student QR code — no login, no account needed
- See full verified portfolio: marks, certifications, achievements
- LinkedIn, GitHub, resume download all in one place
- "Last updated" date shown so they know how fresh the profile is
- Professor's name and institutional email shown for trust

---

## User Flows

### Student Signs Up
1. Opens ProofFolio → sees glassmorphism onboarding slides (3 slides)
2. Signs up via Google or OTP → selects "I am a Student"
3. Selects branch → auto-linked to branch HOD
4. Fills profile → uploads marksheet → adds certs/achievements
5. Profile reaches minimum → QR code unlocked
6. Shares QR code on resume or in person

### HOD Verifies
1. Admin creates HOD account → HOD logs in
2. Sees list of students in their branch
3. Opens a student → reviews uploads → approves or rejects
4. Student gets notified instantly

### Recruiter Views
1. Scans student's QR code
2. Public portfolio page loads — no login needed
3. Sees verified marks, certifications, achievements
4. Sees "Verified by Prof. X · institution.ac.in"

---

## Verification Status System

Works like WhatsApp ticks — students always know where their request stands:

| Status | Meaning |
|---|---|
| 📤 Submitted | HOD hasn't seen it yet |
| 👁️ Seen | HOD opened the tab — auto-triggered |
| ✅ Approved | Verified — badge appears on public portfolio |
| ❌ Rejected | Rejected with reason — student can edit and re-request |

---

## Notifications

Students receive:
- Instant alerts when HOD approves or rejects an upload
- Monthly rotating motivational messages (changes every month automatically)
- Nudge notification if profile hasn't been updated in 30+ days
- Milestone alerts when profile reaches 50%, 75%, 100% completion

---

## API Overview

All API routes start with `/api/`. Full list:

```
Auth:        POST /api/auth/register/  |  POST /api/auth/google/  |  POST /api/auth/otp/send/
Student:     GET/PUT /api/student/profile/  |  POST /api/student/academics/scan/
HOD:         GET /api/hod/students/  |  PUT /api/hod/verify/:type/:id/
Admin:       POST /api/admin/hods/  |  POST /api/admin/broadcast/
Public:      GET /api/portfolio/:student_id/   ← no auth required
```

---

## PWA — Install as App

ProofFolio is a Progressive Web App. On mobile or desktop:
1. Open the site in Chrome or Safari
2. Tap "Add to Home Screen" / "Install App"
3. It works like a native app — no app store needed

---

## Roadmap

### v1 — Current
- [x] Student + HOD roles
- [x] Single university
- [x] QR portfolio
- [x] Verification system
- [x] Notifications
- [x] PWA

### v2 — Planned
- [ ] University Admin dashboard
- [ ] Multi-institution support
- [ ] Institutional email auto-verification
- [ ] Recruiter accounts
- [ ] Direct messaging
- [ ] Analytics

---

## Built With

- [React.js](https://react.dev)
- [Django](https://www.djangoproject.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudinary](https://cloudinary.com)
- [PostgreSQL](https://www.postgresql.org)

---

## Author

Built by [Your Name] — Final Year Project, [Your University Name], 2026.

---

*ProofFolio — Built for students. Trusted by recruiters. Verified by professors.*
