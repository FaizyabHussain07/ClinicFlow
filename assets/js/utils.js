// ============================================================
// utils.js - Shared Utility Functions
// ClinicFlow - Smart Clinic Management System
// ============================================================

import { CLOUDINARY_CONFIG } from '../../firebase-config.js';

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const icons = {
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all .3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function createToastContainer() {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
}

/**
 * Show/hide global loading overlay
 */
export function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `<div class="spinner"></div><p class="loading-text">${message}</p>`;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-text').textContent = message;
        overlay.classList.remove('hidden');
    }
}

export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

/**
 * Open / Close modal
 */
export function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

export function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Auto-bind close on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
    if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
    }
});

/**
 * Format Firestore Timestamp or Date
 */
export function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function todayStr() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatDateInput(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
}

/**
 * Get initials from a full name
 */
export function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Debounce a function
 */
export function debounce(fn, delay = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate a status badge HTML
 */
export function statusBadge(status) {
    const s = (status || '').toLowerCase();
    return `<span class="status-badge status-${s}">${status}</span>`;
}

/**
 * Setup sidebar hamburger toggle for mobile
 */
export function setupSidebarToggle() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!hamburger || !sidebar) return;

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
}

/**
 * Highlight active nav link based on current filename
 */
export function setActiveNav() {
    const current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-item').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes(current)) link.classList.add('active');
    });
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Build a table row for patients
 */
export function buildPatientRow(p, canEdit = true) {
    return `
    <tr>
      <td>
        <div class="flex gap-8" style="align-items:center">
          <div class="user-avatar" style="width:32px;height:32px;font-size:12px;">${getInitials(p.name)}</div>
          <div>
            <div class="fw-600">${p.name}</div>
            <div class="text-muted fs-12">#${p.id.slice(0, 6).toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td>${p.age} yrs</td>
      <td>${capitalize(p.gender)}</td>
      <td>${p.phone}</td>
      <td>${p.address || '—'}</td>
      <td>${formatDate(p.createdAt)}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="viewPatient('${p.id}')">View</button>
          ${canEdit ? `
            <button class="btn btn-primary btn-sm" onclick="editPatient('${p.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deletePatientConfirm('${p.id}','${p.name}')">Del</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

/**
 * Render an empty state into a container
 */
export function renderEmptyState(container, title, desc) {
    container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      </div>
      <h3>${title}</h3>
      <p>${desc}</p>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════
// SKELETON SCREEN HELPERS
// Use these instead of spinners for a faster-feeling UI
// ════════════════════════════════════════════════════════════

/**
 * Render skeleton rows into a <tbody>
 * @param {HTMLElement} tbody
 * @param {number} cols  – number of table columns
 * @param {number} rows  – number of skeleton rows to show (default 5)
 */
export function skeletonRows(tbody, cols, rows = 5) {
    const widths = ['sk-w-50', 'sk-w-70', 'sk-w-40', 'sk-w-60', 'sk-w-30', 'sk-w-80'];
    tbody.innerHTML = Array.from({ length: rows }, () => `
        <tr>
          <td>
            <div class="skeleton-row" style="padding:0;">
              <div class="skeleton skeleton-avatar"></div>
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                <div class="skeleton skeleton-line sk-w-60"></div>
                <div class="skeleton skeleton-line sk-w-30" style="height:10px;"></div>
              </div>
            </div>
          </td>
          ${Array.from({ length: cols - 1 }, (_, i) =>
        `<td><div class="skeleton skeleton-line ${widths[i % widths.length]}"></div></td>`
    ).join('')}
        </tr>`).join('');
}

/**
 * Set stat card value elements to a shimmer skeleton
 * @param {...string} ids – element IDs of stat value elements
 */
export function skeletonStats(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="skeleton" style="width:48px;height:28px;display:inline-block;border-radius:6px;"></div>';
    });
}

/**
 * Animate counter from 0 to target
 */
export function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '0';
    if (target === 0) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
    }, 40);
}

/**
 * Generate Prescription PDF using jsPDF
 */
export function generatePrescriptionPDF(rx, patient, doctor) {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) throw new Error("jsPDF library not initialized on this portal.");
        const doc = new jsPDF();

        // ── Design Tokens ──
        const PRIMARY_COLOR = [26, 115, 232];
        const TEXT_COLOR = [30, 41, 59];
        const MUTED_COLOR = [100, 116, 139];

        // ── Header ──
        doc.setFontSize(24);
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.setFont("helvetica", "bold");
        doc.text("CLINICFLOW", 20, 25);

        doc.setFontSize(10);
        doc.setTextColor(MUTED_COLOR[0], MUTED_COLOR[1], MUTED_COLOR[2]);
        doc.setFont("helvetica", "normal");
        doc.text("Smart Clinic Management & Digital Health Records", 20, 31);

        doc.setDrawColor(226, 232, 240);
        doc.line(20, 35, 190, 35);

        // ── Doctor Credentials ──
        doc.setFontSize(12);
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.setFont("helvetica", "bold");
        doc.text(`Dr. ${doctor?.name || 'Clinical Staff'}`, 20, 48);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(MUTED_COLOR[0], MUTED_COLOR[1], MUTED_COLOR[2]);
        doc.text(`${doctor?.specialization || 'Attending Physician'}`, 20, 53);
        doc.text(`${doctor?.qualification || 'MBBS / Medical Officer'}`, 20, 58);

        // ── Patient Info Box ──
        doc.setFillColor(248, 250, 252);
        doc.rect(20, 68, 170, 28, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(20, 68, 170, 28, 'S');

        doc.setFontSize(10);
        doc.setTextColor(MUTED_COLOR[0], MUTED_COLOR[1], MUTED_COLOR[2]);
        doc.text("PATIENT NAME", 25, 78);
        doc.text("GENDER / AGE", 25, 87);
        doc.text("CONSULT DATE", 130, 78);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text((patient?.name || 'Anonymous Patient').toUpperCase(), 60, 78);
        doc.text(`${patient?.gender || 'N/A'} / ${patient?.age || '--'} yrs`, 60, 87);
        doc.text(formatDate(rx.createdAt || Date.now()), 160, 78);

        // ── Rx Symbol ──
        doc.setFontSize(28);
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.text("Rx", 20, 115);
        doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.line(20, 118, 35, 118);

        // ── Prescription Grid ──
        let currentY = 130;
        doc.setFontSize(11);
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.setFont("helvetica", "bold");
        doc.text("MEDICATION DETAILS", 20, currentY);
        doc.setTextColor(MUTED_COLOR[0], MUTED_COLOR[1], MUTED_COLOR[2]);
        doc.text("DOSAGE", 110, currentY);
        doc.text("DURATION", 160, currentY);

        doc.setDrawColor(226, 232, 240);
        doc.line(20, currentY + 3, 190, currentY + 3);
        currentY += 12;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

        const meds = rx.medicines || [];
        if (meds.length === 0) {
            doc.setFont("helvetica", "italic");
            doc.text("No specific medications prescribed.", 20, currentY);
            currentY += 10;
        } else {
            meds.forEach(m => {
                doc.setFont("helvetica", "bold");
                doc.text(m.name || 'Generic Med', 20, currentY);
                doc.setFont("helvetica", "normal");
                doc.text(m.dosage || 'As directed', 110, currentY);
                doc.text(m.duration || 'Until finish', 160, currentY);
                currentY += 9;
            });
        }

        // ── Clinical Advice ──
        if (rx.instructions) {
            currentY += 12;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
            doc.text("PHYSICIAN ADVICE / INSTRUCTIONS:", 20, currentY);
            currentY += 7;

            doc.setFont("helvetica", "normal");
            doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
            doc.setFontSize(10);

            const splitText = doc.splitTextToSize(rx.instructions, 170);
            doc.text(splitText, 20, currentY);
            currentY += (splitText.length * 6) + 10;
        }

        // ── Legal Footer ──
        doc.setFontSize(8);
        doc.setTextColor(MUTED_COLOR[0], MUTED_COLOR[1], MUTED_COLOR[2]);
        doc.text("This document is a digitally issued electronic prescription (E-Rx).", 105, 280, { align: 'center' });
        doc.text("System ID: " + (rx.id || 'TEMP') + " | ClinicFlow Portal", 105, 285, { align: 'center' });

        return doc.output('blob', { type: 'application/pdf' });
    } catch (e) {
        console.error("PDF Generation Failure:", e);
        throw new Error("Could not assemble prescription layout: " + e.message);
    }
}

/**
 * Upload PDF to Cloudinary - Optimized for Direct Download & Visibility
 */
export async function uploadPdfToCloudinary(blob, filename) {
    const { cloudName, uploadPreset, apiUrl } = CLOUDINARY_CONFIG;

    const formData = new FormData();
    const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    const file = new File([blob], safeName, { type: 'application/pdf' });

    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Using 'auto' allows Cloudinary to handle it as an image/media resource
    // which provides the best compatibility and preview support.
    formData.append('resource_type', 'auto');

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("Cloudinary Archival Failure:", errorData);
            throw new Error(errorData.error?.message || 'Storage bank rejected the transmission');
        }

        const data = await res.json();
        let url = data.secure_url;

        // Transform the URL to force a direct download when clicked
        // By injecting fl_attachment after /upload/
        if (url.includes('/upload/')) {
            url = url.replace('/upload/', '/upload/fl_attachment/');
        }

        return url;
    } catch (error) {
        console.error("Cloudinary Protocol Exception:", error);
        throw error;
    }
}
