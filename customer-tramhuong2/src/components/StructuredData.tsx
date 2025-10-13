export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Trầm Hương Hoàng Ngân",
    "description": "Trầm hương cao cấp tự nhiên từ đất Bồi",
    "url": "https://tramhuonghoangngan.com",
    "logo": "https://tramhuonghoangngan.com/logo.png",
    "image": "https://tramhuonghoangngan.com/og-image.jpg",
    "priceRange": "$$$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
