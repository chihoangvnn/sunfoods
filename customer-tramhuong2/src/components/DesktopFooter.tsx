'use client';

import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Facebook, MessageCircle, Star, Shield, Truck, CreditCard } from 'lucide-react';

const DesktopFooter = () => {
  // SEO Schema markup for LocalBusiness (Luxury Incense)
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Trầm Hương Hoàng Ngân – Tinh Hoa Trầm Hương",
    "description": "Nhà cung cấp trầm hương cao cấp hàng đầu Việt Nam. Chuyên trầm hương Khánh Hòa, Bồi, sản phẩm quý hiếm và bộ quà tặng sang trọng.",
    "url": "https://tramhuonghoangngan.com",
    "telephone": "+84-888-168-268",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "68 Nguyễn Cư Trinh, Quận 1",
      "addressLocality": "Hồ Chí Minh",
      "addressRegion": "TP.HCM",
      "postalCode": "700000",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.7677,
      "longitude": 106.6878
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "20:00"
    },
    "priceRange": "$$$",
    "category": ["Luxury Incense", "Agarwood Products", "Spiritual Products", "Premium Gifts"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.95",
      "reviewCount": "1268"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Sản phẩm trầm hương cao cấp",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Trầm Hương Khánh Hòa cao cấp"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Bộ quà tặng trầm hương sang trọng"
          }
        }
      ]
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Trầm Hương Hoàng Ngân",
    "url": "https://tramhuonghoangngan.com",
    "logo": "https://tramhuonghoangngan.com/logo.png",
    "sameAs": [
      "https://facebook.com/tramhuonghoangngan",
      "https://zalo.me/tramhuonghoangngan"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84-888-168-268",
      "contactType": "customer service",
      "availableLanguage": "Vietnamese"
    }
  };

  useEffect(() => {
    // Store references to scripts we create
    const footerScripts: HTMLScriptElement[] = [];

    const insertSchema = () => {
      // Business schema
      const businessScript = document.createElement('script');
      businessScript.type = 'application/ld+json';
      businessScript.text = JSON.stringify(businessSchema);
      businessScript.setAttribute('data-footer-schema', 'business');
      document.head.appendChild(businessScript);
      footerScripts.push(businessScript);

      // Organization schema
      const orgScript = document.createElement('script');
      orgScript.type = 'application/ld+json';
      orgScript.text = JSON.stringify(organizationSchema);
      orgScript.setAttribute('data-footer-schema', 'organization');
      document.head.appendChild(orgScript);
      footerScripts.push(orgScript);
    };

    // Use requestIdleCallback with setTimeout fallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(insertSchema);
    } else {
      setTimeout(insertSchema, 1);
    }

    // Cleanup: Remove ONLY the scripts we created
    return () => {
      footerScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  const productCategories = [
    { name: 'Trầm Hương Khánh Hòa', href: '/category/tram-huong-khanh-hoa', seo: 'Trầm hương Khánh Hòa cao cấp' },
    { name: 'Trầm Hương Bồi', href: '/category/tram-huong-boi', seo: 'Trầm hương Bồi chính gốc' },
    { name: 'Trầm Hương Quý Hiếm', href: '/category/tram-huong-quy-hiem', seo: 'Trầm hương quý hiếm limited' },
    { name: 'Phụ Kiện Trầm Hương', href: '/category/phu-kien-tram-huong', seo: 'Phụ kiện trầm hương cao cấp' },
    { name: 'Bộ Quà Tặng Cao Cấp', href: '/category/bo-qua-tang', seo: 'Bộ quà tặng trầm hương sang trọng' },
    { name: 'Sản Phẩm Đặc Biệt', href: '/category/san-pham-dac-biet', seo: 'Sản phẩm trầm hương đặc biệt' }
  ];

  const supportLinks = [
    { name: 'Giới Thiệu', href: '/gioi-thieu' },
    { name: 'Chứng Nhận Chất Lượng', href: '/chung-nhan-chat-luong' },
    { name: 'Hướng Dẫn Sử Dụng', href: '/huong-dan-su-dung' },
    { name: 'Chính Sách Giao Hàng', href: '/chinh-sach-giao-hang' },
    { name: 'Chính Sách Đổi Trả', href: '/chinh-sach-doi-tra' },
    { name: 'Trải Nghiệm VIP', href: '/trai-nghiem-vip' }
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/tramhuonghoangngan', icon: Facebook },
    { name: 'Zalo', href: 'https://zalo.me/tramhuonghoangngan', icon: MessageCircle },
    { name: 'Email', href: 'mailto:info@tramhuonghoangngan.com', icon: Mail },
    { name: 'Hotline', href: 'tel:+84888168268', icon: Phone }
  ];

  return (
    <footer className="bg-white/60 backdrop-blur-md shadow-[0_8px_32px_rgba(193,168,117,0.3)] border-t border-tramhuong-accent/20 mt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          
          {/* Company Info Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-tramhuong-accent/10 flex items-center justify-center border-2 border-tramhuong-accent">
                <svg className="w-6 h-6 text-tramhuong-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 6C14 6 16 4 16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  <path d="M12 6C10 6 8 4 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  <circle cx="12" cy="18" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-playfair font-bold text-tramhuong-primary">Trầm Hương Hoàng Ngân</h3>
            </div>
            
            <p className="text-tramhuong-primary/80 text-sm mb-4 leading-relaxed font-nunito">
              Hơn 20 năm tinh luyện trầm hương Khánh Hòa. 
              Tinh hoa trầm hương từ đất Bồi, mang lại bình an và thịnh vượng.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-tramhuong-primary/70">
                <MapPin size={16} className="text-tramhuong-accent" />
                <span>68 Nguyễn Cư Trinh, Quận 1, TP.HCM</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-tramhuong-primary/70">
                <Phone size={16} className="text-tramhuong-accent" />
                <span>Hotline: 0888.168.268</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-tramhuong-primary/70">
                <Mail size={16} className="text-tramhuong-accent" />
                <span>info@tramhuonghoangngan.com</span>
              </div>
            </div>

            {/* Rating & Reviews */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-tramhuong-accent/20 shadow-luxury">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-tramhuong-accent fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-tramhuong-primary">4.95/5</span>
              </div>
              <p className="text-xs text-tramhuong-primary/60">Từ 1,268 đánh giá khách hàng</p>
            </div>
          </div>

          {/* Products Column */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-tramhuong-primary mb-4 font-playfair">Bộ Sưu Tập</h4>
            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.href}>
                  <a
                    href={category.href}
                    className="text-sm text-tramhuong-primary/70 hover:text-tramhuong-accent transition-colors duration-300 block font-nunito"
                    title={category.seo}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-tramhuong-primary mb-4 font-playfair">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-tramhuong-primary/70 hover:text-tramhuong-accent transition-colors duration-300 block font-nunito"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold text-tramhuong-primary mb-4 font-playfair">Kết Nối</h4>
            
            <div className="space-y-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center space-x-3 text-sm text-tramhuong-primary/70 hover:text-tramhuong-accent transition-colors duration-300 font-nunito"
                  target={social.href.startsWith('http') ? '_blank' : '_self'}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : ''}
                >
                  <social.icon size={16} className="text-tramhuong-accent" />
                  <span>{social.name}</span>
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white p-4 rounded-lg border border-tramhuong-accent/20 shadow-luxury">
              <h5 className="text-sm font-semibold text-tramhuong-primary mb-2 font-playfair">📧 Đăng ký nhận ấn phẩm tinh hoa</h5>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 text-xs border border-tramhuong-accent/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tramhuong-accent focus:border-transparent font-nunito"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-tramhuong-accent to-tramhuong-primary text-white text-xs rounded-md hover:shadow-luxury transition-all duration-300">
                  Đăng ký
                </button>
              </div>
              <p className="text-xs text-tramhuong-primary/60 mt-2 font-nunito">
                Nhận thông tin sản phẩm cao cấp và ưu đãi đặc biệt
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals Bar */}
        <div className="border-t border-tramhuong-accent/20 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-tramhuong-accent/10 flex items-center justify-center border border-tramhuong-accent/30">
                <Shield size={20} className="text-tramhuong-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-tramhuong-primary">Chứng Nhận Nguồn Gốc</p>
                <p className="text-xs text-tramhuong-primary/60">Trầm hương chính gốc</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-tramhuong-accent/10 flex items-center justify-center border border-tramhuong-accent/30">
                <Truck size={20} className="text-tramhuong-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-tramhuong-primary">Đóng Gói Sang Trọng</p>
                <p className="text-xs text-tramhuong-primary/60">Hộp quà cao cấp</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-tramhuong-accent/10 flex items-center justify-center border border-tramhuong-accent/30">
                <CreditCard size={20} className="text-tramhuong-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-tramhuong-primary">Tư Vấn Chuyên Sâu</p>
                <p className="text-xs text-tramhuong-primary/60">Chuyên gia trầm hương</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-tramhuong-accent/10 flex items-center justify-center border border-tramhuong-accent/30">
                <Star size={20} className="text-tramhuong-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-tramhuong-primary">Bảo Hành Trọn Đời</p>
                <p className="text-xs text-tramhuong-primary/60">Cam kết chất lượng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-tramhuong-accent/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-tramhuong-primary/70 font-nunito">
                ✨ © 2024 <strong className="text-tramhuong-primary">Trầm Hương Hoàng Ngân</strong> - Tinh hoa trầm hương Khánh Hòa
              </p>
              <p className="text-xs text-tramhuong-primary/50 mt-1 font-nunito">
                Bản quyền thuộc về Trầm Hương Hoàng Ngân. Thiết kế bởi <span className="text-tramhuong-accent">Luxury Team</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-tramhuong-primary/60 font-nunito">
              <a href="/terms" className="hover:text-tramhuong-accent transition-colors duration-300">Điều khoản</a>
              <a href="/privacy" className="hover:text-tramhuong-accent transition-colors duration-300">Bảo mật</a>
              <a href="/sitemap.xml" className="hover:text-tramhuong-accent transition-colors duration-300">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DesktopFooter;