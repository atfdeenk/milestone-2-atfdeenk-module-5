import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
}

const DEFAULT_IMAGE = '/thumbnail.svg'; // Default OG image
const SITE_NAME = 'ShopSmart';
const BASE_URL = 'https://shopsmart-next.vercel.app/'; // Replace with your actual domain

const SEO = ({ 
  title, 
  description, 
  image = DEFAULT_IMAGE,
  url = '/',
  type = 'website',
  keywords = []
}: SEOProps) => {
  const fullUrl = `${BASE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{`${SITE_NAME} | ${title}`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="alternate icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* PWA Manifest */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#4F46E5" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="msapplication-tap-highlight" content="no" />
    </Head>
  );
};

export default SEO;
