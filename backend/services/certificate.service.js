import { Certificate } from '../model/certificate.model.js';
import { Enrollment } from '../model/enrollment.model.js';
import { generateCertificateId } from '../utils/certificateGenerator.js';
import { generateCertificateHTML } from '../utils/certificateTemplate.js';

export const certificateService = {
    async verifyCertificateJson(certificateId) {
        const certificate = await Certificate.findOne({ certificateId })
            .populate('user', 'name')
            .populate('course', 'title instructor')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' },
            });

        if (!certificate) {
            throw new Error('Certificate not found');
        }

        const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
            'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        );

        return {
            certificate: {
                user: { name: certificate.user.name },
                course: {
                    title: certificate.course.title,
                    instructor: { name: certificate.course.instructor.name },
                },
                issuedAt: certificate.issuedAt,
                completionDate,
                certificateId: certificate.certificateId,
            },
        };
    },

    async generateCertificate(courseId, userId) {
        // Check if enrollment exists and is completed
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
        });

        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        if (!enrollment.completed) {
            throw new Error('Course must be completed to generate certificate');
        }

        // Check if certificate already exists
        let certificate = await Certificate.findOne({
            user: userId,
            course: courseId,
        });

        if (certificate) {
            const populatedCertificate = await Certificate.findById(
                certificate._id
            ).populate('course', 'title');
            return {
                isNew: false,
                certificate: populatedCertificate,
            };
        }

        // Generate certificate ID
        const certificateId = generateCertificateId();

        // Save certificate record (PDF generated on-demand)
        certificate = await Certificate.create({
            user: userId,
            course: courseId,
            certificateId,
            issuedAt: new Date(),
        });

        const populatedCertificate = await Certificate.findById(
            certificate._id
        ).populate('course', 'title slug thumbnail');

        return {
            isNew: true,
            certificate: populatedCertificate,
        };
    },

    async getMyCertificates(userId) {
        return await Certificate.find({ user: userId })
            .populate('course', 'title slug thumbnail instructor')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' },
            })
            .sort({ issuedAt: -1 });
    },

    async getCertificate(courseId, userId) {
        const certificate = await Certificate.findOne({
            user: userId,
            course: courseId,
        }).populate('course', 'title slug thumbnail instructor');

        if (!certificate) {
            throw new Error('Certificate not found');
        }

        return certificate;
    },

    async viewCertificate(courseId, userId) {
        const certificate = await Certificate.findOne({
            user: userId,
            course: courseId,
        })
            .populate('course', 'title instructor')
            .populate('user', 'name')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' },
            });

        if (!certificate) {
            throw new Error('Certificate not found');
        }

        // Return certificate data as JSON for frontend rendering
        return {
            userName: certificate.user.name,
            courseTitle: certificate.course.title,
            completionDate: certificate.issuedAt,
            certificateId: certificate.certificateId,
            instructorName: certificate.course.instructor.name,
        };
    },

    async verifyCertificateHtml(certificateId) {
        const certificate = await Certificate.findOne({ certificateId })
            .populate('user', 'name')
            .populate('course', 'title instructor')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' },
            });

        if (!certificate) {
            return null;
        }

        const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
            'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }
        );

        // Generate HTML certificate for public view
        return generateCertificateHTML({
            userName: certificate.user.name,
            courseTitle: certificate.course.title,
            completionDate,
            certificateId: certificate.certificateId,
            instructorName: certificate.course.instructor.name,
        });
    }
};
