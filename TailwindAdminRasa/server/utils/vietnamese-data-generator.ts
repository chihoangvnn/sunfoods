/**
 * 🇻🇳 VIETNAMESE DATA GENERATOR
 * Generates realistic Vietnamese customer data for sales automation
 * Includes names, addresses, phone numbers with proper Vietnamese formatting
 */

// Vietnamese family names with frequency weights (most common first)
export const VIETNAMESE_FAMILY_NAMES = [
  { name: "Nguyễn", weight: 0.4 },      // 40% - Most common
  { name: "Trần", weight: 0.11 },       // 11%
  { name: "Lê", weight: 0.095 },        // 9.5%
  { name: "Phạm", weight: 0.07 },       // 7%
  { name: "Hoàng", weight: 0.055 },     // 5.5%
  { name: "Huỳnh", weight: 0.05 },      // 5%
  { name: "Phan", weight: 0.045 },      // 4.5%
  { name: "Vũ", weight: 0.04 },         // 4%
  { name: "Võ", weight: 0.035 },        // 3.5%
  { name: "Đặng", weight: 0.03 },       // 3%
  { name: "Bùi", weight: 0.025 },       // 2.5%
  { name: "Đỗ", weight: 0.02 },         // 2%
  { name: "Hồ", weight: 0.015 },        // 1.5%
  { name: "Ngô", weight: 0.015 },       // 1.5%
  { name: "Dương", weight: 0.01 },      // 1%
];

// Vietnamese male given names
export const VIETNAMESE_MALE_NAMES = [
  "Minh", "Hoàng", "Nam", "Tuấn", "Dũng", "Hùng", "Thành", "Đức", "Quang", "Huy",
  "Khôi", "Tân", "Việt", "Bảo", "Long", "Phong", "Thiện", "Khánh", "Tú", "Hiếu",
  "Tài", "Toàn", "Đạt", "Sơn", "Phúc", "Hải", "Lâm", "Kiên", "Nghĩa", "Vinh",
  "Trung", "Thịnh", "An", "Đạng", "Linh", "Tâm", "Khang", "Duy", "Đông", "Nhật",
  "Thiên", "Hà", "Trí", "Phát", "Cường", "Giang", "Tuệ", "Đăng", "Gia", "Khải"
];

// Vietnamese female given names
export const VIETNAMESE_FEMALE_NAMES = [
  "Hương", "Linh", "Mai", "Hoa", "Lan", "Thu", "Thảo", "Ngọc", "Trang", "Huyền",
  "Phương", "Chi", "Vy", "My", "Thúy", "Anh", "Hằng", "Diệu", "Ly", "Xuân",
  "Như", "Thanh", "Yến", "Kiều", "Hạnh", "Nga", "Dung", "Tâm", "Vân", "Quỳnh",
  "Châu", "Giang", "Bích", "Hiền", "Oanh", "Tuyết", "Hà", "Nhung", "Trinh", "Hạ",
  "Minh", "Thùy", "Hoài", "Loan", "Khuyên", "Bảo", "Nhi", "Trâm", "An", "Thơ"
];

// Vietnamese middle names (commonly used)
export const VIETNAMESE_MIDDLE_NAMES = {
  male: ["Văn", "Quốc", "Đình", "Hữu", "Xuân", "Thế", "Công", "Minh", "Tuấn", "Thanh"],
  female: ["Thị", "Thanh", "Thu", "Ngọc", "Minh", "Thúy", "Diệu", "Xuân", "Phương", "Bảo"]
};

// Vietnamese cities with districts and realistic addresses
export const VIETNAMESE_CITIES = {
  "Thành phố Hồ Chí Minh": {
    weight: 0.4, // 40% of automation customers
    districts: [
      "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", 
      "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Quận Thủ Đức",
      "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình",
      "Quận Tân Phú", "Quận Bình Tân", "Huyện Hóc Môn", "Huyện Củ Chi"
    ],
    streetPrefixes: ["Đường", "Phố", "Ngõ", "Hẻm", "Số"],
    commonStreets: [
      "Nguyễn Huệ", "Lê Lợi", "Đồng Khởi", "Nam Kỳ Khởi Nghĩa", "Hai Bà Trưng",
      "Lý Tự Trọng", "Nguyễn Du", "Pasteur", "Cống Quỳnh", "Trần Hưng Đạo",
      "Điện Biên Phủ", "Nguyễn Thị Minh Khai", "Võ Văn Tần", "Cao Thắng"
    ]
  },
  "Hà Nội": {
    weight: 0.25, // 25%
    districts: [
      "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Hai Bà Trưng", "Quận Đống Đa",
      "Quận Tây Hồ", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai",
      "Quận Long Biên", "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Hà Đông"
    ],
    streetPrefixes: ["Phố", "Ngõ", "Đường", "Số"],
    commonStreets: [
      "Hoàn Kiếm", "Trần Hưng Đạo", "Lý Thường Kiệt", "Bà Triệu", "Nguyễn Du",
      "Trần Phú", "Kim Mã", "Giảng Võ", "Láng Hạ", "Thái Hà", "Xã Đàn",
      "Đội Cần", "Hàng Bài", "Tràng Tiền", "Đinh Tiên Hoàng"
    ]
  },
  "Đà Nẵng": {
    weight: 0.12, // 12%
    districts: [
      "Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn",
      "Quận Liên Chiểu", "Quận Cẩm Lệ", "Huyện Hòa Vang"
    ],
    streetPrefixes: ["Đường", "Phố", "Ngõ"],
    commonStreets: [
      "Lê Duẩn", "Trần Phú", "Nguyễn Văn Linh", "Điện Biên Phủ", "Hoàng Diệu",
      "Bach Đằng", "Hùng Vương", "Lê Lợi", "Nguyễn Thị Minh Khai"
    ]
  },
  "Hải Phòng": {
    weight: 0.08, // 8%
    districts: [
      "Quận Hồng Bàng", "Quận Ngô Quyền", "Quận Lê Chân", "Quận Hải An",
      "Quận Kiến An", "Quận Đồ Sơn", "Quận Dương Kinh"
    ],
    streetPrefixes: ["Đường", "Phố"],
    commonStreets: [
      "Lạch Tray", "Điện Biên Phủ", "Tô Hiệu", "Lê Hồng Phong", "Hoàng Văn Thụ"
    ]
  },
  "Cần Thơ": {
    weight: 0.06, // 6%
    districts: [
      "Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn",
      "Quận Thốt Nốt"
    ],
    streetPrefixes: ["Đường", "Phố"],
    commonStreets: [
      "3 Tháng 2", "30 Tháng 4", "Nguyễn Văn Cừ", "Mậu Thân", "Trần Hưng Đạo"
    ]
  },
  "Nha Trang": {
    weight: 0.04, // 4%
    districts: ["TP Nha Trang"],
    streetPrefixes: ["Đường", "Phố"],
    commonStreets: [
      "Trần Phú", "Nguyễn Thị Minh Khai", "Lê Thành Tôn", "Hoàng Hoa Thám"
    ]
  },
  "Huế": {
    weight: 0.03, // 3%
    districts: ["TP Huế"],
    streetPrefixes: ["Đường", "Phố"],
    commonStreets: [
      "Lê Lợi", "Nguyễn Huệ", "Trần Hưng Đạo", "Đinh Tiên Hoàng"
    ]
  },
  "Vũng Tàu": {
    weight: 0.02, // 2%
    districts: ["TP Vũng Tàu"],
    streetPrefixes: ["Đường"],
    commonStreets: [
      "Hoàng Hoa Thám", "Lê Lợi", "Trương Công Định", "Nguyễn Du"
    ]
  }
};

// Vietnamese phone number patterns
export const PHONE_PATTERNS = {
  mobile: {
    weight: 0.85, // 85% mobile phones
    patterns: [
      { prefix: "+84 9", format: "+84 9XX XXX XXX", networks: ["Mobifone", "Vietnamobile"] },
      { prefix: "+84 8", format: "+84 8XX XXX XXX", networks: ["Vinaphone", "Vietnamobile"] },
      { prefix: "+84 7", format: "+84 7XX XXX XXX", networks: ["Viettel", "Mobifone"] },
      { prefix: "+84 5", format: "+84 5XX XXX XXX", networks: ["Vietnamobile"] },
      { prefix: "+84 3", format: "+84 3XX XXX XXX", networks: ["Vinaphone"] }
    ]
  },
  landline: {
    weight: 0.15, // 15% landline phones
    patterns: [
      { prefix: "+84 28", format: "+84 28 XXXX XXXX", city: "TP.HCM" },
      { prefix: "+84 24", format: "+84 24 XXXX XXXX", city: "Hà Nội" },
      { prefix: "+84 236", format: "+84 236 XXX XXXX", city: "Đà Nẵng" },
      { prefix: "+84 225", format: "+84 225 XXX XXXX", city: "Hải Phòng" },
      { prefix: "+84 292", format: "+84 292 XXX XXXX", city: "Cần Thơ" }
    ]
  }
};

// Payment methods with Vietnamese preferences
export const PAYMENT_METHODS = [
  { method: "cash", weight: 0.6, nameVN: "Tiền mặt" },
  { method: "bank_transfer", weight: 0.35, nameVN: "Chuyển khoản ngân hàng" },
  { method: "debt", weight: 0.05, nameVN: "Ghi nợ" }
];

// Utility functions for weighted random selection
function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1]; // Fallback
}

function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate Vietnamese full name
export function generateVietnameseName(gender?: 'male' | 'female'): {
  fullName: string;
  familyName: string;
  middleName: string;
  givenName: string;
  gender: 'male' | 'female';
} {
  const actualGender = gender || (Math.random() > 0.5 ? 'male' : 'female');
  const familyName = weightedRandom(VIETNAMESE_FAMILY_NAMES).name;
  const middleName = randomFromArray(VIETNAMESE_MIDDLE_NAMES[actualGender]);
  const givenName = randomFromArray(
    actualGender === 'male' ? VIETNAMESE_MALE_NAMES : VIETNAMESE_FEMALE_NAMES
  );
  
  const fullName = `${familyName} ${middleName} ${givenName}`;
  
  return {
    fullName,
    familyName,
    middleName,
    givenName,
    gender: actualGender
  };
}

// Generate Vietnamese address
export function generateVietnameseAddress(): {
  fullAddress: string;
  houseNumber: string;
  street: string;
  district: string;
  city: string;
  region: string;
} {
  const city = weightedRandom(Object.entries(VIETNAMESE_CITIES).map(([name, data]) => ({
    name,
    weight: data.weight,
    data
  })));
  
  const cityData = city.data;
  const district = randomFromArray(cityData.districts);
  const streetPrefix = randomFromArray(cityData.streetPrefixes);
  const streetName = randomFromArray(cityData.commonStreets);
  const houseNumber = `${randomNumber(1, 999)}${Math.random() > 0.7 ? `/${randomNumber(1, 50)}` : ''}`;
  
  const street = `${streetPrefix} ${streetName}`;
  const fullAddress = `${houseNumber} ${street}, ${district}, ${city.name}`;
  
  // Determine region
  let region = "Miền Nam";
  if (["Hà Nội", "Hải Phòng"].includes(city.name)) {
    region = "Miền Bắc";
  } else if (["Đà Nẵng", "Huế"].includes(city.name)) {
    region = "Miền Trung";
  }
  
  return {
    fullAddress,
    houseNumber,
    street,
    district,
    city: city.name,
    region
  };
}

// Generate Vietnamese phone number
export function generateVietnamesePhone(city?: string): {
  phoneNumber: string;
  type: 'mobile' | 'landline';
  network?: string;
  formatted: string;
} {
  const phoneType = Math.random() < PHONE_PATTERNS.mobile.weight ? 'mobile' : 'landline';
  
  if (phoneType === 'mobile') {
    const pattern = randomFromArray(PHONE_PATTERNS.mobile.patterns);
    const network = randomFromArray(pattern.networks);
    
    // Generate the number based on pattern
    let phoneNumber = pattern.prefix;
    const digitsNeeded = pattern.format.split('X').length - 1;
    
    for (let i = 0; i < digitsNeeded; i++) {
      phoneNumber += randomNumber(0, 9).toString();
    }
    
    // Format the number
    const formatted = formatPhoneNumber(phoneNumber, pattern.format);
    
    return {
      phoneNumber,
      type: 'mobile',
      network,
      formatted
    };
  } else {
    // Landline - try to match city if provided
    const cityPatterns = PHONE_PATTERNS.landline.patterns.filter(p => 
      !city || p.city === city || city.includes(p.city) || p.city.includes(city)
    );
    
    const pattern = cityPatterns.length > 0 
      ? randomFromArray(cityPatterns)
      : randomFromArray(PHONE_PATTERNS.landline.patterns);
    
    let phoneNumber = pattern.prefix;
    const digitsNeeded = pattern.format.split('X').length - 1;
    
    for (let i = 0; i < digitsNeeded; i++) {
      phoneNumber += randomNumber(0, 9).toString();
    }
    
    const formatted = formatPhoneNumber(phoneNumber, pattern.format);
    
    return {
      phoneNumber,
      type: 'landline',
      formatted
    };
  }
}

// Format phone number according to pattern
function formatPhoneNumber(number: string, pattern: string): string {
  let formatted = pattern;
  let numberIndex = 0;
  
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] === 'X' && numberIndex < number.length) {
      formatted = formatted.substring(0, i) + number[numberIndex] + formatted.substring(i + 1);
      numberIndex++;
    }
  }
  
  return formatted;
}

// Generate customer age based on Vietnamese demographics
export function generateCustomerAge(): {
  age: number;
  ageGroup: string;
  generationVN: string;
} {
  // Age distribution for book buyers in Vietnam
  const ageRanges = [
    { range: [16, 25], weight: 0.25, group: "16-25", generation: "Gen Z" },
    { range: [26, 35], weight: 0.35, group: "26-35", generation: "Millennials" },
    { range: [36, 45], weight: 0.25, group: "36-45", generation: "Gen X" },
    { range: [46, 55], weight: 0.10, group: "46-55", generation: "Boomers" },
    { range: [56, 70], weight: 0.05, group: "56-70", generation: "Silent Gen" }
  ];
  
  const selectedRange = weightedRandom(ageRanges);
  const age = randomNumber(selectedRange.range[0], selectedRange.range[1]);
  
  return {
    age,
    ageGroup: selectedRange.group,
    generationVN: selectedRange.generation
  };
}

// Generate email based on Vietnamese preferences
export function generateVietnameseEmail(name: { familyName: string; givenName: string; gender: 'male' | 'female' }): string {
  const providers = [
    { domain: "gmail.com", weight: 0.6 },
    { domain: "yahoo.com", weight: 0.15 },
    { domain: "hotmail.com", weight: 0.1 },
    { domain: "outlook.com", weight: 0.05 },
    { domain: "vn.edu.vn", weight: 0.03 },
    { domain: "company.vn", weight: 0.07 }
  ];
  
  const provider = weightedRandom(providers);
  
  // Create email username from name
  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  
  const familyNameClean = removeAccents(name.familyName).toLowerCase();
  const givenNameClean = removeAccents(name.givenName).toLowerCase();
  
  // Various email patterns used in Vietnam
  const patterns = [
    `${givenNameClean}.${familyNameClean}`,
    `${familyNameClean}.${givenNameClean}`,
    `${givenNameClean}${familyNameClean}`,
    `${givenNameClean}_${familyNameClean}`,
    `${givenNameClean}${randomNumber(1990, 2005)}`,
    `${familyNameClean}${givenNameClean}${randomNumber(10, 99)}`
  ];
  
  const username = randomFromArray(patterns);
  return `${username}@${provider.domain}`;
}

// Generate payment method preference
export function generatePaymentMethod(): {
  method: string;
  nameVN: string;
  preference: number; // 1-5 scale
} {
  const selected = weightedRandom(PAYMENT_METHODS);
  
  return {
    method: selected.method,
    nameVN: selected.nameVN,
    preference: randomNumber(3, 5) // Vietnamese customers generally prefer their chosen method
  };
}

// Generate complete Vietnamese customer data
export interface VietnameseCustomerData {
  // Personal Info
  name: {
    fullName: string;
    familyName: string;
    middleName: string;
    givenName: string;
    gender: 'male' | 'female';
  };
  age: {
    age: number;
    ageGroup: string;
    generationVN: string;
  };
  
  // Contact Info
  email: string;
  phone: {
    phoneNumber: string;
    type: 'mobile' | 'landline';
    network?: string;
    formatted: string;
  };
  
  // Address Info
  address: {
    fullAddress: string;
    houseNumber: string;
    street: string;
    district: string;
    city: string;
    region: string;
  };
  
  // Preferences
  paymentMethod: {
    method: string;
    nameVN: string;
    preference: number;
  };
  
  // Customer Type
  customerType: 'new' | 'repeat' | 'vip';
  customerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Metadata
  generatedAt: string;
  source: 'automation';
}

export function generateVietnameseCustomer(preferences?: {
  gender?: 'male' | 'female';
  city?: string;
  customerType?: 'new' | 'repeat' | 'vip';
  ageGroup?: string;
}): VietnameseCustomerData {
  const name = generateVietnameseName(preferences?.gender);
  const age = generateCustomerAge();
  const address = generateVietnameseAddress();
  const phone = generateVietnamesePhone(preferences?.city || address.city);
  const email = generateVietnameseEmail(name);
  const paymentMethod = generatePaymentMethod();
  
  // Determine customer type based on preferences or randomization
  let customerType: 'new' | 'repeat' | 'vip' = preferences?.customerType || 'new';
  if (!preferences?.customerType) {
    const typeWeights = [
      { type: 'new' as const, weight: 0.6 },
      { type: 'repeat' as const, weight: 0.3 },
      { type: 'vip' as const, weight: 0.1 }
    ];
    customerType = weightedRandom(typeWeights).type;
  }
  
  // Determine customer tier based on type and age
  let customerTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
  if (customerType === 'vip') {
    customerTier = Math.random() > 0.5 ? 'gold' : 'platinum';
  } else if (customerType === 'repeat') {
    customerTier = Math.random() > 0.7 ? 'gold' : 'silver';
  } else {
    customerTier = Math.random() > 0.8 ? 'silver' : 'bronze';
  }
  
  return {
    name,
    age,
    email,
    phone,
    address,
    paymentMethod,
    customerType,
    customerTier,
    generatedAt: new Date().toISOString(),
    source: 'automation'
  };
}

// Generate multiple Vietnamese customers
export function generateVietnameseCustomers(count: number, preferences?: {
  cityDistribution?: { [city: string]: number };
  genderRatio?: { male: number; female: number };
  customerTypeRatio?: { new: number; repeat: number; vip: number };
}): VietnameseCustomerData[] {
  const customers: VietnameseCustomerData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Apply distribution preferences if provided
    let customerPrefs: any = {};
    
    if (preferences?.genderRatio) {
      const totalGenderWeight = preferences.genderRatio.male + preferences.genderRatio.female;
      customerPrefs.gender = Math.random() < (preferences.genderRatio.male / totalGenderWeight) ? 'male' : 'female';
    }
    
    if (preferences?.customerTypeRatio) {
      const typeOptions = Object.entries(preferences.customerTypeRatio);
      const totalTypeWeight = typeOptions.reduce((sum, [_, weight]) => sum + weight, 0);
      let random = Math.random() * totalTypeWeight;
      
      for (const [type, weight] of typeOptions) {
        random -= weight;
        if (random <= 0) {
          customerPrefs.customerType = type;
          break;
        }
      }
    }
    
    customers.push(generateVietnameseCustomer(customerPrefs));
  }
  
  return customers;
}

// All functions are already exported individually above