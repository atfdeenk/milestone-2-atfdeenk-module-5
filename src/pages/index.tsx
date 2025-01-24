import Image from "next/image";
import Link from "next/link";
import { Geist } from "next/font/google";
import { useRouter } from 'next/router';
import { useState } from 'react';
import LoadingSpinner from "../components/LoadingSpinner";
import SEO from "../components/SEO";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleProductsClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await router.push('/products');
  };

  const features = [
    {
      title: "Wide Selection",
      description: "Discover thousands of high-quality products from trusted brands",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    },
    {
      title: "Fast Delivery",
      description: "Get your items delivered quickly with our premium shipping service",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Secure Payments",
      description: "Shop confidently with our secure and encrypted payment system",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <>
      <SEO 
        title="Discover Your Perfect Style"
        description="Explore our curated collection of trendy fashion items. From casual wear to elegant pieces, find everything you need to express your unique style."
        keywords={[
          'fashion',
          'clothing',
          'style',
          'trendy fashion',
          'online shopping',
          'fashion store',
          'casual wear',
          'elegant fashion'
        ]}
      />
      <div className={`${geistSans.variable} min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900`}>
        {isLoading && <LoadingSpinner delay={300} message="Taking you to products..." />}
        {/* Hero Section */}
        <div className="relative overflow-hidden px-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 to-blue-100/30 dark:from-pink-900/30 dark:to-blue-900/30" />
          <div className="absolute inset-y-0 right-0 w-full lg:w-2/3 bg-gradient-to-l from-blue-50/50 via-white/50 to-transparent dark:from-blue-950/50 dark:via-gray-900/50" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:flex-col lg:justify-center">
                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 rounded-full">
                    New Collection 2025
                  </span>
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                    <span className="block">Discover Your</span>
                    <span className="block mt-1 bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent pb-1">
                      Perfect Style
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Explore our curated collection of trendy fashion items. From casual wear to elegant pieces, 
                    find everything you need to express your unique style.
                  </p>
                  <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-0 sm:flex sm:gap-4 max-lg:justify-center">
                    <Link
                      href="/products"
                      onClick={handleProductsClick}
                      className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="relative z-10 flex items-center">
                        Explore Products
                        <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </Link>
                    {/* <Link
                      href="/register"
                      className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl"
                    >
                      <span className="relative z-10 flex items-center">
                        Sign Up Now
                        <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </Link> */}
                  </div>
                  <div className="mt-8 flex items-center gap-6 text-gray-600 dark:text-gray-400 sm:justify-center lg:justify-start">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Free Shipping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-16 relative sm:mt-24 lg:mt-0 lg:col-span-6">
                <div className="relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md">
                  <div className="relative block w-full h-96 sm:h-[450px] lg:h-[540px] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a"
                      alt="Fashion Shopping Experience"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      className="object-cover object-center"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Floating Elements */}
                    <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Arrivals</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">Summer Collection</p>
                      </div>
                      <div className="bg-blue-600/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <p className="text-sm font-medium text-blue-100">Up to</p>
                        <p className="text-2xl font-bold text-white">50% OFF</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative py-16 sm:py-24 lg:py-32 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="relative py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div className="group">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-yellow-400 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4.9/5 Rating</h4>
                  <p className="text-gray-600 dark:text-gray-300">From satisfied customers</p>
                </div>
                <div className="group">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-500 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">100% Secure</h4>
                  <p className="text-gray-600 dark:text-gray-300">Safe & encrypted payments</p>
                </div>
                <div className="group">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-500 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">24/7 Support</h4>
                  <p className="text-gray-600 dark:text-gray-300">Always here to help you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
