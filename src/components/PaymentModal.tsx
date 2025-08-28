"use client";
import { useState } from 'react';
import { X, CreditCard, Smartphone, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: {
    id: string;
    course: {
      title: string;
      price: number;
    };
    tutor: {
      name: string;
    };
  };
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, enrollment, onPaymentSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'KASPI' | 'CARD' | 'BANK_TRANSFER'>('KASPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          paymentMethod,
          amount: enrollment.course.price,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.payment.status === 'COMPLETED') {
          setPaymentSuccess(true);
          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 2000);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment Successful!</h3>
          <p className="text-slate-600">You have been successfully enrolled in the course.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Details */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-slate-900 mb-2">{enrollment.course.title}</h4>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tutor: {enrollment.tutor.name}</span>
            <span className="font-semibold text-slate-900">
              {enrollment.course.price.toLocaleString()} ₸
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Select Payment Method
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="KASPI"
                checked={paymentMethod === 'KASPI'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="text-primary focus:ring-primary"
              />
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Kaspi QR Payment</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={paymentMethod === 'CARD'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="text-primary focus:ring-primary"
              />
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="text-sm">Bank Card</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="BANK_TRANSFER"
                checked={paymentMethod === 'BANK_TRANSFER'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="text-primary focus:ring-primary"
              />
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Bank Transfer</span>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing Payment...' : `Pay ${enrollment.course.price.toLocaleString()} ₸`}
        </button>

        {/* Payment Info */}
        <div className="mt-4 text-xs text-slate-500 text-center">
          {paymentMethod === 'KASPI' && (
            <p>You will be redirected to Kaspi to complete the payment</p>
          )}
          {paymentMethod === 'CARD' && (
            <p>Secure payment powered by Kaspi Bank</p>
          )}
          {paymentMethod === 'BANK_TRANSFER' && (
            <p>You will receive bank details via email</p>
          )}
        </div>
      </div>
    </div>
  );
}
