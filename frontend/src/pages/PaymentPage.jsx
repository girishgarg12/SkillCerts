import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Lock, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { courseService } from '../services/courseService';
import { paymentService } from '../services/paymentService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { Alert } from '../components/ui/Alert';
import { formatCurrency } from '../lib/utils';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentPage = () => {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    fetchCourse();
    loadScript();
  }, [id]);

  const loadScript = async () => {
    const loaded = await loadRazorpayScript();
    setScriptLoaded(loaded);
    if (!loaded) {
      setError('Failed to load payment gateway. Please refresh the page.');
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await courseService.getCourse(id);
      setCourse(response.data);
    } catch (error) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      console.log('Creating order for course ID:', id);
      // Step 1: Create order on backend
      const orderResponse = await paymentService.createOrder(id);
      console.log('Order response:', orderResponse);
      const { orderId, amount, currency, key, courseTitle } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'SkillCerts',
        description: courseTitle,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Payment successful - redirect to success page
            navigate(`/payment/success?orderId=${response.razorpay_order_id}`);
          } catch (error) {
            setError('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          courseId: id,
        },
        theme: {
          color: '#3b82f6', // Blue to match theme
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      setError(error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!course) return <Alert variant="error">Course not found</Alert>;

  return (
    <div className="bg-[#020617] min-h-screen text-[#f8fafc] pt-20 pb-12">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-400/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Checkout</h1>
          <p className="text-gray-400">Complete your purchase to unlock full access</p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-lg font-semibold text-white">Payment Details</h2>
              </div>
              <div className="p-6">
                {/* Course Details */}
                <div className="flex gap-4 mb-8 pb-8 border-b border-white/10">
                  <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg relative cursor-pointer group">
                    <img
                      src={course.thumbnail || 'https://via.placeholder.com/120x80'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1.5">{course.title}</h3>
                    {course.instructor && (
                      <p className="text-sm text-gray-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-slate-500 flex items-center justify-center text-[10px] font-bold">
                          {course.instructor.name.charAt(0)}
                        </span>
                        By {course.instructor.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-400">
                    <span>Course Price</span>
                    <span className="font-medium text-white">{formatCurrency(course.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Platform Fee</span>
                    <span className="font-medium text-green-400">FREE</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-400">
                        {formatCurrency(course.price)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-blue-200 font-medium mb-1">100% Secure Payment</h4>
                    <p className="text-sm text-blue-300/70">
                      Your payment information is encrypted and processed securely. We never store your card details.
                    </p>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || !scriptLoaded}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 py-4 rounded-xl text-lg font-bold transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay {formatCurrency(course.price)} securely
                    </>
                  )}
                </Button>

                {/* Payment Methods */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-gray-500 mb-4">We accept major credit cards and more</p>
                  <div className="flex flex-wrap justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                    {['UPI', 'VISA', 'MasterCard', 'Rupay', 'Paytm', 'GPay'].map((method) => (
                      <div key={method} className="bg-white/10 px-3 py-1.5 rounded-md border border-white/5 text-xs font-bold text-gray-300">
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sticky top-24 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h3 className="font-semibold text-white">Order Summary</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">What you'll get</h4>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/20 text-green-400 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-gray-300">Full lifetime access</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/20 text-green-400 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-gray-300">Access to source code & assets</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/20 text-green-400 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-gray-300">Certificate of completion</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-green-500/20 text-green-400 mt-0.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-gray-300">Premium support</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                      <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-200">Instant Access</h4>
                        <p className="text-xs text-blue-300/70 mt-0.5">
                          Start learning immediately after payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
