import { FaShippingFast, FaHeadset, FaShieldAlt, FaHeart } from 'react-icons/fa';
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
      image: '/team/ceo.jpg'
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Operations',
      image: '/team/operations.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      image: '/team/product.jpg'
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
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">About Our Store</h1>
              <p className="text-xl max-w-2xl mx-auto">
                We're dedicated to providing the best shopping experience with quality products and exceptional service.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              To revolutionize online shopping by providing a seamless, secure, and enjoyable experience while offering high-quality products at competitive prices. We strive to exceed customer expectations and build lasting relationships with our community.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="text-center"
              >
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-1 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-50 dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Quality</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We never compromise on the quality of our products and services.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Integrity</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We conduct our business with honesty and transparency.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Innovation</h3>
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
