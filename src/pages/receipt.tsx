import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ReceiptItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface ReceiptData {
  items: ReceiptItem[];
  totalPrice: number;
  orderDate: string;
  orderNumber: string;
}

export default function Receipt() {
  const router = useRouter();
  let receiptData: ReceiptData | null = null;
  
  try {
    receiptData = router.query.receiptData ? JSON.parse(router.query.receiptData as string) as ReceiptData : null;
  } catch (error) {
    // Invalid JSON, will redirect in useEffect
  }
  
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!receiptData) {
      router.push('/cart');
    }
  }, [receiptData, router]);

  const handlePrint = () => {
    if (!receiptData) return;

    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; color: #2563eb; margin: 0;">Shop Smart 🛒</h1>
          <p style="color: #666; margin: 10px 0;">Thank you for your purchase!</p>
        </div>

        <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="font-size: 20px; margin-bottom: 15px;">Purchase Receipt</h2>
          <p style="color: #666; margin: 5px 0;">Order Number: ${receiptData.orderNumber}</p>
          <p style="color: #666; margin: 5px 0;">Date: ${receiptData.orderDate}</p>
        </div>

        <div style="margin-bottom: 30px;">
          ${receiptData.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
              <div>
                <h3 style="font-size: 16px; margin: 0;">${item.title}</h3>
                <p style="color: #666; font-size: 14px; margin: 5px 0;">Quantity: ${item.quantity}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: bold; margin: 0;">$${(item.price * item.quantity).toFixed(2)}</p>
                <p style="color: #666; font-size: 14px; margin: 5px 0;">$${item.price.toFixed(2)} each</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold;">
            <span>Total</span>
            <span>$${receiptData.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
          <p>Thank you for shopping with Shop Smart 🛒</p>
          <p>For any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Shop Smart - Purchase Receipt</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (!receiptData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Shop Smart 🛒</h1>
          <p className="text-gray-600 dark:text-gray-300">Thank you for your purchase!</p>
        </div>

        <div ref={receiptRef}>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Purchase Receipt</h2>
            <div className="text-gray-600 dark:text-gray-300">
              <p>Order Number: {receiptData.orderNumber}</p>
              <p>Date: {receiptData.orderDate}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {receiptData.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">${receiptData.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-600 dark:text-gray-300 text-sm">
            <p>Thank you for shopping with Shop Smart 🛒</p>
            <p>For any questions, please contact our support team.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="flex-1 px-6 py-3 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handlePrint}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
