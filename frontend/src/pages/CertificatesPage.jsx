import { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { certificateService } from '../services/certificateService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatDate } from '../lib/utils';
import { CertificateModal } from '../components/ui/CertificateModal';
import { downloadCertificate } from '../lib/downloadCertificate';
import { CardContainer, CardBody, CardItem } from '../components/ui/3DCard';

export const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateService.getMyCertificates();
      setCertificates(response.data || []);
    } catch (error) {
      toast.error('Failed to load certificates');
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (certificate) => {
    try {
      setViewLoading(true);
      const response = await certificateService.viewCertificate(certificate.course._id);
      setSelectedCertificate(response.data);
      toast.success('Certificate loaded');
    } catch (error) {
      toast.error('Failed to view certificate');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      setDownloadingId(certificate._id);

      // Fetch certificate data
      const response = await certificateService.viewCertificate(certificate.course._id);
      const certData = response.data;

      // Format date
      const formattedDate = new Date(certData.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Use the utility function to download
      await downloadCertificate({
        userName: certData.userName,
        courseTitle: certData.courseTitle,
        completionDate: formattedDate,
        certificateId: certData.certificateId,
        instructorName: certData.instructorName,
      });

      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleVerify = (certificateId) => {
    window.open(`/verify-certificate/${certificateId}`, '_blank');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-slate-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 transform rotate-3">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">My Certificates</h1>
          <p className="text-gray-400 text-lg">
            Showcase your achievements and continuous learning journey
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center max-w-2xl mx-auto">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-6 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-3">
              No certificates earned yet
            </h3>
            <p className="text-gray-400 mb-8 mx-auto">
              Complete courses to earn recognized certificates. Start your learning journey today and build your professional portfolio.
            </p>
            <Button onClick={() => window.location.href = '/courses'} className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 rounded-full">
              Explore Courses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <CardContainer key={certificate._id} className="inter-var w-full h-full">
                <CardBody className="bg-[#1e293b]/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl overflow-hidden border border-white/10 transition-all duration-300 backdrop-blur-md flex flex-col justify-between p-0">
                  <div className="w-full">
                    <CardItem translateZ="50" className="w-full">
                      <div className="h-32 bg-gradient-to-r from-blue-900 to-slate-900 relative p-6 w-full">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Award className="w-32 h-32 transform rotate-12" />
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Award className="w-6 h-6 text-yellow-400" />
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-md">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </CardItem>

                    <div className="p-6">
                      <CardItem translateZ="40" className="w-full">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 h-14">
                          {certificate.course?.title || 'Course Title'}
                        </h3>
                      </CardItem>

                      <CardItem translateZ="30" className="w-full space-y-3 mb-6 text-sm text-gray-400">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span>ID</span>
                          <span className="font-mono font-medium text-gray-300 text-xs">
                            {certificate.certificateId}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span>Issued</span>
                          <span className="font-medium text-gray-300">
                            {formatDate(certificate.issuedAt)}
                          </span>
                        </div>
                      </CardItem>

                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <CardItem translateZ="20" className="w-full">
                            <Button
                              onClick={() => handleView(certificate)}
                              className="w-full bg-white/10 hover:bg-white/20 text-white border-none"
                              size="sm"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </CardItem>

                          <CardItem translateZ="20" className="w-full">
                            <Button
                              onClick={() => handleDownload(certificate)}
                              variant="outline"
                              className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                              size="sm"
                              disabled={downloadingId === certificate._id}
                            >
                              {downloadingId === certificate._id ? (
                                <>
                                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Wait...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  PDF
                                </>
                              )}
                            </Button>
                          </CardItem>
                        </div>

                        <CardItem translateZ="20" className="w-full">
                          <Button
                            onClick={() => handleVerify(certificate.certificateId)}
                            variant="ghost"
                            className="w-full text-gray-400 hover:text-white"
                            size="sm"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Verify Authenticity
                          </Button>
                        </CardItem>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        )}

        {/* Info Section */}
        {certificates.length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-blue-900/20 to-slate-900/20 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Award className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  About Your Certificates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <p className="text-gray-300 text-sm">Digitally signed and cryptographically secure.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <p className="text-gray-300 text-sm">Valid lifetime proof of your achievement.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <p className="text-gray-300 text-sm">Download high-quality PDF for printing.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <p className="text-gray-300 text-sm">Shareable ID for employer verification.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {selectedCertificate && (
          <CertificateModal
            certificateData={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </div>
    </div>
  );
};
