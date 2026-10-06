/**
 * EduKids Bilingual Support Utility
 * Parses English & Vietnamese dual-text and provides English speech synthesis.
 */

/**
 * Parses raw bilingual text into English primary content and Vietnamese translation.
 * Supports:
 * 1. [EN]: English text [VN]: Vietnamese text (case-insensitive, colon optional)
 * 2. [VN]: Vietnamese text [EN]: English text
 * 3. English text || Vietnamese text
 * 4. English text (Bản dịch tiếng Việt có dấu)
 */
export function parseBilingualText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { en: rawText || '', vn: '', hasTranslation: false };
  }

  const str = rawText.trim();

  // 1. [EN]/[ENG]: ... [VN]/[VI]/[VIE]: ...
  const enVnMatch = str.match(/(?:\[|\()?(?:EN|ENG)(?:\]|\))?:?\s*(.*?)\s*(?:\[|\()?(?:VN|VI|VIE)(?:\]|\))?:?\s*(.*)$/is);
  if (enVnMatch && enVnMatch[1] && enVnMatch[2]) {
    return {
      en: enVnMatch[1].trim(),
      vn: enVnMatch[2].trim(),
      hasTranslation: true
    };
  }

  // 2. [VN]/[VI]/[VIE]: ... [EN]/[ENG]: ...
  const vnEnMatch = str.match(/(?:\[|\()?(?:VN|VI|VIE)(?:\]|\))?:?\s*(.*?)\s*(?:\[|\()?(?:EN|ENG)(?:\]|\))?:?\s*(.*)$/is);
  if (vnEnMatch && vnEnMatch[1] && vnEnMatch[2]) {
    return {
      en: vnEnMatch[2].trim(),
      vn: vnEnMatch[1].trim(),
      hasTranslation: true
    };
  }

  // 3. Delimiter || e.g. "Birthday cake || Bánh sinh nhật"
  if (str.includes('||')) {
    const parts = str.split('||');
    if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
      return {
        en: parts[0].trim(),
        vn: parts.slice(1).join('||').trim(),
        hasTranslation: true
      };
    }
  }

  // 4. Parentheses at end: "Birthday cake (Bánh kem sinh nhật)"
  const parenMatch = str.match(/^(.*?)\s*\(([^()]+)\)$/s);
  if (parenMatch) {
    const mainPart = parenMatch[1].trim();
    const insideParen = parenMatch[2].trim();
    const hasVietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(insideParen);
    if (hasVietnameseChars && mainPart.length > 0) {
      return {
        en: mainPart,
        vn: insideParen,
        hasTranslation: true
      };
    }
  }

  return {
    en: str,
    vn: '',
    hasTranslation: false
  };
}

/**
 * Text-to-Speech (Pronounce English words/sentences clearly for kids)
 */
export function speakEnglish(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88; // Slightly measured pace for kids
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
