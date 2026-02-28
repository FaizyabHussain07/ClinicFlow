// ============================================================
// firestore.js - Cloud Firestore CRUD Operations
// ============================================================

import {
    collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
    query, where, orderBy, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from './firebase-config.js';

// ── Helpers ───────────────────────────────────────────────────
const snapToArray = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// ════════════════════════════════════════════════════════════
// USERS (Admin, Doctor, Receptionist, Patient)
// ════════════════════════════════════════════════════════════
export async function createUserDoc(uid, data) {
    await setDoc(doc(db, "users", uid), {
        ...data,
        createdAt: serverTimestamp(),
        active: true // For Activation/Deactivation logic
    });
}

export async function getUserDoc(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
}

export async function getAllUsers() {
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    return snapToArray(snap);
}

export async function getUsersByRole(role) {
    const q = query(collection(db, "users"), where("role", "==", role));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function deleteUserDoc(uid) {
    await deleteDoc(doc(db, "users", uid));
}

export async function updateUserActiveStatus(uid, status) {
    await updateDoc(doc(db, "users", uid), { active: status });
}

// ════════════════════════════════════════════════════════════
// DISEASE FORMS (submitted by Patients)
// ════════════════════════════════════════════════════════════
export async function addDiseaseForm(data) {
    const docRef = await addDoc(collection(db, "diseaseForms"), {
        ...data,
        status: "Pending",
        createdAt: serverTimestamp()
    });
    return { id: docRef.id };
}

export async function getPatientDiseaseForms(patientId) {
    const q = query(collection(db, "diseaseForms"), where("patientId", "==", patientId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function getAllDiseaseForms() {
    const q = query(collection(db, "diseaseForms"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function updateDiseaseFormStatus(id, status) {
    await updateDoc(doc(db, "diseaseForms", id), { status });
}

// ════════════════════════════════════════════════════════════
// APPOINTMENTS
// ════════════════════════════════════════════════════════════
export async function addAppointment(data) {
    const docRef = await addDoc(collection(db, "appointments"), {
        ...data,
        status: "Pending",
        createdAt: serverTimestamp()
    });
    // Link the disease form status to "Scheduled"
    if (data.diseaseFormId) {
        await updateDoc(doc(db, "diseaseForms", data.diseaseFormId), { status: "Scheduled" });
    }
    return { id: docRef.id };
}

export async function getAllAppointments() {
    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function getDoctorAppointments(doctorId) {
    const q = query(collection(db, "appointments"), where("doctorId", "==", doctorId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function getPatientAppointments(patientId) {
    const q = query(collection(db, "appointments"), where("patientId", "==", patientId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function updateAppointment(id, data) {
    await updateDoc(doc(db, "appointments", id), { ...data, updatedAt: serverTimestamp() });
}

export async function getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, "appointments"), where("date", "==", today));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

// ════════════════════════════════════════════════════════════
// PRESCRIPTIONS
// ════════════════════════════════════════════════════════════
export async function addPrescription(data) {
    const docRef = await addDoc(collection(db, "prescriptions"), {
        ...data,
        createdAt: serverTimestamp()
    });
    // Mark appointment as Completed and Disease Form as Completed
    if (data.appointmentId) {
        await updateDoc(doc(db, "appointments", data.appointmentId), { status: "Completed" });
    }
    if (data.diseaseFormId) {
        await updateDoc(doc(db, "diseaseForms", data.diseaseFormId), { status: "Completed" });
    }
    return { id: docRef.id };
}

export async function getPatientPrescriptions(patientId) {
    const q = query(collection(db, "prescriptions"), where("patientId", "==", patientId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snapToArray(snap);
}

export async function getAllPrescriptions() {
    const snap = await getDocs(query(collection(db, "prescriptions"), orderBy("createdAt", "desc")));
    return snapToArray(snap);
}

export async function updatePrescription(id, data) {
    await updateDoc(doc(db, "prescriptions", id), { ...data, updatedAt: serverTimestamp() });
}
