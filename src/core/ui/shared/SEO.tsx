import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export function SEO({
  title = 'Cloudnine Doceria - A Experiência Mais Doce',
  description = 'Doceria artesanal com bolos personalizados, brigadeiros gourmet e as melhores sobremesas. Peça online e receba na sua casa.',
  url = 'https://cloudninedoceria.com',
  image = '/LogoCloudnine.svg'
}: SEOProps) {
  const fullTitle = title.includes('Cloudnine') ? title : `${title} | Cloudnine Doceria`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
