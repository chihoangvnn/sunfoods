export const vietnameseCities: Record<string, string> = {
  "sài gòn": "TP.HCM",
  "sai gon": "TP.HCM",
  "ho chi minh": "TP.HCM",
  "hồ chí minh": "TP.HCM",
  "tp.hcm": "TP.HCM",
  "tphcm": "TP.HCM",
  "hà nội": "Hà Nội",
  "ha noi": "Hà Nội",
  "hanoi": "Hà Nội",
  "đà nẵng": "Đà Nẵng",
  "da nang": "Đà Nẵng",
  "danang": "Đà Nẵng",
  "huế": "Huế",
  "hue": "Huế",
  "nha trang": "Nha Trang",
  "quy nhơn": "Quy Nhơn",
  "quy nhon": "Quy Nhơn",
  "quảng ngãi": "Quảng Ngãi",
  "quang ngai": "Quảng Ngãi",
  "tam kỳ": "Tam Kỳ",
  "tam ky": "Tam Kỳ",
  "hội an": "Hội An",
  "hoi an": "Hội An",
  "tiên phước": "Tiên Phước",
  "tien phuoc": "Tiên Phước",
  "cần thơ": "Cần Thơ",
  "can tho": "Cần Thơ",
  "vũng tàu": "Vũng Tàu",
  "vung tau": "Vũng Tàu",
  "biên hòa": "Biên Hòa",
  "bien hoa": "Biên Hòa",
  "thủ đức": "Thủ Đức",
  "thu duc": "Thủ Đức",
  "hải phòng": "Hải Phòng",
  "hai phong": "Hải Phòng",
  "long xuyên": "Long Xuyên",
  "long xuyen": "Long Xuyên",
  "mỹ tho": "Mỹ Tho",
  "my tho": "Mỹ Tho",
  "cà mau": "Cà Mau",
  "ca mau": "Cà Mau",
  "rạch giá": "Rạch Giá",
  "rach gia": "Rạch Giá",
  "phan thiết": "Phan Thiết",
  "phan thiet": "Phan Thiết",
  "đà lạt": "Đà Lạt",
  "da lat": "Đà Lạt",
  "dalat": "Đà Lạt",
  "buôn ma thuột": "Buôn Ma Thuột",
  "buon ma thuot": "Buôn Ma Thuột",
  "pleiku": "Pleiku",
  "vinh": "Vinh",
  "nghệ an": "Nghệ An",
  "nghe an": "Nghệ An",
  "thanh hóa": "Thanh Hóa",
  "thanh hoa": "Thanh Hóa",
  "hạ long": "Hạ Long",
  "ha long": "Hạ Long",
  "quảng ninh": "Quảng Ninh",
  "quang ninh": "Quảng Ninh",
};

export function detectCityInQuery(query: string): string | null {
  if (!query || !query.trim()) {
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  for (const [cityVariation, cityName] of Object.entries(vietnameseCities)) {
    if (normalizedQuery.includes(cityVariation)) {
      return cityName;
    }
  }
  
  return null;
}

export function getCityFromAddress(address: string): string | null {
  if (!address || !address.trim()) {
    return null;
  }

  const normalizedAddress = address.toLowerCase();
  
  for (const [cityVariation, cityName] of Object.entries(vietnameseCities)) {
    if (normalizedAddress.includes(cityVariation)) {
      return cityName;
    }
  }
  
  const addressParts = address.split(',').map(part => part.trim());
  for (const part of addressParts) {
    const normalizedPart = part.toLowerCase();
    for (const [cityVariation, cityName] of Object.entries(vietnameseCities)) {
      if (normalizedPart === cityVariation || normalizedPart.includes(cityVariation)) {
        return cityName;
      }
    }
  }
  
  return null;
}
