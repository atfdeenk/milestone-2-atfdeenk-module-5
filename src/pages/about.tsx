import { FaShippingFast, FaHeadset, FaShieldAlt, FaHeart, FaQuoteLeft } from 'react-icons/fa';
import Image from 'next/image';
import Head from 'next/head';

const AboutPage = () => {
  const features = [
    {
      icon: <FaShippingFast className="w-8 h-8 text-blue-600" />,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to your doorstep'
    },
    {
      icon: <FaHeadset className="w-8 h-8 text-blue-600" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer service assistance'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-blue-600" />,
      title: 'Secure Shopping',
      description: 'Safe and protected online transactions'
    },
    {
      icon: <FaHeart className="w-8 h-8 text-blue-600" />,
      title: 'Quality Products',
      description: 'Carefully curated high-quality items'
    }
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&h=256&q=80',
      linkedin: '#',
      twitter: '#'
    }
  ];

  return (
    <>
      <Head>
        <title>About Us - Your E-commerce Store</title>
        <meta name="description" content="Learn more about our e-commerce store, our mission, and our team." />
      </Head>

      <div className="bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white py-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90"></div>
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-grid"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in-up">
                About Our Store
              </h1>
              <p className="text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                We're dedicated to providing the best shopping experience with quality products and exceptional service.
              </p>
              <div className="mt-8 flex justify-center space-x-4 animate-fade-in-up animation-delay-400">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                  Learn More
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <FaQuoteLeft className="text-blue-600/20 w-12 h-12" />
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 relative inline-block">
                Our Mission
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                To revolutionize online shopping by providing a seamless, secure, and enjoyable experience while offering high-quality products at competitive prices. We strive to exceed customer expectations and build lasting relationships with our community.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gray-50 dark:bg-gray-800 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 relative inline-block">
              Why Choose Us
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 relative inline-block">
            Meet Our Team
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="text-center transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden group">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <div className="flex space-x-4">
                      <a href={member.linkedin} className="text-white hover:text-blue-200 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                      <a href={member.twitter} className="text-white hover:text-blue-200 transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white hover:text-blue-500 transition-colors cursor-pointer">
                  {member.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {member.role}
                </p>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-50 dark:bg-gray-800 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16 relative inline-block">
              Our Values
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-800"></div>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-700 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-4 dark:text-white">Quality</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We never compromise on the quality of our products and services.
                </p>
              </div>
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-700 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-4 dark:text-white">Integrity</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We conduct our business with honesty and transparency.
                </p>
              </div>
              <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-700 shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-4 dark:text-white">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We continuously strive to improve and innovate our services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
