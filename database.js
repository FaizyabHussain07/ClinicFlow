// ============================================================
// database.js - Firebase Realtime Database Operations
// ClinicFlow – Multi-Role Smart Clinic Management System
// ============================================================

import {
    ref, set, get, child, push, update, remove,
    query, orderByChild, equalTo
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { rtdb } from './firebase-config.js';

// ── Helpers ───────────────────────────────────────────────────
/**
 * Convert RTDB snapshot to array with IDs
 */
const snapToArray = (snap) => {
    if (!snap || !snap.exists()) return [];
    const obj = snap.val();
    if (typeof obj !== 'object') return [];
    return Object.keys(obj).map(key => ({
        id: key,
        ...obj[key]
    })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Sort by newest first
};

// ════════════════════════════════════════════════════════════
// USERS (Admin, Doctor, Receptionist, Patient)
// ════════════════════════════════════════════════════════════

export async function createUserDoc(uid, data) {
    await set(ref(rtdb, 'users/' + uid), {
        ...data,
        createdAt: Date.now(),
        active: true
    });
}

export async function getUserDoc(uid) {
    const snap = await get(ref(rtdb, 'users/' + uid));
    return snap.exists() ? snap.val() : null;
}

export async function getAllUsers() {
    const snap = await get(ref(rtdb, 'users'));
    return snapToArray(snap);
}

export async function getUsersByRole(role) {
    const usersRef = ref(rtdb, 'users');
    const q = query(usersRef, orderByChild('role'), equalTo(role));
    const snap = await get(q);
    return snapToArray(snap);
}

export async function deleteUserDoc(uid) {
    await remove(ref(rtdb, 'users/' + uid));
}

export async function updateUserActiveStatus(uid, status) {
    await update(ref(rtdb, 'users/' + uid), { active: status });
}

// ════════════════════════════════════════════════════════════
// DISEASE FORMS (submitted by Patients)
// ════════════════════════════════════════════════════════════

export async function addDiseaseForm(data) {
    const formsRef = ref(rtdb, 'diseaseForms');
    const newFormRef = push(formsRef);
    await set(newFormRef, {
        ...data,
        status: "Pending",
        createdAt: Date.now()
    });
    return { id: newFormRef.key };
}

export async function getPatientDiseaseForms(patientId) {
    const formsRef = ref(rtdb, 'diseaseForms');
    const q = query(formsRef, orderByChild('patientId'), equalTo(patientId));
    const snap = await get(q);
    return snapToArray(snap);
}

export async function getAllDiseaseForms() {
    const snap = await get(ref(rtdb, 'diseaseForms'));
    return snapToArray(snap);
}

export async function updateDiseaseFormStatus(id, status) {
    await update(ref(rtdb, 'diseaseForms/' + id), { status });
}

// ════════════════════════════════════════════════════════════
// PATIENTS (Receptionist Management)
// ════════════════════════════════════════════════════════════

export async function addPatient(data) {
    const patientsRef = ref(rtdb, 'patients');
    const newPatientRef = push(patientsRef);
    await set(newPatientRef, {
        ...data,
        createdAt: Date.now()
    });
    return { id: newPatientRef.key };
}

export async function getPatient(id) {
    const snap = await get(ref(rtdb, 'patients/' + id));
    return snap.exists() ? { id: snap.key, ...snap.val() } : null;
}

/**
 * Merges sign-up users (role=patient) with manual records
 */
export async function getUnifiedPatients() {
    const [users, records] = await Promise.all([
        getUsersByRole('patient'),
        get(ref(rtdb, 'patients'))
    ]);
    const manualRecords = snapToArray(records);

    // De-duplicate by name/email if necessary, or just merge
    const merged = [...users, ...manualRecords];
    return merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getAllPatients() {
    const snap = await get(ref(rtdb, 'patients'));
    return snapToArray(snap);
}

export async function updatePatient(id, data) {
    await update(ref(rtdb, 'patients/' + id), { ...data, updatedAt: Date.now() });
}

export async function deletePatient(id) {
    await remove(ref(rtdb, 'patients/' + id));
}

// ════════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════════

export async function addAppointment(data) {
    const apptsRef = ref(rtdb, 'appointments');
    const newApptRef = push(apptsRef);
    await set(newApptRef, {
        ...data,
        status: "Pending",
        createdAt: Date.now()
    });
    // Link the disease form status
    if (data.diseaseFormId) {
        await update(ref(rtdb, 'diseaseForms/' + data.diseaseFormId), { status: "Scheduled" });
    }
    return { id: newApptRef.key };
}

export async function getAllAppointments() {
    const snap = await get(ref(rtdb, 'appointments'));
    return snapToArray(snap);
}

export async function getDoctorAppointments(doctorId) {
    const apptsRef = ref(rtdb, 'appointments');
    const q = query(apptsRef, orderByChild('doctorId'), equalTo(doctorId));
    const snap = await get(q);
    return snapToArray(snap);
}

export async function getPatientAppointments(patientId) {
    const apptsRef = ref(rtdb, 'appointments');
    const q = query(apptsRef, orderByChild('patientId'), equalTo(patientId));
    const snap = await get(q);
    return snapToArray(snap);
}

export async function updateAppointment(id, data) {
    await update(ref(rtdb, 'appointments/' + id), { ...data, updatedAt: Date.now() });
}

export async function getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const apptsRef = ref(rtdb, 'appointments');
    const q = query(apptsRef, orderByChild('date'), equalTo(today));
    const snap = await get(q);
    return snapToArray(snap);
}

// ════════════════════════════════════════════════════════════
// PRESCRIPTIONS
// ════════════════════════════════════════════════════════════

export async function addPrescription(data) {
    const rxRef = ref(rtdb, 'prescriptions');
    const newRxRef = push(rxRef);
    await set(newRxRef, {
        ...data,
        createdAt: Date.now()
    });
    // Mark appointment as Completed
    if (data.appointmentId) {
        await update(ref(rtdb, 'appointments/' + data.appointmentId), { status: "Completed" });
    }
    if (data.diseaseFormId) {
        await update(ref(rtdb, 'diseaseForms/' + data.diseaseFormId), { status: "Completed" });
    }
    return { id: newRxRef.key };
}

export async function getPatientPrescriptions(patientId) {
    const rxRef = ref(rtdb, 'prescriptions');
    const q = query(rxRef, orderByChild('patientId'), equalTo(patientId));
    const snap = await get(q);
    return snapToArray(snap);
}

export async function getAllPrescriptions() {
    const snap = await get(ref(rtdb, 'prescriptions'));
    return snapToArray(snap);
}

export async function getDoctorPrescriptions(doctorId) {
    const rxRef = ref(rtdb, 'prescriptions');
    const q = query(rxRef, orderByChild('doctorId'), equalTo(doctorId));
    const snap = await get(q);
    return snapToArray(snap);
}

export async function updatePrescription(id, data) {
    await update(ref(rtdb, 'prescriptions/' + id), { ...data, updatedAt: Date.now() });
}
