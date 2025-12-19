import { X, Download, Award } from 'lucide-react';
import { useRef } from 'react';

export const CertificateModal = ({ certificateData, onClose }) => {
  const certificateRef = useRef(null);

  if (!certificateData) return null;

  const { userName, courseTitle, completionDate, certificateId, instructorName } = certificateData;

  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Close and Download buttons - hide on print */}
        <div className="absolute top-4 right-4 flex gap-2 z-10 print:hidden">
          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition"
            title="Download as PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-900 p-2 rounded-full shadow-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate */}
        <div 
          ref={certificateRef}
          className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-8 rounded-lg print:p-0"
        >
          <div className="bg-white rounded-lg shadow-2xl p-12 relative">
            {/* Border decoration */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-blue-600 rounded-md pointer-events-none">
              <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-purple-300 rounded-sm" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Logo/Header */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-blue-600 tracking-widest uppercase">
                  Course Platform
                </h1>
              </div>

              {/* Certificate Title */}
              <div className="mb-8">
                <h2 className="text-6xl font-bold text-gray-800 tracking-wider uppercase mb-2">
                  Certificate
                </h2>
                <p className="text-2xl text-gray-600 tracking-wider uppercase">
                  of Completion
                </p>
              </div>

              {/* Recipient */}
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-2 italic">This is to certify that</p>
                <h3 className="text-4xl font-bold text-gray-900 mb-4 border-b-2 border-blue-600 inline-block pb-2 px-8">
                  {userName}
                </h3>
                <p className="text-lg text-gray-600 mb-2 italic">has successfully completed</p>
                <h4 className="text-3xl font-semibold text-gray-800 mb-6">
                  {courseTitle}
                </h4>
              </div>

              {/* Award Icon */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full">
                  <Award className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Details */}
              <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-300">
                <div className="text-left">
                  <p className="text-sm text-gray-600 mb-1">Completion Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">{certificateId}</p>
                </div>

                <div className="text-right">
                  <div className="border-t-2 border-gray-900 pt-2 mb-1">
                    <p className="text-lg font-semibold text-gray-900">{instructorName}</p>
                  </div>
                  <p className="text-sm text-gray-600">Instructor</p>
                </div>
              </div>

              {/* Verification Notice */}
              <div className="mt-8 text-xs text-gray-500">
                <p>Verify this certificate at: courseplatform.com/verify/{certificateId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Instructions */}
        <div className="text-center mt-4 text-sm text-gray-300 print:hidden">
          <p>Click the download button above, then use your browser's print function to save as PDF</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${certificateRef.current} {
            visibility: visible;
          }
          ${certificateRef.current} * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};
