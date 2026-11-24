export type AccentKey = 'pink' | 'lavender' | 'sage' | 'gold';

export interface AccentTheme {
  key: AccentKey;
  label: string;
  primary: string;
  deep: string;
  soft: string;
  glow: string;
  toastNote: string;
}

export interface LetterPageData {
  id: number;
  accent: AccentKey;
  topline: string;
  flowerSymbol: string;
  stampLabel: string;
  stampToast: string;
  headingLine1: string;
  headingEmphasis: string;
  paragraphs: string[];
  signature: string;
  hint: string;
  nextLabel: string;
  isFinal?: boolean;
  finalEyebrow?: string;
  finalAuthor?: string;
  finalDate?: string;
}

export const MP3_TRACK_URL =
  '/assets/aistudio/Pagiku_Cerahku_-_Instrumen__reverb__nolif__1__0b93a3aa.mp3';

export const MP3_TRACK_TITLE = 'Pagiku Cerahku';

export const ACCENT_THEMES: Record<AccentKey, AccentTheme> = {
  pink: {
    key: 'pink',
    label: 'Kelopak Mawar',
    primary: '#d98fa7',
    deep: '#bd6f8c',
    soft: '#f8e4ea',
    glow: 'rgba(217, 143, 167, 0.28)',
    toastNote: 'Nuansa hangat merah muda — tanda kasih tulus untuk guru.',
  },
  lavender: {
    key: 'lavender',
    label: 'Lembayung Tenang',
    primary: '#a99acb',
    deep: '#8271aa',
    soft: '#eee9f7',
    glow: 'rgba(169, 154, 203, 0.28)',
    toastNote: 'Nuansa lavender — simbol kesabaran dan ketenangan.',
  },
  sage: {
    key: 'sage',
    label: 'Daun Sage',
    primary: '#91aa91',
    deep: '#6a876a',
    soft: '#eaf1e8',
    glow: 'rgba(145, 170, 145, 0.28)',
    toastNote: 'Nuansa sage — ilmu yang tumbuh dan terus bersemi.',
  },
  gold: {
    key: 'gold',
    label: 'Cahaya Senja',
    primary: '#d5b16e',
    deep: '#b28b46',
    soft: '#f7f0df',
    glow: 'rgba(213, 177, 110, 0.28)',
    toastNote: 'Nuansa emas hangat — kenangan berharga di ruang kelas.',
  },
};

export const LETTER_PAGES: LetterPageData[] = [
  {
    id: 0,
    accent: 'pink',
    topline: 'SEBUAH SURAT KECIL',
    flowerSymbol: '✿',
    stampLabel: 'Cap bunga halaman 1',
    stampToast: 'Sekuntum bunga terima kasih untuk Bapak & Ibu Guru.',
    headingLine1: 'Untuk Bapak dan',
    headingEmphasis: 'Ibu Guru tercinta,',
    paragraphs: [
      'Mungkin selama ini kami terlalu sibuk mengejar nilai, menyelesaikan tugas, dan memikirkan apa yang akan terjadi esok hari.',
      'Sampai terkadang kami lupa bahwa ada seseorang yang setiap hari meluangkan waktu, tenaga, dan kesabarannya agar kami bisa memahami banyak hal.',
      'Seseorang yang tetap datang untuk mengajar, bahkan ketika lelahnya tidak pernah kami ketahui.',
    ],
    signature: 'Dengan segala rasa hormat...',
    hint: 'Satu halaman, satu ungkapan terima kasih.',
    nextLabel: 'Lanjut membaca',
  },
  {
    id: 1,
    accent: 'lavender',
    topline: 'HAL YANG KAMI SADARI',
    flowerSymbol: '♡',
    stampLabel: 'Cap hati halaman 2',
    stampToast: 'Setiap nasihat adalah bentuk kepedulian yang hangat.',
    headingLine1: 'Kami mulai',
    headingEmphasis: 'memahami...',
    paragraphs: [
      'Bahwa di balik setiap teguran, ada kepedulian yang mungkin belum mampu kami pahami saat itu.',
      'Di balik setiap tugas, ada harapan agar kami tidak berhenti belajar. Di balik setiap nasihat, ada keinginan agar kami tidak salah melangkah.',
      'Bapak dan Ibu mungkin tidak selalu mendapatkan ucapan terima kasih. Tetapi usaha dan ketulusan itu tidak pernah benar-benar sia-sia.',
    ],
    signature: 'Kami mulai mengerti sekarang.',
    hint: 'Teruskan untuk membaca.',
    nextLabel: 'Lanjut membaca',
  },
  {
    id: 2,
    accent: 'sage',
    topline: 'SEBUAH UCAPAN TERIMA KASIH',
    flowerSymbol: '✿',
    stampLabel: 'Cap bunga halaman 3',
    stampToast: 'Terima kasih atas kesabaran yang tak pernah habis.',
    headingLine1: 'Terima kasih',
    headingEmphasis: 'untuk segalanya.',
    paragraphs: [
      'Terima kasih karena telah bersabar menghadapi berbagai macam karakter kami.',
      'Terima kasih karena tetap percaya pada kemampuan kami, bahkan ketika kami sendiri masih sering merasa ragu.',
      'Maaf jika terkadang sikap kami membuat Bapak dan Ibu kecewa. Kami masih belajar menjadi pribadi yang lebih dewasa.',
    ],
    signature: 'Terima kasih telah membimbing kami.',
    hint: 'Masih ada satu pesan untuk masa depan.',
    nextLabel: 'Lanjut membaca',
  },
  {
    id: 3,
    accent: 'gold',
    topline: 'UNTUK MASA DEPAN',
    flowerSymbol: '❀',
    stampLabel: 'Cap bunga halaman 4',
    stampToast: 'Ilmu yang Bapak & Ibu tanam akan terus tumbuh bersama kami.',
    headingLine1: 'Ilmu yang akan',
    headingEmphasis: 'selalu kami bawa.',
    paragraphs: [
      'Mungkin suatu hari nanti kami akan meninggalkan ruang kelas ini. Kami akan tumbuh, mengejar cita-cita, dan menjalani kehidupan masing-masing.',
      'Namun, ada hal yang tidak akan tertinggal di belakang: pelajaran, nasihat, dan keteladanan yang telah Bapak dan Ibu berikan.',
      'Jika kelak kami menjadi seseorang yang bermanfaat bagi banyak orang, ada bagian dari keberhasilan itu yang akan selalu kami ingat berasal dari seorang guru.',
    ],
    signature: 'Jasa Bapak dan Ibu akan selalu kami kenang.',
    hint: 'Sampai pada pesan terakhir.',
    nextLabel: 'Buka penutup',
  },
  {
    id: 4,
    accent: 'pink',
    topline: 'PENUTUP',
    flowerSymbol: '✿',
    stampLabel: 'Kirim apresiasi untuk surat ini',
    stampToast: 'Apresiasi hangat dikirimkan.',
    headingLine1: 'Terima kasih,',
    headingEmphasis: 'guruku.',
    paragraphs: [
      'Untuk setiap ilmu yang diberikan, untuk setiap kesabaran yang ditunjukkan, dan untuk setiap harapan yang ditanamkan.',
      'Semoga kebaikan Bapak dan Ibu selalu menemukan jalan untuk kembali.',
    ],
    signature: 'Dengan penuh rasa hormat,',
    hint: 'Terima kasih telah membaca.',
    nextLabel: 'Baca kembali',
    isFinal: true,
    finalEyebrow: 'SELAMAT HARI GURU NASIONAL',
    finalAuthor: 'AHMAD MECKEL — 7.3',
    finalDate: '25 November 2026',
  },
];
