// ============================================================
// auth.js - Authentication with Firestore Roles & Redirection
// ============================================================

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    getAuth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { auth, firebaseConfig } from './firebase-config.js';
import { createUserDoc, getUserDoc } from './database.js';

// ── Role → Dashboard map ─────────────────────────────────────
const ROLE_REDIRECTS = {
    admin: 'pages/admin-dashboard.html',
    doctor: 'pages/doctor-dashboard.html',
    receptionist: 'pages/receptionist-dashboard.html',
    patient: 'pages/patient-dashboard.html'
};

/**
 * Login function
 */
export async function loginUser(email, password) {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserDoc(cred.user.uid);

        if (!profile) {
            await logoutUser();
            throw new Error('User profile not found. Please contact administrator.');
        }

        if (profile.active === false) {
            await logoutUser();
            throw new Error('This account has been deactivated. Access denied.');
        }

        // Success → Store metadata and redirect
        _cacheSession(cred.user.uid, profile);
        const redirect = ROLE_REDIRECTS[profile.role] || 'index.html';
        window.location.href = '../' + redirect;
    } catch (error) {
        // AUTOCREATE ADMIN: If logging in as the default admin fails, automatically create it!
        if (email === 'admin@gmail.com' && password === 'adminclinic' && error.code === 'auth/invalid-credential') {
            try {
                await createAdminAccount(email, password, 'Clinic Admin');
                // Retry login after creation
                const cred = await signInWithEmailAndPassword(auth, email, password);
                const profile = await getUserDoc(cred.user.uid);
                _cacheSession(cred.user.uid, profile);
                window.location.href = '../' + ROLE_REDIRECTS['admin'];
                return;
            } catch (createError) {
                throw new Error("Could not auto-create admin: " + createError.message);
            }
        }

        throw error;
    }
}

/**
 * Signup function
 */
export async function signupUser(email, password, name, role, isEmergency = false) {
    if (role === 'admin' && !isEmergency) throw new Error('Admin registration is restricted.');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
        name,
        email,
        role,
        active: true
    };

    // Add Doctor specific fields if needed (placeholders)
    if (role === 'doctor') {
        userData.specialization = "General Physician";
        userData.experience = "0 years";
        userData.qualification = "MBBS";
        userData.timing = "9:00 AM - 5:00 PM";
        userData.contact = email;
    }

    await createUserDoc(cred.user.uid, userData);
    _cacheSession(cred.user.uid, userData);

    const redirect = ROLE_REDIRECTS[role] || 'index.html';
    window.location.href = '../' + redirect;
}

/**
 * Admin creates staff without logging out
 */
export async function createStaffAccountByAdmin(email, password, name, role) {
    // Initialize a secondary app just for user creation
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp_" + Date.now());
    const secondaryAuth = getAuth(secondaryApp);

    try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const userData = {
            name,
            email,
            role,
            active: true
        };

        if (role === 'doctor') {
            userData.specialization = "General Physician";
            userData.experience = "0 years";
            userData.qualification = "MBBS";
            userData.timing = "9:00 AM - 5:00 PM";
            userData.contact = email;
        }

        // Save to RTDB using the main app's connection (already authenticated as admin)
        await createUserDoc(cred.user.uid, userData);

        // Sign out from the secondary instance to clear it
        await signOut(secondaryAuth);
    } catch (e) {
        throw e;
    }
}

/**
 * Logout function
 */
export async function logoutUser() {
    await signOut(auth);
    sessionStorage.clear();
    const currentLoc = window.location.href;
    if (!currentLoc.includes('login.html')) {
        window.location.href = '../pages/login.html';
    }
}

/**
 * Reset Password function
 */
export async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
}

/**
 * Session verification
 */
function _cacheSession(uid, profile) {
    sessionStorage.setItem('userId', uid);
    sessionStorage.setItem('userName', profile.name);
    sessionStorage.setItem('userRole', profile.role);
}

export function requireAuth(expectedRole = null) {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                window.location.href = '../pages/login.html';
                return reject('Not logged in');
            }

            const profile = await getUserDoc(user.uid);
            if (!profile) {
                await logoutUser();
                return reject('No profile');
            }

            if (expectedRole && profile.role !== expectedRole) {
                window.location.href = '../pages/404.html';
                return reject('Access denied');
            }

            if (profile.active === false) {
                await logoutUser();
                return reject('Account deactivated');
            }

            resolve({ user, profile });
        });
    });
}

// ── Initialize First Admin (Run manually if needed) ───────────
export async function createAdminAccount(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDoc(cred.user.uid, {
        name,
        email,
        role: 'admin',
        active: true
    });
}
