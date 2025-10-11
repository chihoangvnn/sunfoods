"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhone = normalizePhone;
exports.isValidVietnamesePhone = isValidVietnamesePhone;
function normalizePhone(phone) {
    if (!phone)
        return '';
    let normalized = phone.trim();
    normalized = normalized.replace(/[\s\-\(\)\+]/g, '');
    if (normalized.startsWith('84')) {
        normalized = '0' + normalized.substring(2);
    }
    if (normalized.startsWith('00')) {
        normalized = normalized.substring(2);
    }
    return normalized;
}
function isValidVietnamesePhone(phone) {
    if (!phone)
        return false;
    const vietnamesePhoneRegex = /^0[3-9][0-9]{8}$/;
    return vietnamesePhoneRegex.test(phone);
}
