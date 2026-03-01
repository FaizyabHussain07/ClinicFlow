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
 * Generate Prescription Image using Canvas API
 */
export async function generatePrescriptionImage(rx, patient, doctor) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Constants
        const PRIMARY = '#1a73e8';
        const TEXT = '#1e293b';
        const MUTED = '#64748b';

        ctx.fillStyle = PRIMARY;
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('CLINICFLOW', 40, 60);

        ctx.fillStyle = MUTED;
        ctx.font = '16px sans-serif';
        ctx.fillText('Smart Clinic Management & Digital Health Records', 40, 85);

        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath(); ctx.moveTo(40, 105); ctx.lineTo(760, 105); ctx.stroke();

        ctx.fillStyle = TEXT;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Dr. ' + (doctor?.name || 'Clinical Staff'), 40, 145);

        ctx.fillStyle = MUTED;
        ctx.font = '16px sans-serif';
        ctx.fillText(doctor?.specialization || 'Attending Physician', 40, 165);
        ctx.fillText(doctor?.qualification || 'MBBS / Medical Officer', 40, 185);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(40, 220, 720, 100);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(40, 220, 720, 100);

        ctx.fillStyle = MUTED;
        ctx.font = '14px sans-serif';
        ctx.fillText('PATIENT NAME', 60, 250);
        ctx.fillText('GENDER / AGE', 60, 290);
        ctx.fillText('CONSULT DATE', 500, 250);

        ctx.fillStyle = TEXT;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText((patient?.name || 'Anonymous Patient').toUpperCase(), 200, 250);
        ctx.fillText((patient?.gender || 'N/A') + ' / ' + (patient?.age || '--') + ' yrs', 200, 290);
        ctx.fillText(formatDate(rx.createdAt || Date.now()), 630, 250);

        ctx.fillStyle = PRIMARY;
        ctx.font = 'bold 48px serif';
        ctx.fillText('Rx', 40, 380);

        let curY = 440;
        ctx.fillStyle = TEXT;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('MEDICATION DETAILS', 40, curY);
        ctx.fillStyle = MUTED;
        ctx.fillText('DOSAGE', 400, curY);
        ctx.fillText('DURATION', 580, curY);

        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath(); ctx.moveTo(40, curY + 15); ctx.lineTo(760, curY + 15); ctx.stroke();
        curY += 50;

        ctx.fillStyle = TEXT;
        const meds = rx.medicines || [];
        if (meds.length === 0) {
            ctx.font = 'italic 16px sans-serif';
            ctx.fillText('No specific medications prescribed.', 40, curY);
            curY += 40;
        } else {
            meds.forEach(m => {
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(m.name || 'Generic Med', 40, curY);
                ctx.font = '16px sans-serif';
                ctx.fillText(m.dosage || 'As directed', 400, curY);
                ctx.fillText(m.duration || 'Until finish', 580, curY);
                curY += 35;
            });
        }

        if (rx.instructions) {
            curY += 40;
            ctx.fillStyle = PRIMARY;
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('PHYSICIAN ADVICE / INSTRUCTIONS:', 40, curY);
            curY += 30;
            ctx.fillStyle = TEXT;
            ctx.font = '16px sans-serif';

            const words = rx.instructions.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > 700 && n > 0) {
                    ctx.fillText(line, 40, curY);
                    line = words[n] + ' ';
                    curY += 25;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 40, curY);
        }

        ctx.fillStyle = MUTED;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('This document is a digitally issued electronic prescription (E-Rx).', 400, 950);
        ctx.fillText('System ID: ' + (rx.id || 'TEMP') + ' | ClinicFlow Portal', 400, 970);

        canvas.toBlob(blob => {
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
}

/**
 * Upload Image to Cloudinary - Optimized for Direct Download & Visibility
 */
export async function uploadImageToCloudinary(blob, filename) {
    const { cloudName, uploadPreset, apiUrl } = CLOUDINARY_CONFIG;

    const formData = new FormData();
    const safeName = filename.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`;
    const file = new File([blob], safeName, { type: 'image/jpeg' });

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
