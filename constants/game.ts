/**
 * Oyun Sabitleri ve Dinamik Glitch Motoru (Single Source of Truth)
 */

/** Düzgün ve genişletilmiş doğru kelimeler (Signal) kütüphanesi - 120+ kelime */
export const SIGNALS = [
  // Hayvanlar
  'KEDİ', 'KÖPEK', 'TAVŞAN', 'ASLAN', 'KAPLAN', 'KARTAL', 'YILAN', 'FİL', 'ZEBRA', 'MAYMUN',
  'KURT', 'TİLKİ', 'AYI', 'GEYİK', 'ŞAHİN', 'BALIK', 'KURBAĞA', 'PENGUEN', 'PAPAĞAN', 'KARGA',
  'ÖRDEK', 'KOYUN', 'KEÇİ', 'İNEK', 'AT',
  // Eşyalar
  'MASA', 'KAPI', 'DOLAP', 'KOLTUK', 'YATAK', 'LAMBA', 'KİTAP', 'KALEM', 'DEFTER', 'ÇANTA',
  'BİLGİSAYAR', 'TELEFON', 'TABLET', 'SAAT', 'GÖZLÜK', 'AYNA', 'BARDAK', 'TABAK', 'ÇATAL',
  'BIÇAK', 'KAŞIK', 'YASTIK', 'HALİ', 'PERDELİK',
  // Meyveler/Sebzeler
  'ELMA', 'ARMUT', 'MUZ', 'ÇİLEK', 'KİRAZ', 'KARPUZ', 'KAVUN', 'PORTAKAL', 'MANDALİNA',
  'HAVUÇ', 'DOMATES', 'SALATALIK', 'BİBER', 'SOĞAN', 'SARIMSAK', 'ÜZÜM', 'ANANAS', 'İNCİR',
  'NAR', 'ERİK', 'MANGO', 'LİMON', 'KABAK', 'PATATES', 'LAHANA',
  // Doğa
  'AĞAÇ', 'ÇİÇEK', 'YAPRAK', 'GÜNEŞ', 'YILDIZ', 'BULUT', 'YAĞMUR', 'KAR', 'RÜZGAR',
  'FIRTINA', 'DENİZ', 'NEHİR', 'GÖL', 'DAĞ', 'ORMAN', 'TOPRAK', 'KAYA', 'VOLKAN', 'DEPREM',
  'GÖKKUŞAĞI', 'ŞİMŞEK', 'SİS', 'DALGA', 'ÇÖL', 'VADI',
  // Renkler
  'BEYAZ', 'SİYAH', 'KIRMIZI', 'MAVİ', 'YEŞİL', 'SARI', 'MOR', 'PEMBE', 'TURUNCU',
  'KAHVERENGİ', 'GRİ', 'LACİVERT', 'BORDO', 'EFLATUN',
  // Meslekler
  'DOKTOR', 'AVUKAT', 'ASKER', 'PİLOT', 'ŞOFÖR', 'AŞÇI', 'BERBER', 'MİMAR',
  // Vücut
  'KALP', 'BEYİN', 'GÖZLER', 'KULAK', 'BURUN', 'DİŞ', 'PARMAK',
  // Genel
  'DÜNYA', 'UZAY', 'ZAMAN', 'MÜZIK', 'RÜYA', 'ATEŞ', 'BARIŞ', 'CESARET', 'UMUT',
];

/** Seviye başına progress bar renkleri — her level tamamlandığında sıradaki renge geçer */
export const LEVEL_COLORS = [
  '#00C853', // yeşil
  '#FF5252', // kırmızı
  '#FFD600', // sarı
  '#448AFF', // mavi
  '#E040FB', // mor
  '#FF6D00', // turuncu
  '#00E5FF', // camgöbeği
  '#FF4081', // pembe
  '#76FF03', // açık yeşil
  '#7C4DFF', // indigo
];

/** Eğitim menüsünde (How to Play) gösterilecek örnek bozuk kelimeler */
export const EXAMPLE_NOISES = ['K3Dİ', 'KİT4P', 'M4Vİ', 'T3L3F0N', 'ELAM', 'KÖP3K', 'A5L4N', 'GÜN3Ş'];

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

/** Verilen skora göre zorluk parametrelerini hesaplar
 *  Erken leveller hızlı zorlaşır, sonra logaritmik yavaşlayarak
 *  sonsuz zorluk artışı sağlar (asla tam minimuma ulaşmaz).
 */
export function getDifficulty(score: number) {
  const level = Math.floor(score / 5);

  // Logaritmik eğri: hızlı başlar, giderek yavaşlar ama asla durmaz
  // t: 0→1 arası normalize değer, level arttıkça 1'e yaklaşır ama ulaşmaz
  const t = 1 - 1 / (1 + level * 0.18);

  const fallDuration = 4200 - t * 3200;   // 4200ms → ~1000ms (asimptotik)
  const spawnInterval = 2200 - t * 1800;   // 2200ms → ~400ms
  const noiseRatio = 0.28 + t * 0.47;      // 0.28 → ~0.75

  return { fallDuration, spawnInterval, noiseRatio };
}
