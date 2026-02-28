// ============================================================
// app.js - Optimized Pharmaceutical Engine & Cloud Archival
// ClinicFlow - Smart Clinic Management System
// ============================================================

import { CLOUDINARY_CONFIG } from './firebase-config.js';
import { showToast, showLoading, hideLoading, generatePrescriptionPDF, uploadPdfToCloudinary as utilUpload } from './assets/js/utils.js';

// Re-export for compatibility across legacy portal pages
export { generatePrescriptionPDF } from './assets/js/utils.js';

/**
 * Optimized PDF Archival stream
 * This ensures zero-friction delivery by using 'raw' file storage.
 */
export async function uploadPdfToCloudinary(pdfBlob, fileName) {
    showLoading('Archiving Prescription...');
    try {
        // Use the centralized utility with the refined 'raw' storage logic
        const secureUrl = await utilUpload(pdfBlob, fileName);
        hideLoading();
        return secureUrl;
    } catch (error) {
        hideLoading();
        console.error("Critical Archival Failure:", error);
        showToast('Prescription storage failed: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Download PDF locally as a fallback mechanism
 */
export function downloadPrescriptionPDF(prescription, patient, doctor) {
    try {
        const blob = generatePrescriptionPDF(prescription, patient, doctor);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = (patient?.name || 'patient').replace(/\s/g, '_');
        a.download = `RX_${safeName}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Prescription downloaded locally.', 'success');
    } catch (e) {
        showToast('Manual download failed.', 'error');
    }
}
