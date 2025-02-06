import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface PaymentData {
  id: string;
  status: string;
  payment_method: string;
  amount: number;
  currency: string;
  created: string;
}

interface CompletedOrder {
  items: OrderItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  orderNumber: string;
  orderDate: string;
  payment: PaymentData;
  printReceipt: boolean;
}

const PaymentSuccessPage = () => {
  const router = useRouter();
  const [order, setOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/');
      return;
    }

    const orderHistoryKey = `orders_${userEmail}`;
    const orders = JSON.parse(localStorage.getItem(orderHistoryKey) || '[]');
    if (orders.length > 0) {
      setOrder(orders[orders.length - 1]);
    }
  }, [router]);

  const handlePrintReceipt = () => {
    if (!order) return;

    // Create a printable version of the receipt
    const receiptContent = `
      Order Receipt
      =============
      Order Number: ${order.orderNumber}
      Date: ${order.orderDate}
      
      Items:
      ${order.items.map(item => `${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}
      
      Subtotal: $${order.subtotal.toFixed(2)}
      ${order.discountAmount > 0 ? `Discount (${order.discountPercentage}%): -$${order.discountAmount.toFixed(2)}\n` : ''}
      Total: $${order.totalPrice.toFixed(2)}
      
      Payment Details:
      Method: ${order.payment.payment_method}
      Transaction ID: ${order.payment.id}
      Status: ${order.payment.status}
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Receipt - ${order.orderNumber}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Order Details</h2>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Order Number: <span className="text-gray-900 dark:text-white">{order.orderNumber}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Date: <span className="text-gray-900 dark:text-white">{order.orderDate}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Total Amount: <span className="text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Payment Method: <span className="text-gray-900 dark:text-white">{order.payment.payment_method}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {order.printReceipt && (
              <button
                onClick={handlePrintReceipt}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Receipt
              </button>
            )}
            <Link
              href="/products"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
