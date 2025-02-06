import React, { useState, useEffect } from 'react';

interface DiscountCodeProps {
  onApplyDiscount: (discount: number) => void;
}

interface Voucher {
  code: string;
  discount: number;
  description: string;
}

const availableVouchers: Voucher[] = [
  { code: 'REVOU10', discount: 10, description: '10% off your purchase' },
  { code: 'REVOU20', discount: 20, description: '20% off your purchase' },
  { code: 'REVOU30', discount: 30, description: '30% off your purchase' },
];

const discountCodes = availableVouchers.reduce((acc, voucher) => {
  acc[voucher.code] = voucher.discount;
  return acc;
}, {} as { [key: string]: number });

const DiscountCode: React.FC<DiscountCodeProps> = ({ onApplyDiscount }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [showVouchers, setShowVouchers] = useState(false);

  useEffect(() => {
    if (showVouchers) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVouchers]);

  const handleApplyCode = (inputCode: string = code) => {
    const discount = discountCodes[inputCode];
    
    if (discount) {
      setError('');
      setCode(inputCode);
      setAppliedDiscount(discount);
      onApplyDiscount(discount);
      setShowVouchers(false);
    } else {
      setError('Invalid discount code');
      setAppliedDiscount(null);
      onApplyDiscount(0);
    }
  };

  const handleRemoveDiscount = () => {
    setCode('');
    setError('');
    setAppliedDiscount(null);
    onApplyDiscount(0);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter discount code"
            className="px-3 py-2 border rounded-md flex-grow dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            onClick={() => handleApplyCode()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
        <button
          onClick={() => setShowVouchers(true)}
          className="text-blue-600 dark:text-blue-400 text-sm hover:underline text-left flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
          View available vouchers
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {appliedDiscount && (
        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
          <p className="text-green-600 dark:text-green-400 text-sm">
            {appliedDiscount}% discount applied!
          </p>
          <button
            onClick={handleRemoveDiscount}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {showVouchers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Vouchers</h3>
              <button
                onClick={() => setShowVouchers(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {availableVouchers.map((voucher) => (
                <div
                  key={voucher.code}
                  className="p-4 border rounded-lg dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{voucher.code}</h4>
                      <p className="text-gray-500 dark:text-gray-400">{voucher.description}</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {voucher.discount}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleApplyCode(voucher.code)}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Use this voucher
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCode;
