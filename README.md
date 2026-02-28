# ClinicFlow – Smart Clinic Management System

> A complete, production-ready Clinic Management System built with HTML, CSS, Vanilla JavaScript, Firebase, and Cloudinary.

---

## 🏥 Features

| Feature | Description |
|---|---|
| **Auth & Roles** | Firebase Email/Password Auth with role-based access (Admin, Doctor, Receptionist) |
| **Patient Management** | Full CRUD, search/filter, patient profile with medical timeline |
| **Appointment Management** | Book, edit, filter by date/status, inline status updates |
| **Prescription System** | Multi-medicine prescriptions, jsPDF generation, Cloudinary PDF upload |
| **Medical Timeline** | Chronological history of appointments and prescriptions |
| **Dashboard Statistics** | Real-time stats per role with animated counters |
| **Responsive Design** | Mobile-friendly with sidebar toggle |
| **Security Rules** | Firestore role-based security rules included |

---

## 🗂️ Folder Structure

```
clinicflow/
├── assets/
│   ├── css/
│   │   └── main.css         ← All styles (medical theme)
│   └── js/
│       └── utils.js         ← Shared utilities (toast, modal, etc.)
├── pages/
│   ├── login.html
│   ├── admin-dashboard.html
│   ├── doctor-dashboard.html
│   ├── receptionist-dashboard.html
│   ├── patients.html
│   ├── appointments.html
│   └── prescriptions.html
├── firebase-config.js       ← Firebase + Cloudinary config
├── auth.js                  ← Auth logic & route guards
├── firestore.js             ← Firestore CRUD operations
├── app.js                   ← PDF generation & Cloudinary upload
├── firestore.rules          ← Security rules to deploy
└── README.md
```

---

## 🚀 Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore Database** (Start in test mode, then apply rules).
4. Get your **Web App config** from Project Settings.

### 2. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com/).
2. Go to **Settings → Upload → Upload Presets**.
3. Create an **Unsigned** upload preset (e.g., `clinicflow_unsigned`).
4. Note your **Cloud Name**.

### 3. Configure the App

Open `firebase-config.js` and replace the placeholders:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const CLOUDINARY_CONFIG = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UPLOAD_PRESET",
  apiUrl: "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/raw/upload"
};
```

### 4. Create Initial Users

You can create demo users two ways:

**Option A – Firebase Console** (Recommended for first setup):
1. Go to Firebase Console → Authentication → Add User
2. Add email/password
3. Then go to Firestore → users collection → Add document with the user's UID as the document ID:
   ```json
   {
     "name": "Admin User",
     "email": "admin@clinicflow.com",
     "role": "admin",
     "createdAt": <timestamp>
   }
   ```

**Option B – Browser Console** (After initial setup):
Open the app, open browser console, and run:
```javascript
import { seedDemoUser } from './auth.js';
await seedDemoUser('admin@clinicflow.com', 'Admin@123', 'Admin User', 'admin');
await seedDemoUser('doctor@clinicflow.com', 'Doctor@123', 'Dr. Sarah Ahmed', 'doctor');
await seedDemoUser('reception@clinicflow.com', 'Recep@123', 'Ali Hassan', 'receptionist');
```

### 5. Deploy Firestore Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firestore in your project folder
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

## 🌐 Deployment Options

### Option A: Firebase Hosting (Recommended)

```bash
# Install CLI
npm install -g firebase-tools

# Login & init
firebase login
firebase init hosting

# Set public directory to: . (current folder)
# Configure as single-page app: No

# Deploy
firebase deploy --only hosting
```

### Option B: Netlify

1. Drag and drop your project folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Done! Netlify gives you a live URL immediately.

### Option C: GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Set source to the main branch
4. Your site will be live at `https://username.github.io/repo-name`

> ⚠️ **Important**: If using GitHub Pages or Netlify, update Firebase Authorized Domains in Firebase Console → Authentication → Settings → Authorized Domains.

---

## 🔐 Default Roles & Permissions

| Action | Admin | Doctor | Receptionist |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| Add/Edit/Delete Patients | ✅ | ❌ | ✅ |
| View Patients | ✅ | ✅ | ✅ |
| Book Appointments | ✅ | ❌ | ✅ |
| Update Appointment Status | ✅ | ✅ | ✅ |
| Write Prescriptions | ✅ | ✅ | ❌ |
| View Prescriptions | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 🏗️ Firestore Collections

### `users`
```json
{
  "id": "uid",
  "name": "Dr. Sarah Ahmed",
  "email": "doctor@clinic.com",
  "role": "doctor",
  "createdAt": "timestamp"
}
```

### `patients`
```json
{
  "id": "auto-id",
  "name": "John Doe",
  "age": 35,
  "gender": "male",
  "phone": "03001234567",
  "address": "House #5, Lahore",
  "createdBy": "userId",
  "createdAt": "timestamp"
}
```

### `appointments`
```json
{
  "id": "auto-id",
  "patientId": "patientDocId",
  "doctorId": "doctorUserId",
  "date": "2025-02-28",
  "status": "Pending | Confirmed | Completed | Cancelled",
  "createdAt": "timestamp"
}
```

### `prescriptions`
```json
{
  "id": "auto-id",
  "patientId": "patientDocId",
  "doctorId": "doctorUserId",
  "medicines": [
    { "name": "Paracetamol", "dosage": "500mg", "duration": "5 days" }
  ],
  "notes": "Take after meals",
  "pdfUrl": "https://res.cloudinary.com/...",
  "createdAt": "timestamp"
}
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Markup structure |
| CSS3 (Vanilla) | Styling, animations, responsive layout |
| JavaScript (ES Modules) | Application logic |
| Firebase Authentication | User login/logout |
| Cloud Firestore | Real-time NoSQL database |
| Cloudinary | PDF storage & CDN delivery |
| jsPDF | Client-side PDF generation |
| Google Fonts (Inter) | Modern typography |

---

## 📱 Browser Support

- Chrome 80+ ✅
- Firefox 75+ ✅
- Safari 14+ ✅
- Edge 80+ ✅

---

## 📄 License

MIT License – Free to use for personal and commercial projects.

---

## 🙌 Credits

Built with ❤️ using Firebase, Cloudinary, and jsPDF.

**ClinicFlow v1.0** – Smart Clinic Management System
