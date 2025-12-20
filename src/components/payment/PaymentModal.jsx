import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { enrollmentService } from '../../services/enrollmentService';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import toast from 'react-hot-toast';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true);
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const PaymentModal = ({ course, isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadScript();
    }
  }, [isOpen]);

  const loadScript = async () => {
    const loaded = await loadRazorpayScript();
    setScriptLoaded(loaded);
    if (!loaded) {
      setError('Failed to load payment gateway. Please check your internet connection.');
    }
  };

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway not loaded. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
        // Handle Mock Courses
        if (course._id && (course._id.startsWith('mock-') || (typeof course.id === 'string' && course.id.startsWith('mock-')))) {
            setTimeout(() => {
                const mockEnrollments = JSON.parse(localStorage.getItem('mockEnrollments') || '[]');
                const courseId = course._id || course.id;
                if (!mockEnrollments.includes(courseId)) {
                    localStorage.setItem('mockEnrollments', JSON.stringify([...mockEnrollments, courseId]));
                }
                toast.success('Successfully enrolled (Mock)!');
                setLoading(false);
                onClose();
                navigate('/my-learning');
            }, 1500);
            return;
        }

       // Handle Free Courses
      if (course.isFree) {
        await enrollmentService.enrollCourse(course._id || course.id);
        toast.success('Successfully enrolled!');
        setLoading(false);
        onClose();
        navigate('/my-learning');
        return;
      }

      // Handle Paid Courses - Step 1: Create Order
      const orderResponse = await paymentService.createOrder(course._id || course.id);
      const { orderId, amount, currency, key, courseTitle } = orderResponse.data;

      // Step 2: Open Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'SkillCerts',
        description: courseTitle,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify Payment
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success('Payment Successful!');
            onClose();
            navigate(`/payment/success?orderId=${response.razorpay_order_id}`);
          } catch (error) {
            console.error(error);
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
            }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();

    } catch (error) {
      console.error(error);
      setError(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-400" />
            Secure Checkout
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            {error && (
                <Alert variant="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Course Summary */}
            <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                    <img 
                        src={course.thumbnail || 'https://via.placeholder.com/400x225'} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h3 className="font-semibold text-white line-clamp-2 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-400">
                        {course.isFree ? 'Free Course' : 'Lifetime Access'}
                    </p>
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-gray-400 text-sm">
                    <span>Price</span>
                    <span>{course.isFree ? 'FREE' : formatCurrency(course.price)}</span>
                </div>
                 {!course.isFree && (
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Taxes (Included)</span>
                        <span>{formatCurrency(0)}</span>
                    </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between items-center font-bold text-white">
                    <span>Total</span>
                    <span className="text-xl text-green-400">
                        {course.isFree ? 'FREE' : formatCurrency(course.price)}
                    </span>
                </div>
            </div>

            {/* Secure Badge */}
            <div className="flex items-center gap-3 text-xs text-gray-500 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>Your payment is secured with 256-bit SSL encryption.</span>
            </div>

            {/* Action Button */}
            <Button
                onClick={handlePayment}
                disabled={loading || (!scriptLoaded && !course.isFree && !course.id?.startsWith?.('mock-'))}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20"
            >
                {loading ? 'Processing...' : (course.isFree ? 'Enroll Now - Free' : `Pay ${formatCurrency(course.price)}`)}
            </Button>
        </div>
      </div>
    </div>
  );
};
