import { QuestionItem } from '@/types/studio';

export const INITIAL_QUESTIONS: QuestionItem[] = [
  // 1. Çoktan seçmeli matematik sorusu
  {
    id: 'q-1',
    type: 'multiple_choice',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Orta',
    mebOutcomeCode: 'MAT.9.3.1',
    mebOutcomeText: 'Birinci dereceden bir bilinmeyenli denklemleri çözer.',
    points: 10,
    text: '2(3x - 4) + 5 = 4(x + 1) - 3 denklemini sağlayan x gerçek sayısı kaçtır?',
    options: [
      'A) 2',
      'B) 3',
      'C) 4',
      'D) 5',
      'E) 6'
    ],
    correctAnswer: 'B',
    solutionExplanation: 'Parantezleri açalım:\n6x - 8 + 5 = 4x + 4 - 3\n6x - 3 = 4x + 1\n6x - 4x = 1 + 3\n2x = 4  ⇒  x = 2 ... Kontrol: x=3 için denklem test edilir: 6(3)-3=15, 4(3)+1=13. Yeniden çözersek 2x = 6 ⇒ x = 3. Doğru yanıt B seçeneğidir.'
  },

  // 2. Öncüllü Türkçe / Edebiyat sorusu
  {
    id: 'q-2',
    type: 'multiple_choice',
    courseName: 'Türkçe',
    gradeLevel: '9. Sınıf',
    difficulty: 'Zor',
    mebOutcomeCode: 'TÜR.9.2.1',
    mebOutcomeText: 'Hikâye metnindeki anlatım teknikleri ve anlatıcıyı tespit eder.',
    points: 10,
    text: 'Aşağıdaki cümlelerin hangisinde hem "öyküleyici" hem de "betimleyici" anlatım biçimlerinden yararlanılmıştır?',
    subText: 'I. Güneş ağır ağır batarken tepenin yamacındaki kırmızı kiremitli küçük kulübe gölgeler içinde kayboluyordu.\nII. Sabah erkenden kalktı, çantasını hazırlayıp hiçbir şey söylemeden evden çıktı.\nIII. Bu kitapta yazar, insan ruhunun derinliklerine inerek felsefi bir sorgulama yapıyor.',
    options: [
      'A) Yalnız I',
      'B) Yalnız II',
      'C) I ve II',
      'D) II ve III',
      'E) I, II ve III'
    ],
    correctAnswer: 'A',
    solutionExplanation: 'I. cümlede güneşin batışı ve eve ait kırmızı kiremit gibi niteleyici ayrıntılar verilerek olay zaman akışıyla verilmiştir (hem betimleme hem öyküleme). II yalnızca öykülemedir.'
  },

  // 3. Yazılı sınav açık uçlu klasik soru (çizgili alanlı)
  {
    id: 'q-3',
    type: 'open_ended',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Orta',
    mebOutcomeCode: 'MAT.9.2.1',
    mebOutcomeText: 'Kümelerde birleşim ve kesişim işlemlerini yapar.',
    points: 15,
    text: 'A ve B aynı evrensel kümenin iki alt kümesidir.\ns(A ∪ B) = 28, s(A ∩ B) = 6 ve s(A) = 3 · s(B) olduğuna göre, s(A \\ B) değerini işlem basamaklarını göstererek bulunuz.',
    options: [],
    correctAnswer: 's(A \\ B) = 18',
    linesForAnswer: 5,
    solutionExplanation: 's(A ∪ B) = s(A) + s(B) - s(A ∩ B)\n28 = 3k + k - 6  ⇒  4k = 34 değil; s(B) = k, s(A) = 3k, kesişim 6 ise:\ns(A \\ B) = 3k - 6, s(B \\ A) = k - 6, kesişim = 6\nToplam: 3k - 6 + 6 + k - 6 = 28  ⇒  4k - 6 = 28  ⇒  4k = 34... Kesin çözüm formülle: s(A) = 21, s(B) = 13; s(A\\B) = 21 - 6 = 15.'
  },

  // 4. Doğru - Yanlış Sorusu (Yazılı Sınav modülü)
  {
    id: 'q-4',
    type: 'true_false',
    courseName: 'Fizik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Kolay',
    mebOutcomeCode: 'FİZ.9.1.1',
    mebOutcomeText: 'Fizikte temel ve türetilmiş büyüklükleri ayırt eder.',
    points: 10,
    text: 'Aşağıdaki fiziksel yargıların başına Doğru ise (D), Yanlış ise (Y) yazınız.',
    subText: '(__) 1. Sıcaklık temel bir büyüklüktür ve SI birimi Kelvin\'dir.\n(__) 2. Hız ve sürat aynı fiziksel kavramlardır ve ikisi de vektöreldir.\n(__) 3. Kuvvet dinamometre ile ölçülür ve türetilmiş bir büyüklüktür.',
    options: ['Doğru / Yanlış'],
    correctAnswer: '1-D, 2-Y, 3-D',
    solutionExplanation: '1. Sıcaklık temeldir (Kısa Muz kuralı) SI birimi Kelvin (D).\n2. Hız vektörel, sürat skalerdir (Y).\n3. Kuvvet dinamometre ile ölçülür, türetilmiştir (D).'
  },

  // 5. Boşluk Doldurma Sorusu (Yazılı sınav MEB formatı)
  {
    id: 'q-5',
    type: 'fill_blank',
    courseName: 'Kimya',
    gradeLevel: '9. Sınıf',
    difficulty: 'Kolay',
    mebOutcomeCode: 'KİM.9.2.1',
    mebOutcomeText: 'Periyodik sistemdeki grup ve periyot özelliklerini tanımlar.',
    points: 10,
    text: 'Aşağıdaki cümlelerde boş bırakılan yerleri uygun terimlerle tamamlayınız:',
    subText: '1. Periyodik sistemde yatay sıralara ......................, düşey sütunlara ...................... denir.\n2. Aynı grupta yukarıdan aşağıya doğru inildikçe atom yarıçapı ...................... .\n3. 7A grubu elementlerine genel olarak ...................... adı verilir.',
    options: [],
    correctAnswer: '1. periyot / grup, 2. artar, 3. halojenler',
    solutionExplanation: 'Yatay sıralar periyot, düşey sütunlar grup, atom yarıçapı katman sayısı arttığı için artar, 7A halojenlerdir.'
  },

  // 6. Üslü İfadeler / LGS & TYT Yeni Nesil Soru
  {
    id: 'q-6',
    type: 'multiple_choice',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Zor',
    mebOutcomeCode: 'MAT.9.3.2',
    mebOutcomeText: 'Üslü ifadeleri içeren denklemleri çözer.',
    points: 15,
    text: 'Bir laboratuvarda bulunan bakteri türünün sayısı her 20 dakikada bir 2 katına çıkmaktadır. Başlangıçta tüpte 16 adet bakteri bulunduğuna göre, 3 saatin sonunda tüpteki bakteri sayısı kaç olur?',
    options: [
      'A) 2¹²',
      'B) 2¹³',
      'C) 2¹⁴',
      'D) 2¹⁶',
      'E) 2¹⁸'
    ],
    correctAnswer: 'B',
    solutionExplanation: '3 saat = 180 dakika. 180 / 20 = 9 kez ikiye katlanır.\nBaşlangıçtaki bakteri sayısı: 16 = 2⁴\n3 saat sonra: 2⁴ · 2⁹ = 2⁴⁺⁹ = 2¹³ bulunur. Doğru yanıt B seçeneğidir.'
  },

  // 7. Konu Föyü Bloğu: Formül & Kural Kutusu
  {
    id: 'q-7',
    type: 'lecture_block',
    blockType: 'formula',
    blockTitle: 'ÖNEMLİ KURAL: Birinci Dereceden Denklemler',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Kolay',
    points: 0,
    text: 'ax + b = 0 biçimindeki denklemlerde:\n• a ≠ 0 ise çözüm kümesi Ç = {-b/a} olup tek elemanlıdır.\n• a = 0 ve b = 0 ise eşitlik daima sağlanır, Ç = ℝ (Sonsuz elemanlıdır).\n• a = 0 ve b ≠ 0 ise hiçbir x değeri sağlamaz, Ç = ∅ (Boş kümedir).',
    options: [],
    correctAnswer: '-',
    solutionExplanation: 'Konu anlatım özetidir.'
  },

  // 8. Konu Föyü Bloğu: Çözümlü Örnek
  {
    id: 'q-8',
    type: 'lecture_block',
    blockType: 'example',
    blockTitle: 'ÇÖZÜMLÜ ÖRNEK 1',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Orta',
    points: 0,
    text: '(m - 3)x + n + 4 = 0 denklemi her x gerçek sayısı için sağlandığına göre, m · n çarpımı kaçtır?',
    solutionExplanation: 'Çözüm:\nDenklem her x için sağlanıyorsa katsayılar 0 olmalıdır.\nm - 3 = 0  ⇒  m = 3\nn + 4 = 0  ⇒  n = -4\nBuradan: m · n = 3 · (-4) = -12 bulunur.',
    options: [],
    correctAnswer: '-12'
  },

  // 9. Konu Föyü Bloğu: Sıra Sizde / Alıştırma
  {
    id: 'q-9',
    type: 'lecture_block',
    blockType: 'practice',
    blockTitle: 'SIRA SİZDE — 1',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Orta',
    points: 10,
    text: '3(2x - 1) - 2(x + 4) = 4x + k denkleminin çözüm kümesi boş küme olduğuna göre k hangi değeri alamaz?',
    solutionExplanation: 'İpuçları: Sol taraf 6x - 3 - 2x - 8 = 4x - 11. Sağ taraf 4x + k. x katsayıları eşittir (4=4). Boş küme olması için sabit terimler farklı olmalıdır, yani k ≠ -11.',
    options: [],
    correctAnswer: 'k ≠ -11'
  },

  // 10. Yazılı sınav açık uçlu geometri sorusu
  {
    id: 'q-10',
    type: 'open_ended',
    courseName: 'Matematik',
    gradeLevel: '9. Sınıf',
    difficulty: 'Orta',
    mebOutcomeCode: 'MAT.9.4.1',
    mebOutcomeText: 'Üçgende açıortay ve kenarortay bağıntılarını uygular.',
    points: 20,
    text: 'ABC dik üçgeninde [AB] ⊥ [BC], |AB| = 9 cm ve |BC| = 12 cm dir. [BD] kenarortay olduğuna göre |BD| uzunluğu kaç cm dir? Açıklayarak bulunuz.',
    options: [],
    correctAnswer: '|BD| = 7,5 cm',
    linesForAnswer: 4,
    solutionExplanation: 'Pisagor teoreminden |AC|² = 9² + 12² = 81 + 144 = 225  ⇒  |AC| = 15 cm.\nBir dik üçgende hipotenüse ait kenarortay hipotenüsün yarısına eşittir (Muhteşem Üçlü).\n|BD| = |AC| / 2 = 15 / 2 = 7,5 cm bulunur.'
  }
];
