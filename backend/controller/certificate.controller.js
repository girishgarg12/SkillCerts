import { certificateService } from '../services/certificate.service.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Verify certificate (Public endpoint - returns JSON)
 */
export const verifyCertificateJson = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const result = await certificateService.verifyCertificateJson(certificateId);
    return res.json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'Certificate not found') {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    console.error('Verify certificate JSON error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify certificate' });
  }
};

/**
 * Generate certificate for completed course (only creates DB record)
 */
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await certificateService.generateCertificate(courseId, req.user._id);

    if (!result.isNew) {
      return ApiResponse.success('Certificate already exists', result.certificate).send(res);
    }

    return ApiResponse.created('Certificate generated successfully', result.certificate).send(res);
  } catch (error) {
    if (error.message === 'Enrollment not found') {
      return ApiResponse.notFound('Enrollment not found').send(res);
    }
    if (error.message === 'Course must be completed to generate certificate') {
      return ApiResponse.badRequest(error.message).send(res);
    }
    console.error('Generate certificate error:', error);
    return ApiResponse.serverError('Failed to generate certificate').send(res);
  }
};

/**
 * Get all certificates for current user
 */
export const getMyCertificates = async (req, res) => {
  try {
    const certificates = await certificateService.getMyCertificates(req.user._id);
    return ApiResponse.success('Certificates fetched successfully', certificates).send(res);
  } catch (error) {
    console.error('Get certificates error:', error);
    return ApiResponse.serverError('Failed to fetch certificates').send(res);
  }
};

/**
 * Get single certificate
 */
export const getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const certificate = await certificateService.getCertificate(courseId, req.user._id);
    return ApiResponse.success('Certificate fetched successfully', certificate).send(res);
  } catch (error) {
    if (error.message === 'Certificate not found') {
      return ApiResponse.notFound('Certificate not found').send(res);
    }
    console.error('Get certificate error:', error);
    return ApiResponse.serverError('Failed to fetch certificate').send(res);
  }
};

/**
 * View certificate - returns JSON data for frontend rendering
 */
export const viewCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const certificateData = await certificateService.viewCertificate(courseId, req.user._id);
    return ApiResponse.success('Certificate data fetched successfully', certificateData).send(res);
  } catch (error) {
    if (error.message === 'Certificate not found') {
      return ApiResponse.notFound('Certificate not found').send(res);
    }
    console.error('View certificate error:', error);
    return ApiResponse.serverError('Failed to view certificate').send(res);
  }
};

/**
 * Verify certificate (Public endpoint - returns HTML)
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const html = await certificateService.verifyCertificateHtml(certificateId);

    if (!html) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .error { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; margin-bottom: 10px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Certificate Not Found</h1>
            <p>The certificate ID <strong>${certificateId}</strong> is not valid.</p>
          </div>
        </body>
        </html>
      `);
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Verify certificate error:', error);
    return res.status(500).send('Failed to verify certificate');
  }
};
