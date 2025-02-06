import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface OrderSummary {
  items: OrderItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  orderNumber: string;
  orderDate: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'credit_card', name: 'Credit Card', type: 'CREDIT_CARD', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', type: 'BANK_TRANSFER', icon: '🏦' },
  { id: 'ewallet', name: 'E-Wallet', type: 'EWALLET', icon: '📱' },
];

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderSummary | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const orderDataStr = localStorage.getItem('pendingOrder');
    if (orderDataStr) {
      const data = JSON.parse(orderDataStr);
      setOrderData(data);
    } else {
      router.push('/cart');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!selectedPayment) {
      setPaymentError('Please select a payment method');
      return;
    }
    setPaymentError('');
    setLoading(true);

    try {
      // Simulate Xendit API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentData = {
        id: `pay_${Date.now()}`,
        status: 'PAID',
        payment_method: selectedPayment,
        amount: orderData?.totalPrice,
        currency: 'IDR',
        created: new Date().toISOString(),
      };

      // Store order in history
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail && orderData) {
        const orderHistoryKey = `orders_${userEmail}`;
        const existingOrders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
        const completedOrder = {
          ...orderData,
          payment: paymentData,
          printReceipt,
        };
        existingOrders.push(completedOrder);
        localStorage.setItem(orderHistoryKey, JSON.stringify(existingOrders));
      }

      // Clear cart and pending order
      localStorage.removeItem('pendingOrder');
      localStorage.setItem('cart', '[]');

      // Redirect to success page
      router.push('/payment-success');
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!orderData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <Link href="/cart" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{item.title} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount ({orderData.discountPercentage}%)</span>
                    <span>-${orderData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white text-lg">
                  <span>Total</span>
                  <span>${orderData.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{method.name}</span>
                  </label>
                ))}
              </div>
              {paymentError && (
                <p className="mt-2 text-red-500 text-sm">{paymentError}</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Options</h2>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Print receipt after payment</span>
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Pay ${orderData.totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
