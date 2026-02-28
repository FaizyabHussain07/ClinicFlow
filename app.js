// ============================================================
// app.js - Cloudinary Upload & PDF Generation
// ClinicFlow - Smart Clinic Management System
// ============================================================

import { CLOUDINARY_CONFIG } from './firebase-config.js';
import { showToast, showLoading, hideLoading } from './assets/js/utils.js';

// ============================================================
// CLOUDINARY - Upload PDF
// ============================================================

/**
 * Upload a PDF Blob to Cloudinary
 * @param {Blob} pdfBlob - The PDF file blob
 * @param {string} fileName - Desired filename
 * @returns {Promise<string>} - Secure URL of the uploaded file
 */
export async function uploadPdfToCloudinary(pdfBlob, fileName) {
    showLoading('Uploading PDF...');
    try {
        const formData = new FormData();
        formData.append('file', pdfBlob, fileName);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('resource_type', 'raw');
        formData.append('public_id', `prescriptions/${fileName}`);

        const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Cloudinary upload failed');
        }

        const result = await response.json();
        hideLoading();
        return result.secure_url;
    } catch (error) {
        hideLoading();
        showToast('PDF upload failed: ' + error.message, 'error');
        throw error;
    }
}

// ============================================================
// jsPDF - Generate Prescription PDF
// ============================================================

/**
 * Generate a prescription PDF using jsPDF
 * @param {Object} prescription - Prescription object
 * @param {Object} patient - Patient object
 * @param {Object} doctor - Doctor object (name)
 * @returns {Blob} - PDF as Blob for upload
 */
export function generatePrescriptionPDF(prescription, patient, doctor) {
    // jsPDF is loaded via CDN in the HTML
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageW = 210;
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    // ─── Helper functions ────────────────────────────────────
    const line = (x1, y1, x2, y2, color = [200, 200, 200]) => {
        pdf.setDrawColor(...color);
        pdf.line(x1, y1, x2, y2);
    };
    const text = (txt, x, yPos, opts = {}) => {
        pdf.text(String(txt), x, yPos, opts);
    };

    // ─── Header ─────────────────────────────────────────────
    // Clinic banner
    pdf.setFillColor(26, 115, 232);
    pdf.rect(0, 0, pageW, 40, 'F');
    pdf.setFillColor(0, 137, 123);
    pdf.rect(0, 32, pageW, 8, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    text('ClinicFlow', margin, 18);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    text('Smart Clinic Management System', margin, 26);

    // Right side - Rx symbol
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    text('℞', pageW - margin - 10, 22, { align: 'right' });

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    text('PRESCRIPTION', pageW - margin, 30, { align: 'right' });

    y = 50;

    // ─── Doctor & Date ──────────────────────────────────────
    pdf.setFillColor(240, 244, 248);
    pdf.roundedRect(margin, y, contentW, 28, 3, 3, 'F');

    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    text('Dr. ' + (doctor.name || 'N/A'), margin + 6, y + 9);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    text('Attending Physician', margin + 6, y + 16);

    // Date on right
    const rawDate = prescription.createdAt?.toDate ? prescription.createdAt.toDate() : (prescription.createdAt ? new Date(prescription.createdAt) : new Date());
    const dateStr = rawDate.toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    text(dateStr, pageW - margin - 6, y + 9, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    text('Date of Prescription', pageW - margin - 6, y + 16, { align: 'right' });

    y += 36;

    // ─── Patient Info ────────────────────────────────────────
    pdf.setFillColor(230, 244, 255);
    pdf.rect(margin, y, contentW, 1, 'F'); // divider

    y += 6;
    pdf.setTextColor(26, 115, 232);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    text('PATIENT INFORMATION', margin, y);

    y += 6;
    line(margin, y, pageW - margin, y, [26, 115, 232]);
    y += 6;

    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const col2 = margin + contentW / 2;
    text(`Name:   ${patient.name || '—'}`, margin, y);
    text(`Age:    ${patient.age || '—'} yrs`, col2, y);
    y += 7;
    text(`Gender: ${patient.gender || '—'}`, margin, y);
    text(`Phone:  ${patient.phone || '—'}`, col2, y);
    y += 14;

    // ─── Medicines ───────────────────────────────────────────
    pdf.setTextColor(26, 115, 232);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    text('PRESCRIBED MEDICINES', margin, y);
    y += 6;
    line(margin, y, pageW - margin, y, [26, 115, 232]);
    y += 8;

    // Table header
    pdf.setFillColor(26, 115, 232);
    pdf.rect(margin, y - 4, contentW, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    text('#', margin + 3, y + 3);
    text('Medicine Name', margin + 12, y + 3);
    text('Dosage', margin + 90, y + 3);
    text('Duration', margin + 130, y + 3);
    y += 10;

    const medicines = prescription.medicines || [];
    medicines.forEach((med, idx) => {
        const rowBg = idx % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        pdf.setFillColor(...rowBg);
        pdf.rect(margin, y - 3, contentW, 9, 'F');

        pdf.setTextColor(30, 41, 59);
        pdf.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
        pdf.setFontSize(9);
        text(String(idx + 1), margin + 3, y + 3);

        pdf.setFont('helvetica', 'normal');
        text(med.name || '—', margin + 12, y + 3);
        text(med.dosage || '—', margin + 90, y + 3);
        text(med.duration || '—', margin + 130, y + 3);
        y += 9;
    });

    y += 10;

    // ─── Notes ──────────────────────────────────────────────
    if (prescription.notes) {
        pdf.setTextColor(26, 115, 232);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        text('DOCTOR\'S NOTES', margin, y);
        y += 6;
        line(margin, y, pageW - margin, y, [26, 115, 232]);
        y += 8;

        pdf.setFillColor(248, 250, 252);
        const noteLines = pdf.splitTextToSize(prescription.notes, contentW - 12);
        const noteH = noteLines.length * 6 + 10;
        pdf.roundedRect(margin, y - 4, contentW, noteH, 3, 3, 'F');
        pdf.setTextColor(30, 41, 59);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        noteLines.forEach(l => { text(l, margin + 6, y + 2); y += 6; });
        y += 10;
    }

    // ─── Signature ──────────────────────────────────────────
    const sigY = Math.max(y, 240);

    line(margin, sigY + 20, margin + 70, sigY + 20, [30, 41, 59]);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    text('Doctor\'s Signature', margin, sigY + 26);
    text('Dr. ' + (doctor.name || ''), margin, sigY + 32);

    // ─── Footer ─────────────────────────────────────────────
    pdf.setFillColor(26, 115, 232);
    pdf.rect(0, 282, pageW, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    text('ClinicFlow – Smart Clinic Management System', pageW / 2, 291, { align: 'center' });
    text('This prescription is valid for 30 days from the date of issue.', pageW / 2, 296, { align: 'center' });

    // Return as blob
    return pdf.output('blob');
}

/**
 * Download PDF locally (for preview)
 */
export function downloadPrescriptionPDF(prescription, patient, doctor) {
    const { jsPDF } = window.jspdf;
    const blob = generatePrescriptionPDF(prescription, patient, doctor);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${patient.name?.replace(/\s/g, '_')}_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
}
