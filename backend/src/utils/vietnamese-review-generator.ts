/**
 * 🇻🇳 VIETNAMESE REVIEW GENERATOR
 * Generates authentic Vietnamese customer reviews for book sellers
 * Includes regional variations, cultural elements, and book-specific content
 */

import { generateVietnameseName, generateVietnameseAddress } from './vietnamese-data-generator';

// Vietnamese Regional Language Variations
export const REGIONAL_VARIATIONS = {
  "Miền Bắc": {
    name: "Northern Vietnam",
    characteristics: ["Formal tone", "Academic language", "Detailed feedback"],
    pronouns: {
      "I": ["tôi", "em"],
      "you": ["anh", "chị", "bác"],
      "we": ["chúng tôi", "chúng em"]
    },
    regionalWords: {
      "very": "rất",
      "good": "tốt",
      "book": "sách",
      "beautiful": "đẹp",
      "fast": "nhanh",
      "quality": "chất lượng",
      "service": "dịch vụ"
    },
    courtesyLevel: "high"
  },
  "Miền Trung": {
    name: "Central Vietnam",
    characteristics: ["Poetic language", "Cultural references", "Traditional expressions"],
    pronouns: {
      "I": ["tôi", "cháu"],
      "you": ["anh", "chị", "thầy", "cô"],
      "we": ["chúng tôi"]
    },
    regionalWords: {
      "very": "rất",
      "good": "hay",
      "book": "sách",
      "beautiful": "đẹp",
      "fast": "nhanh",
      "quality": "chất lượng",
      "service": "phục vụ"
    },
    courtesyLevel: "very_high"
  },
  "Miền Nam": {
    name: "Southern Vietnam",
    characteristics: ["Casual tone", "Business-focused", "Direct feedback"],
    pronouns: {
      "I": ["tôi", "mình"],
      "you": ["anh", "chị", "bạn"],
      "we": ["chúng mình", "chúng tôi"]
    },
    regionalWords: {
      "very": "rất",
      "good": "tốt",
      "book": "sách",
      "beautiful": "đẹp",
      "fast": "nhanh",
      "quality": "chất lượng",
      "service": "dịch vụ"
    },
    courtesyLevel: "medium"
  }
};

// Vietnamese Courtesy Expressions by Politeness Level
export const COURTESY_EXPRESSIONS = {
  very_polite: {
    openings: [
      "Kính chào anh/chị,",
      "Xin chào anh/chị,", 
      "Chào anh/chị ạ,",
      "Em xin chào anh/chị,"
    ],
    appreciations: [
      "Em xin chân thành cảm ơn",
      "Cảm ơn anh/chị rất nhiều",
      "Em rất biết ơn",
      "Xin cảm ơn sự tận tình của anh/chị"
    ],
    closings: [
      "Em xin chân thành cảm ơn.",
      "Cảm ơn anh/chị nhiều lắm ạ.",
      "Em sẽ tiếp tục ủng hộ shop.",
      "Chúc anh/chị và gia đình nhiều sức khỏe."
    ]
  },
  polite: {
    openings: [
      "Chào anh/chị,",
      "Xin chào,",
      "Hello anh/chị,"
    ],
    appreciations: [
      "Cảm ơn anh/chị",
      "Thanks anh/chị",
      "Cảm ơn shop nhiều"
    ],
    closings: [
      "Cảm ơn anh/chị.",
      "Sẽ ủng hộ shop tiếp.",
      "Recommend shop cho bạn bè."
    ]
  },
  neutral: {
    openings: [
      "Chào bạn,",
      "Hi,",
      "Xin chào,"
    ],
    appreciations: [
      "Cảm ơn",
      "Thanks",
      "Cảm ơn bạn"
    ],
    closings: [
      "Cảm ơn.",
      "Good.",
      "Ok."
    ]
  },
  direct: {
    openings: [
      "Xin chào,",
      "Hi,"
    ],
    appreciations: [
      "Ok",
      "Tốt",
      "Cảm ơn"
    ],
    closings: [
      "Tạm ổn.",
      "Ok.",
      "Good."
    ]
  }
};

// Book Category Specific Terminology
export const BOOK_CATEGORY_TERMS = {
  "textbook": {
    vi: "sách giáo khoa",
    terms: ["bài tập", "kiến thức", "học tập", "ôn thi", "kỳ thi", "môn học", "chương trình", "bài học"],
    contexts: ["để học", "cho việc ôn thi", "phục vụ học tập", "chuẩn bị kỳ thi"],
    reasons: ["học tập", "ôn thi", "làm bài tập", "chuẩn bị thi"]
  },
  "literature": {
    vi: "văn học",
    terms: ["tác phẩm", "văn chương", "tiểu thuyết", "thơ ca", "truyện", "cảm xúc", "tâm hồn"],
    contexts: ["để đọc", "thư giãn", "giải trí", "tìm hiểu"],
    reasons: ["yêu thích", "sưu tập", "đọc giải trí", "nghiên cứu"]
  },
  "children": {
    vi: "sách thiếu nhi", 
    terms: ["tranh ảnh", "màu sắc", "bé", "con", "học", "vui nhộn", "dễ thương"],
    contexts: ["cho con", "tặng bé", "dạy con", "đọc cùng con"],
    reasons: ["mua cho con", "tặng cháu", "giáo dục", "phát triển trí tuệ"]
  },
  "business": {
    vi: "kinh doanh",
    terms: ["quản lý", "kinh nghiệm", "chiến lược", "thành công", "kinh doanh", "đầu tư"],
    contexts: ["để học hỏi", "áp dụng công việc", "phát triển bản thân"],
    reasons: ["học hỏi", "công việc", "khởi nghiệp", "nâng cao kiến thức"]
  },
  "health": {
    vi: "sức khỏe",
    terms: ["chăm sóc", "dinh dưỡng", "tập luyện", "khỏe mạnh", "bệnh tật", "phòng ngừa"],
    contexts: ["để chăm sóc sức khỏe", "tìm hiểu", "áp dụng"],
    reasons: ["quan tâm sức khỏe", "chăm sóc gia đình", "phòng bệnh"]
  }
};

// Vietnamese Cultural Review Elements
export const CULTURAL_ELEMENTS = {
  family_mentions: [
    "mua cho con",
    "tặng bố mẹ",
    "cả gia đình đều thích",
    "con em rất thích",
    "bố mẹ khen",
    "anh chị trong nhà",
    "đọc cùng gia đình"
  ],
  gifting_context: [
    "mua làm quà",
    "tặng sinh nhật",
    "quà tết",
    "quà 8/3",
    "quà 20/10",
    "quà tốt nghiệp",
    "quà khai trường"
  ],
  study_references: [
    "chuẩn bị thi",
    "học thêm",
    "ôn bài",
    "làm bài tập",
    "nghiên cứu",
    "tham khảo",
    "bổ sung kiến thức"
  ],
  packaging_appreciation: [
    "đóng gói cẩn thận",
    "bao bì đẹp",
    "gói hàng tốt",
    "đóng gói chắc chắn",
    "bọc kỹ",
    "giao hàng an toàn"
  ],
  festival_seasons: [
    "mùa tết",
    "đầu năm học",
    "cuối năm",
    "mùa thi",
    "nghỉ hè",
    "trung thu",
    "giáng sinh"
  ],
  vietnamese_values: [
    "tôn trọng khách hàng",
    "chu đáo",
    "nhiệt tình",
    "tận tâm",
    "uy tín",
    "đáng tin cậy",
    "chất lượng cam kết"
  ]
};

// Review Quality Templates
export const REVIEW_TEMPLATES = {
  excellent: {
    ratings: { min: 5, max: 5, typical: 5 },
    titles: {
      "Miền Bắc": [
        "Sách chất lượng tuyệt vời, dịch vụ tận tâm",
        "Rất hài lòng với chất lượng sách và giao hàng",
        "Shop uy tín, sách đúng mô tả, giao nhanh",
        "Chất lượng xuất sắc, đóng gói cẩn thận"
      ],
      "Miền Trung": [
        "Sách hay, shop chu đáo, rất đáng tin cậy",
        "Chất lượng tuyệt vời, phục vụ tận tình",
        "Sách đẹp, giao nhanh, shop uy tín lắm",
        "Rất hài lòng, sẽ tiếp tục ủng hộ shop"
      ],
      "Miền Nam": [
        "Sách ok, ship nhanh, giá hợp lý",
        "Quality tốt, service ok, recommend",
        "Sách đẹp, đóng gói cẩn thận, ship nhanh",
        "Hài lòng với chất lượng và dịch vụ"
      ]
    },
    content_templates: {
      "Miền Bắc": [
        "Em đã mua {book_category} tại shop và rất hài lòng. {book_specific_comment} Sách được đóng gói rất cẩn thận, giao hàng nhanh chóng. {seller_appreciation} Shop rất tận tâm và chuyên nghiệp. {family_context} Em sẽ tiếp tục ủng hộ shop. {courtesy_closing}",
        
        "Tôi đặt mua {book_category} {purchase_reason} và nhận được sản phẩm đúng như mong đợi. {book_quality_comment} Đặc biệt, {positive_surprise}. Shop phục vụ rất chu đáo và nhiệt tình. {recommendation} Cảm ơn shop rất nhiều!"
      ],
      "Miền Trung": [
        "Tôi rất hài lòng khi mua {book_category} tại shop. {book_specific_comment} Shop đóng gói rất cẩn thận và giao hàng đúng hẹn. {cultural_appreciation} {family_context} Đây thực sự là một shop đáng tin cậy. {courtesy_closing}",
        
        "Sách {book_category} mà tôi đặt mua có chất lượng tuyệt vời. {book_quality_comment} {seller_service_praise} Shop rất tận tâm và chu đáo. {seasonal_context} Tôi sẽ giới thiệu shop cho bạn bè và người thân. Cảm ơn shop!"
      ],
      "Miền Nam": [
        "Mình order {book_category} ở shop, nhận được hàng rất ok. {book_specific_comment} Ship nhanh, đóng gói cẩn thận. {practical_benefit} {family_context} Shop service tốt, recommend cho mọi người. Thanks shop!",
        
        "Sách {book_category} quality tốt, đúng như mô tả. {book_quality_comment} {delivery_praise} Shop tư vấn nhiệt tình, response nhanh. {recommendation} Sẽ mua tiếp ở shop. Good job!"
      ]
    }
  },
  
  good: {
    ratings: { min: 4, max: 4, typical: 4 },
    titles: {
      "Miền Bắc": [
        "Sách tốt, dịch vụ ổn, hài lòng",
        "Chất lượng tốt, giao hàng đúng hẹn",
        "Shop uy tín, sách đẹp, giao nhanh",
        "Hài lòng với sản phẩm và dịch vụ"
      ],
      "Miền Trung": [
        "Sách hay, shop chu đáo, tốt lắm",
        "Chất lượng tốt, phục vụ tận tình",
        "Sách đẹp, shop uy tín, hài lòng",
        "Tốt, sẽ ủng hộ shop tiếp"
      ],
      "Miền Nam": [
        "Sách ok, ship ổn, good",
        "Quality tốt, service ok", 
        "Sách đẹp, giao nhanh, tốt",
        "Ổn, recommend shop"
      ]
    },
    content_templates: {
      "Miền Bắc": [
        "Em mua {book_category} tại shop, nhận được sản phẩm tốt. {book_specific_comment} Giao hàng đúng thời gian, đóng gói cẩn thận. {minor_improvement} Nhìn chung em hài lòng với shop. {family_context} Sẽ ủng hộ shop tiếp. Cảm ơn!",
        
        "Sách {book_category} có chất lượng tốt, đúng mô tả. {book_quality_comment} Shop giao hàng nhanh và chu đáo. {positive_aspect} {small_suggestion} Nhìn chung rất hài lòng. Recommend shop cho mọi người."
      ],
      "Miền Trung": [
        "Tôi đặt mua {book_category} và nhận được sản phẩm tốt. {book_specific_comment} Shop phục vụ tận tình, giao hàng đúng hẹn. {cultural_element} {minor_note} Tôi hài lòng với shop. Cảm ơn shop!",
        
        "Sách {book_category} chất lượng tốt, shop tư vấn nhiệt tình. {book_quality_comment} {delivery_comment} {positive_experience} {small_improvement} Sẽ tiếp tục ủng hộ shop. Chúc shop phát triển!"
      ],
      "Miền Nam": [
        "Mình order {book_category}, nhận hàng ok. {book_specific_comment} Ship nhanh, đóng gói tốt. {practical_comment} {minor_point} Overall satisfy với shop. Thanks!",
        
        "Sách {book_category} quality tốt, đúng mô tả. {book_quality_comment} {delivery_experience} Shop response nhanh, service ok. {small_suggestion} Good shop, recommend."
      ]
    }
  },
  
  average: {
    ratings: { min: 3, max: 3, typical: 3 },
    titles: {
      "Miền Bắc": [
        "Sách ổn, có thể cải thiện thêm",
        "Tạm ổn, cần cải thiện một số điểm",
        "Bình thường, chấp nhận được",
        "Ổn, mong shop cải thiện hơn"
      ],
      "Miền Trung": [
        "Tạm ổn, shop cần cải thiện",
        "Bình thường, mong shop phát triển hơn",
        "Ổn, có thể tốt hơn",
        "Tạm được, cần cải thiện"
      ],
      "Miền Nam": [
        "Tạm ok, có thể improve",
        "Average, cần cải thiện",
        "Ổn, mong shop better",
        "Ok, but can be better"
      ]
    },
    content_templates: {
      "Miền Bắc": [
        "Em mua {book_category} tại shop. {book_specific_comment} {neutral_comment} {issue_mentioned} Mong shop có thể cải thiện để phục vụ khách hàng tốt hơn. {constructive_feedback} Cảm ơn shop.",
        
        "Sách {book_category} nhìn chung ổn. {book_quality_comment} {service_experience} {improvement_area} Hy vọng shop sẽ chú ý hơn để nâng cao chất lượng dịch vụ. Thanks shop!"
      ],
      "Miền Trung": [
        "Tôi đặt {book_category}, sản phẩm tạm ổn. {book_specific_comment} {mixed_experience} {polite_criticism} Mong shop có thể cải thiện để khách hàng hài lòng hơn. Cảm ơn shop.",
        
        "Sách {book_category} chất lượng bình thường. {book_quality_comment} {service_comment} {gentle_suggestion} Hy vọng shop sẽ phát triển tốt hơn trong tương lai. Chúc shop thành công!"
      ],
      "Miền Nam": [
        "Mình order {book_category}, tạm ok. {book_specific_comment} {honest_feedback} {improvement_point} Hope shop improve để better hơn. Thanks!",
        
        "Sách {book_category} average. {book_quality_comment} {service_feedback} {suggestion} Shop cần cải thiện để compete tốt hơn. Good luck!"
      ]
    }
  },
  
  poor: {
    ratings: { min: 1, max: 2, typical: 2 },
    titles: {
      "Miền Bắc": [
        "Không hài lòng, cần cải thiện nhiều",
        "Chưa đạt kỳ vọng, mong shop cải thiện", 
        "Có vấn đề, mong shop khắc phục",
        "Chưa tốt, cần cải thiện"
      ],
      "Miền Trung": [
        "Chưa hài lòng, mong shop cải thiện",
        "Có vấn đề, cần khắc phục",
        "Chưa đạt kỳ vọng của khách",
        "Cần cải thiện nhiều hơn"
      ],
      "Miền Nam": [
        "Không ok, cần improve",
        "Có problem, cần fix",
        "Not good, cần cải thiện",
        "Poor quality, cần làm better"
      ]
    },
    content_templates: {
      "Miền Bắc": [
        "Em đặt mua {book_category} nhưng {specific_issue}. {detailed_problem} {polite_complaint} Mong shop có thể khắc phục để phục vụ khách hàng tốt hơn. {constructive_criticism} Em hy vọng shop sẽ cải thiện.",
        
        "Sách {book_category} không như mong đợi. {quality_issue} {service_problem} {diplomatic_feedback} Mong shop xem xét và cải thiện chất lượng dịch vụ. Cảm ơn shop đã lắng nghe."
      ],
      "Miền Trung": [
        "Tôi không hài lòng với {book_category} đã mua. {specific_problem} {polite_disappointment} Mong shop có thể cải thiện để khách hàng hài lòng hơn. {hopeful_ending} Chúc shop ngày càng phát triển.",
        
        "Sách {book_category} chưa đạt kỳ vọng. {quality_concern} {service_issue} {gentle_criticism} Hy vọng shop sẽ chú ý và cải thiện trong tương lai. Cảm ơn shop."
      ],
      "Miền Nam": [
        "Mình order {book_category} but {direct_issue}. {specific_complaint} {straightforward_feedback} Shop cần improve để customer satisfy hơn. Hope better next time.",
        
        "Sách {book_category} không good. {quality_problem} {service_complaint} {honest_criticism} Shop cần fix these issues để competitive hơn. Thanks!"
      ]
    }
  }
};

// Content Generation Helpers
export const CONTENT_PLACEHOLDERS = {
  book_specific_comment: {
    excellent: [
      "Nội dung sách rất phong phú và bổ ích",
      "Chất lượng in ấn tuyệt vời, hình ảnh rõ nét",
      "Sách mới 100%, không có tì vết",
      "Đúng là phiên bản tôi cần, rất hài lòng"
    ],
    good: [
      "Nội dung sách tốt, phù hợp nhu cầu",
      "Chất lượng in ấn ổn, đọc dễ",
      "Sách còn mới, tình trạng tốt",
      "Đúng như mô tả, hài lòng"
    ],
    average: [
      "Nội dung sách bình thường",
      "Chất lượng in ấn tạm ổn",
      "Sách có vết nhăn nhẹ nhưng chấp nhận được",
      "Gần đúng mô tả"
    ],
    poor: [
      "Nội dung không như kỳ vọng",
      "Chất lượng in ấn kém, mờ",
      "Sách có vết bẩn, hơi cũ",
      "Không đúng hoàn toàn như mô tả"
    ]
  },
  
  seller_appreciation: {
    excellent: [
      "Shop tư vấn rất nhiệt tình và chuyên nghiệp",
      "Nhân viên shop phục vụ tận tâm và chu đáo",
      "Shop response nhanh, giải đáp mọi thắc mắc",
      "Cảm nhận được sự tận tình của shop"
    ],
    good: [
      "Shop tư vấn tốt, nhiệt tình",
      "Nhân viên shop phục vụ ổn",
      "Shop trả lời nhanh, tốt",
      "Shop khá chu đáo"
    ],
    average: [
      "Shop tư vấn bình thường",
      "Nhân viên shop phục vụ tạm ổn",
      "Shop trả lời chậm một chút",
      "Shop cần cải thiện thái độ"
    ],
    poor: [
      "Shop tư vấn chưa tốt",
      "Nhân viên shop chưa nhiệt tình",
      "Shop response chậm",
      "Shop cần cải thiện cách phục vụ"
    ]
  }
};

// Generate Vietnamese reviewer profiles
export function generateVietnameseReviewerProfile(region: string): any {
  const nameData = generateVietnameseName();
  const addressData = generateVietnameseAddress();
  
  const occupations = [
    "học sinh", "sinh viên", "giáo viên", "nhân viên văn phòng", 
    "kinh doanh", "kế toán", "y tá", "kỹ sư", "luật sư", "bác sĩ",
    "nội trợ", "freelancer", "designer", "marketing", "bán hàng"
  ];
  
  const readingHabits = [
    "đọc sách học tập", "đọc tiểu thuyết", "đọc sách kinh doanh",
    "đọc sách thiếu nhi", "đọc sách kỹ năng", "đọc truyện tranh",
    "đọc sách tham khảo", "đọc sách tôn giáo", "đọc sách nấu ăn"
  ];
  
  return {
    name: nameData.fullName,
    age: Math.floor(Math.random() * 50) + 18, // 18-67 years old
    gender: nameData.gender,
    occupation: occupations[Math.floor(Math.random() * occupations.length)],
    readingHabits: [
      readingHabits[Math.floor(Math.random() * readingHabits.length)],
      readingHabits[Math.floor(Math.random() * readingHabits.length)]
    ],
    region: region,
    reviewCount: Math.floor(Math.random() * 20) + 1 // 1-20 reviews
  };
}

// Generate Vietnamese book context
export function generateBookContext(category: string): any {
  const bookTitles = {
    textbook: [
      "Toán học lớp 12", "Vật lý đại cương", "Hóa học hữu cơ", 
      "Tiếng Anh TOEIC", "Ngữ văn lớp 11", "Lịch sử Việt Nam"
    ],
    literature: [
      "Số đỏ", "Chí Phèo", "Dế Mèn phiêu lưu ký", "Tôi thấy hoa vàng trên cỏ xanh",
      "Nhà giả kim", "Tắt đèn", "Truyện Kiều"
    ],
    children: [
      "Doraemon", "Conan", "Thần đồng đất Việt", "Truyện cổ tích Việt Nam",
      "Những câu chuyện về động vật", "Sách tô màu"
    ],
    business: [
      "Đắc nhân tâm", "Think and Grow Rich", "7 thói quen hiệu quả",
      "Khởi nghiệp thông minh", "Quản trị marketing", "Đầu tư chứng khoán"
    ],
    health: [
      "Cẩm nang sức khỏe gia đình", "Dinh dưỡng hàng ngày", "Yoga cơ bản",
      "Chăm sóc sức khỏe tự nhiên", "Phòng chống bệnh tật"
    ]
  };
  
  const authors = [
    "Nguyễn Nhật Ánh", "Tô Hoài", "Nguyễn Du", "Nam Cao", "Vũ Trọng Phụng",
    "Paulo Coelho", "Napoleon Hill", "Dale Carnegie", "Stephen Covey"
  ];
  
  const conditions = ["new", "like_new", "good", "fair"];
  const reasons = (BOOK_CATEGORY_TERMS as any)[category]?.reasons || ["đọc", "học tập", "tham khảo"];
  
  const categoryTitles = (bookTitles as any)[category] || bookTitles.literature;
  
  return {
    bookTitle: categoryTitles[Math.floor(Math.random() * categoryTitles.length)],
    bookAuthor: authors[Math.floor(Math.random() * authors.length)],
    bookCategory: (BOOK_CATEGORY_TERMS as any)[category]?.vi || category,
    bookCondition: conditions[Math.floor(Math.random() * conditions.length)],
    purchaseReason: reasons[Math.floor(Math.random() * reasons.length)],
    isbn: `978${Math.floor(Math.random() * 9000000000) + 1000000000}`
  };
}

// Generate Vietnamese review characteristics
export function generateReviewCharacteristics(): any {
  return {
    mentionsFamily: Math.random() < 0.3,
    mentionsGifting: Math.random() < 0.2,
    mentionsStudy: Math.random() < 0.4,
    usesCourtesyPhrases: Math.random() < 0.8,
    mentionsPackaging: Math.random() < 0.6,
    mentionsFestivalSeason: Math.random() < 0.1,
    usesFormalLanguage: Math.random() < 0.4
  };
}

// Main function to generate Vietnamese review
export function generateVietnameseReview(
  sellerId: string,
  qualityLevel: 'excellent' | 'good' | 'average' | 'poor',
  bookCategory: string = 'literature',
  region: string = 'Miền Nam',
  customOptions?: any
): any {
  const template = REVIEW_TEMPLATES[qualityLevel];
  const reviewerProfile = generateVietnameseReviewerProfile(region);
  const bookContext = generateBookContext(bookCategory);
  const characteristics = generateReviewCharacteristics();
  
  // Select appropriate politeness level based on region and reviewer profile
  let politenessLevel = 'polite';
  if (region === 'Miền Trung' || reviewerProfile.age > 40) {
    politenessLevel = 'very_polite';
  } else if (region === 'Miền Nam' && reviewerProfile.age < 30) {
    politenessLevel = Math.random() < 0.3 ? 'neutral' : 'polite';
  }
  
  // Generate title
  const titles = (template.titles as any)[region] || template.titles['Miền Nam'];
  const reviewTitle = titles[Math.floor(Math.random() * titles.length)];
  
  // Generate content
  const contentTemplates = (template.content_templates as any)[region] || template.content_templates['Miền Nam'];
  let reviewContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
  
  // Replace placeholders with actual content
  reviewContent = reviewContent
    .replace('{book_category}', bookContext.bookCategory)
    .replace('{book_specific_comment}', CONTENT_PLACEHOLDERS.book_specific_comment[qualityLevel][Math.floor(Math.random() * CONTENT_PLACEHOLDERS.book_specific_comment[qualityLevel].length)])
    .replace('{seller_appreciation}', CONTENT_PLACEHOLDERS.seller_appreciation[qualityLevel][Math.floor(Math.random() * CONTENT_PLACEHOLDERS.seller_appreciation[qualityLevel].length)])
    .replace('{purchase_reason}', bookContext.purchaseReason)
    .replace('{family_context}', characteristics.mentionsFamily ? CULTURAL_ELEMENTS.family_mentions[Math.floor(Math.random() * CULTURAL_ELEMENTS.family_mentions.length)] : '')
    .replace('{courtesy_closing}', (COURTESY_EXPRESSIONS as any)[politenessLevel].closings[Math.floor(Math.random() * (COURTESY_EXPRESSIONS as any)[politenessLevel].closings.length)]);
  
  // Generate ratings
  const overallRating = Math.floor(Math.random() * (template.ratings.max - template.ratings.min + 1)) + template.ratings.min;
  const ratingVariation = Math.random() < 0.3 ? 1 : 0; // 30% chance of 1-point variation
  
  return {
    sellerId,
    reviewTitle,
    reviewContent: reviewContent.trim(),
    overallRating,
    deliveryRating: Math.max(1, Math.min(5, overallRating + (Math.random() > 0.5 ? ratingVariation : -ratingVariation))),
    bookConditionRating: Math.max(1, Math.min(5, overallRating + (Math.random() > 0.5 ? ratingVariation : -ratingVariation))),
    serviceRating: Math.max(1, Math.min(5, overallRating + (Math.random() > 0.5 ? ratingVariation : -ratingVariation))),
    pricingRating: Math.max(1, Math.min(5, overallRating + (Math.random() > 0.5 ? ratingVariation : -ratingVariation))),
    region,
    languageStyle: region === 'Miền Bắc' ? 'formal' : region === 'Miền Nam' ? 'casual' : 'regional',
    politenessLevel,
    isAutoGenerated: true,
    reviewerProfile,
    bookContext,
    reviewCharacteristics: characteristics,
    sentimentScore: qualityLevel === 'excellent' ? 0.9 + Math.random() * 0.1 : 
                   qualityLevel === 'good' ? 0.7 + Math.random() * 0.2 :
                   qualityLevel === 'average' ? 0.4 + Math.random() * 0.2 :
                   0.1 + Math.random() * 0.3,
    qualityScore: qualityLevel === 'excellent' ? 4.5 + Math.random() * 0.5 :
                 qualityLevel === 'good' ? 3.5 + Math.random() * 0.5 :
                 qualityLevel === 'average' ? 2.5 + Math.random() * 0.5 :
                 1.5 + Math.random() * 0.5,
    reviewAuthenticityScore: 4.0 + Math.random() * 1.0,
    generationMetadata: {
      templateType: qualityLevel,
      variationUsed: region,
      generatedAt: new Date().toISOString(),
      parameters: { bookCategory, region, politenessLevel }
    }
  };
}

// Generate multiple reviews for a seller
export function generateSellerReviews(
  sellerId: string, 
  count: number = 50,
  qualityDistribution?: { excellent: number; good: number; average: number; poor: number },
  options?: any
): any[] {
  const defaultDistribution = { excellent: 0.4, good: 0.35, average: 0.2, poor: 0.05 };
  const distribution = qualityDistribution || defaultDistribution;
  
  const reviews = [];
  const categories = Object.keys(BOOK_CATEGORY_TERMS);
  const regions = Object.keys(REGIONAL_VARIATIONS);
  
  // Generate review counts based on distribution
  const excellentCount = Math.floor(count * distribution.excellent);
  const goodCount = Math.floor(count * distribution.good);
  const averageCount = Math.floor(count * distribution.average);
  const poorCount = count - excellentCount - goodCount - averageCount;
  
  // Generate excellent reviews
  for (let i = 0; i < excellentCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    reviews.push(generateVietnameseReview(sellerId, 'excellent', category, region, options));
  }
  
  // Generate good reviews
  for (let i = 0; i < goodCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    reviews.push(generateVietnameseReview(sellerId, 'good', category, region, options));
  }
  
  // Generate average reviews
  for (let i = 0; i < averageCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    reviews.push(generateVietnameseReview(sellerId, 'average', category, region, options));
  }
  
  // Generate poor reviews
  for (let i = 0; i < poorCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    reviews.push(generateVietnameseReview(sellerId, 'poor', category, region, options));
  }
  
  // Shuffle reviews to distribute timing
  return reviews.sort(() => Math.random() - 0.5);
}

// Time distribution for reviews (spread across realistic timeframes)
export function generateReviewTimestamps(count: number, periodMonths: number = 6): Date[] {
  const now = new Date();
  const startDate = new Date(now.getTime() - (periodMonths * 30 * 24 * 60 * 60 * 1000));
  
  const timestamps = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random timestamp between start date and now
    const randomTime = startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime());
    timestamps.push(new Date(randomTime));
  }
  
  // Sort chronologically
  return timestamps.sort((a, b) => a.getTime() - b.getTime());
}