import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown to redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/my-learning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="bg-[#020617] min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-xl w-full mx-auto relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600" />

          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30 animate-in zoom-in duration-500">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Welcome aboard! You have been successfully enrolled.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 inline-block mx-auto max-w-full">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-mono text-sm font-medium text-green-400 break-all">{orderId}</p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/30 border border-white/10 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              What happens now?
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>A confirmation email has been sent to your inbox.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>You have instant access to all course materials.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>Start learning at your own pace!</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/my-learning')}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-500/20"
              size="lg"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              onClick={() => navigate('/courses')}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              Browse More Courses
            </Button>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-sm text-gray-500 mt-8">
            Redirecting to My Learning in <span className="text-white font-bold">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
};
