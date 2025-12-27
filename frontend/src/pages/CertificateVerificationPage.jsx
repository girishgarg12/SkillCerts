import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
    Search,
    ShieldCheck,
    XCircle,
    CheckCircle2,
    CheckCircle,
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { CertificateTemplate } from "../components/ui/CertificateTemplate";
import { certificateService } from "../services/certificateService";

export const CertificateVerificationPage = () => {
    const { certificateId: urlCertificateId } = useParams();
    const [searchParams] = useSearchParams();

    const [certificateId, setCertificateId] = useState(
        urlCertificateId || searchParams.get("id") || ""
    );
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (urlCertificateId) {
            verifyCertificate(urlCertificateId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlCertificateId]);

    const verifyCertificate = async (id) => {
        const certId = (id || certificateId).trim();

        if (!certId) {
            setError("Please enter a certificate ID");
            setCertificate(null);
            setSearched(true);
            return;
        }

        setLoading(true);
        setError("");
        setCertificate(null);
        setSearched(true);

        try {
            const res = await certificateService.verifyCertificate(certId);

            if (res.success && res.certificate) {
                setCertificate(res.certificate);
            } else {
                setError("Certificate not found or invalid");
            }
        } catch (err) {
            setError(
                err?.response?.data?.message || "Certificate not found or invalid"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-[#f8fafc] px-2 py-8 sm:px-4 sm:py-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 transform rotate-6">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                        Certificate Verification
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        Verify the authenticity of any SkillCerts certificate instantly
                    </p>
                </div>

                {/* Search */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            verifyCertificate();
                        }}
                        className="flex flex-col gap-4 sm:flex-row"
                    >
                        <input
                            type="text"
                            value={certificateId}
                            onChange={(e) => setCertificateId(e.target.value)}
                            placeholder="Enter Certificate ID (e.g. SC-934B47CAE8B6)"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />

                        <Button disabled={loading} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold w-full sm:w-auto">
                            {loading ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Verify
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Result */}
                {searched && (
                    <div className="mt-8 transform transition-all duration-300">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : certificate ? (
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-1">
                                {/* Certificate Template usually has its own styling, let's wrap it nicely */}
                                <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                                    <CertificateTemplate
                                        userName={certificate?.user?.name}
                                        courseTitle={certificate?.course?.title}
                                        instructorName={certificate?.course?.instructor?.name}
                                        certificateId={certificate?.certificateId}
                                        completionDate={
                                            certificate?.completionDate ||
                                            (certificate?.issuedAt ? new Date(certificate.issuedAt).toDateString() : "")
                                        }
                                    />
                                </div>

                                <div className="p-4 mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                    <span className="text-blue-300 font-medium">This certificate is valid and verified.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Verification Failed</h3>
                                <p className="text-red-300 font-medium">{error}</p>
                                <p className="text-gray-400 text-sm mt-4">
                                    Please check the Certificate ID and try again. Ensure there are no typos.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
