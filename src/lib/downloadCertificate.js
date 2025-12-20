import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import { CertificateTemplate } from '../components/ui/CertificateTemplate';

import React from 'react';

/**
 * Download certificate as PDF
 * Renders the actual CertificateTemplate component to ensure consistency
 * 
 * @param {Object} certificateData - Certificate information
 * @param {string} certificateData.userName - Student name
 * @param {string} certificateData.courseTitle - Course title
 * @param {string} certificateData.completionDate - Formatted completion date
 * @param {string} certificateData.certificateId - Unique certificate ID
 * @param {string} certificateData.instructorName - Instructor name
 * @returns {Promise<void>}
 */
export const downloadCertificate = async (certificateData) => {
  const { userName, courseTitle, completionDate, certificateId, instructorName } = certificateData;

  // Create temporary container for rendering the React component
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1400px'; // Larger for better quality
  tempContainer.style.height = '990px'; // A4 landscape aspect ratio (1.414:1)
  tempContainer.style.zIndex = '-1';
  document.body.appendChild(tempContainer);

  // Create a wrapper for the certificate
  const certificateWrapper = document.createElement('div');
  certificateWrapper.style.width = '100%';
  certificateWrapper.style.height = '100%';
  tempContainer.appendChild(certificateWrapper);

  // Render the React component
  const root = createRoot(certificateWrapper);
  
  // Wrap in a promise to wait for rendering
  await new Promise((resolve) => {
    root.render(
      React.createElement(CertificateTemplate, {
        userName,
        courseTitle,
        completionDate,
        certificateId,
        instructorName,
      })
    );
    // Wait for render and styles to apply
    setTimeout(resolve, 500);
  });

  // Capture as canvas with high quality
  const canvas = await html2canvas(certificateWrapper, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: certificateWrapper.offsetWidth,
    height: certificateWrapper.offsetHeight,
  });

  // Cleanup
  root.unmount();
  document.body.removeChild(tempContainer);

  // Convert to PDF
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Add image to fill the entire page
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

  // Generate filename
  const sanitizedCourseName = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const sanitizedUserName = userName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `skillcert_certificate_${sanitizedUserName}_${sanitizedCourseName}.pdf`;

  // Download PDF
  pdf.save(filename);
};
