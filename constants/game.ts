/**
 * Oyun Sabitleri ve Dinamik Glitch Motoru (Single Source of Truth)
 */

/** Düzgün ve genişletilmiş doğru kelimeler (Signal) kütüphanesi - 70+ kelime */
export const SIGNALS = [
  // Hayvanlar
  'KEDİ', 'KÖPEK', 'TAVŞAN', 'ASLAN', 'KAPLAN', 'KARTAL', 'YILAN', 'FİL', 'ZEBRA', 'MAYMUN', 'KURT', 'TİLKİ', 'AYI', 'GEYİK', 'ŞAHİN',
  // Eşyalar
  'MASA', 'KAPI', 'DOLAP', 'KOLTUK', 'YATAK', 'LAMBA', 'KİTAP', 'KALEM', 'DEFTER', 'ÇANTA', 'BİLGİSAYAR', 'TELEFON', 'TABLET', 'SAAT', 'GÖZLÜK',
  // Meyveler/Sebzeler
  'ELMA', 'ARMUT', 'MUZ', 'ÇİLEK', 'KİRAZ', 'KARPUZ', 'KAVUN', 'PORTAKAL', 'MANDALİNA', 'HAVUÇ', 'DOMATES', 'SALATALIK', 'BİBER', 'SOĞAN', 'SARIMSAK',
  // Doğa
  'AĞAÇ', 'ÇİÇEK', 'YAPRAK', 'GÜNEŞ', 'YILDIZ', 'BULUT', 'YAĞMUR', 'KAR', 'RÜZGAR', 'FIRTINA', 'DENİZ', 'NEHİR', 'GÖL', 'DAĞ', 'ORMAN',
  // Renkler
  'BEYAZ', 'SİYAH', 'KIRMIZI', 'MAVİ', 'YEŞİL', 'SARI', 'MOR', 'PEMBE', 'TURUNCU', 'KAHVERENGİ', 'GRİ', 'LACİVERT'
];

/** Eğitim menüsünde (How to Play) gösterilecek örnek bozuk kelimeler */
export const EXAMPLE_NOISES = ['K3Dİ', 'KİT4P', 'M4Vİ', 'T3L3F0N', 'ELAM', 'KÖP3K'];

/** 
 * Glitch Motoru: Düzgün bir kelimeyi alıp dinamik olarak bozuk (Noise) bir versiyona çevirir.
 * Sonsuz farklı sahte kelime üretimi sağlar!
 */
export function generateNoiseWord(sourceWord: string): string {
  let word = sourceWord;

  // %75 ihtimalle harfleri sayılara (Leet Speak) dönüştür, %25 ihtimalle harflerin yerini değiştir (Swap)
  if (Math.random() < 0.75) {
    const leetMap: Record<string, string[]> = {
      'E': ['3'],
      'A': ['4'],
      'O': ['0'],
      'İ': ['1', '!'],
      'I': ['1'],
      'S': ['5'],
      'B': ['8'],
      'T': ['7'],
      'G': ['6']
    };

    // Kelimede dönüştürülebilecek harflerin indekslerini bul
    const replacableIndices: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (leetMap[word[i]]) replacableIndices.push(i);
    }

    if (replacableIndices.length > 0) {
      // Kaç harfin değişeceğini belirle (en fazla 2 harf ya da bulunabilen maksimum değiştirilebilir harf)
      const numChanges = Math.min(Math.floor(Math.random() * 2) + 1, replacableIndices.length);

      // Değişecek indeksleri rastgele karıştır (Fisher-Yates)
      for (let i = replacableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [replacableIndices[i], replacableIndices[j]] = [replacableIndices[j], replacableIndices[i]];
      }

      let arr = word.split('');
      for (let i = 0; i < numChanges; i++) {
        const idx = replacableIndices[i];
        const char = arr[idx];
        const replacements = leetMap[char];
        arr[idx] = replacements[Math.floor(Math.random() * replacements.length)];
      }
      word = arr.join('');
    } else {
      // Kelimede değişecek harf hiç yoksa, harf yer değiştirme (swap) yöntemini uygula
      word = swapRandomChars(word);
    }
  } else {
    word = swapRandomChars(word);
  }

  // Güvenlik ağı: Eğer kelime bir şekilde hiç değişmediyse, son harfini sayıya çevirelim.
  if (word === sourceWord) {
    return word.substring(0, word.length - 1) + Math.floor(Math.random() * 10).toString();
  }

  return word;
}

// Yanyana iki harfin yerini rastgele değiştiren yardımcı fonksiyon (Örn: MASA -> MSAA)
function swapRandomChars(word: string): string {
  if (word.length < 2) return word + 'X';
  const arr = word.split('');
  const idx = Math.floor(Math.random() * (arr.length - 1));
  [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
  return arr.join('');
}

/** Verilen skora göre mevcut level'ı döndürür (1-indexed) */
export function getLevel(score: number): number {
  return Math.floor(score / 5) + 1;
}

/** Verilen skora göre zorluk parametrelerini hesaplar */
export function getDifficulty(score: number) {
  const level = Math.floor(score / 5);
  const fallDuration = Math.max(1400, 4200 - level * 220);
  const spawnInterval = Math.max(550, 2200 - level * 110);
  const noiseRatio = Math.min(0.72, 0.28 + level * 0.05);
  return { fallDuration, spawnInterval, noiseRatio };
}
