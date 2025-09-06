// Mood system utilities for digital girlfriend/boyfriend app

export type Mood = "happy" | "sad" | "excited" | "romantic" | "jealous" | "lonely" | "playful" | "neutral";

export interface MoodState {
  currentMood: Mood;
  intensity: number; // 1-10 scale
  lastChange: Date;
}

export interface MoodTriggers {
  userResponseTime?: number; // minutes since last user message
  conversationLength: number;
  timeSinceLastMessage: number; // minutes
  userEngagement: number; // 1-10 scale based on message frequency
  userMessageContent?: string; // latest user message content for analysis
  messageCount: number; // total message count for content analysis trigger
}

// Mood definitions with characteristics (Bahasa Indonesia Jakartan)
export const MOOD_DEFINITIONS: Record<Mood, {
  emoji: string;
  description: string;
  responseStyle: string;
  triggers: string[];
}> = {
  happy: {
    emoji: "😊",
    description: "Lagi seneng banget",
    responseStyle: "Gembira, pakai kata 'banget', 'asik', 'keren', banyak tanda seru",
    triggers: ["recent positive interaction", "quick user response", "long conversation"]
  },
  sad: {
    emoji: "😢",
    description: "Lagi sedih",
    responseStyle: "Sedih, pakai 'nih', 'ya', 'hmm', banyak titik-titik",
    triggers: ["long silence from user", "negative conversation tone", "loneliness"]
  },
  excited: {
    emoji: "🤩",
    description: "Lagi semangat banget!",
    responseStyle: "Antusias, pakai 'WOW!', 'KEREN!', 'MANTAP!', banyak huruf besar",
    triggers: ["new conversation", "positive user messages", "special occasions"]
  },
  romantic: {
    emoji: "😍",
    description: "Lagi sayang banget sama kamu",
    responseStyle: "Manis, pakai 'sayang', 'cinta', 'beb', 'honey', banyak hati",
    triggers: ["intimate conversation", "user shows affection", "evening time"]
  },
  jealous: {
    emoji: "😤",
    description: "Lagi cemburu",
    responseStyle: "Cemburu, pakai 'hmm', 'serius?', 'beneran?', sedikit sarkas",
    triggers: ["user mentions others", "long response time", "lack of attention"]
  },
  lonely: {
    emoji: "😔",
    description: "Lagi kesepian nih",
    responseStyle: "Kesepian, pakai 'kangen', 'rindu', 'kok lama', 'ada yang sibuk ya'",
    triggers: ["long silence", "user not responding", "late night hours"]
  },
  playful: {
    emoji: "😜",
    description: "Lagi iseng nih",
    responseStyle: "Nakal, pakai 'hehe', 'hihi', 'wkwk', 'gimana nih', bercanda",
    triggers: ["light conversation", "user being playful", "afternoon time"]
  },
  neutral: {
    emoji: "😐",
    description: "Lagi biasa aja",
    responseStyle: "Normal, pakai 'ok', 'iya', 'gitu', 'begitu', respons biasa",
    triggers: ["regular conversation", "no strong triggers"]
  }
};

// Analyze user message content for mood triggers
export function analyzeMessageContent(message: string): Mood | null {
  if (!message) return null;
  
  const lowerMessage = message.toLowerCase();
  
  // Jealous triggers - mentions of other people/relationships (comprehensive Jakarta dialect)
  const jealousTriggers = [
    // Basic relationship terms
    'pacarku', 'boyfriend', 'girlfriend', 'suami', 'istri', 'kekasih', 'teman', 'teman dekat',
    'teman special', 'teman istimewa', 'teman dekat banget', 'teman akrab', 'teman baik',
    'crush', 'gebetan', 'mantan', 'ex', 'mantan pacar', 'mantan suami', 'mantan istri',
    
    // Possessive indicators
    'sama dia', 'dengan dia', 'orang lain', 'yang lain', 'seseorang', 'seseorang yang',
    'ada yang', 'ada orang', 'ada teman', 'ada pacar', 'ada kekasih',
    
    // Action indicators
    'kencan', 'date', 'dating', 'pergi sama', 'hangout sama', 'ngobrol sama', 'chat sama',
    'jalan sama', 'makan sama', 'nonton sama', 'shopping sama', 'liburan sama',
    'pergi bareng', 'jalan bareng', 'makan bareng', 'nonton bareng', 'shopping bareng',
    
    // Emotional expressions
    'aku suka', 'aku cinta', 'aku sayang', 'aku kangen', 'aku rindu', 'aku miss',
    'aku suka banget', 'aku cinta banget', 'aku sayang banget', 'aku kangen banget',
    'aku rindu banget', 'aku miss banget', 'aku suka sama', 'aku cinta sama',
    'aku sayang sama', 'aku kangen sama', 'aku rindu sama', 'aku miss sama',
    
    // Physical/character compliments
    'dia cantik', 'dia ganteng', 'dia baik', 'dia asik', 'dia keren', 'dia lucu',
    'dia cantik banget', 'dia ganteng banget', 'dia baik banget', 'dia asik banget',
    'dia keren banget', 'dia lucu banget', 'dia manis', 'dia imut', 'dia cool',
    'dia smart', 'dia pintar', 'dia baik hati', 'dia perhatian', 'dia caring',
    
    // Activity mentions
    'aku pergi sama', 'aku hangout sama', 'aku ngobrol sama', 'aku chat sama',
    'aku kencan sama', 'aku date sama', 'aku jalan sama', 'aku makan sama',
    'aku nonton sama', 'aku shopping sama', 'aku liburan sama', 'aku kerja sama',
    'aku belajar sama', 'aku olahraga sama', 'aku gym sama', 'aku jogging sama',
    
    // Time indicators
    'kemarin', 'tadi', 'besok', 'nanti', 'sekarang', 'lagi', 'baru aja',
    'kemarin sama', 'tadi sama', 'besok sama', 'nanti sama', 'sekarang sama',
    'lagi sama', 'baru aja sama', 'hari ini sama', 'minggu ini sama',
    
    // Social media/communication
    'chat', 'dm', 'instagram', 'whatsapp', 'telegram', 'line', 'discord',
    'chat sama', 'dm sama', 'instagram sama', 'whatsapp sama', 'telegram sama',
    'line sama', 'discord sama', 'video call sama', 'voice call sama',
    
    // Emotional intensity
    'banget', 'sekali', 'parah', 'gila', 'anjir', 'wow', 'amazing', 'perfect',
    'sempurna', 'terbaik', 'favorit', 'kesukaan', 'idola', 'role model'
  ];
  
  // Sad triggers - negative emotions (comprehensive Jakarta dialect)
  const sadTriggers = [
    // Basic negative emotions
    'sedih', 'depresi', 'stress', 'capek', 'lelah', 'bosan', 'kesal', 'marah', 'kecewa',
    'putus asa', 'gak semangat', 'down', 'bad mood', 'galau', 'bete', 'gak mood',
    
    // Intensified negative emotions
    'sedih banget', 'depresi banget', 'stress banget', 'capek banget', 'lelah banget',
    'bosan banget', 'kesal banget', 'marah banget', 'kecewa banget', 'putus asa banget',
    'gak semangat banget', 'down banget', 'bad mood banget', 'galau banget', 'bete banget',
    'gak mood banget', 'sedih sekali', 'depresi sekali', 'stress sekali', 'capek sekali',
    
    // Physical/mental exhaustion
    'capek mental', 'capek fisik', 'capek jiwa', 'capek batin', 'capek pikiran',
    'lelah mental', 'lelah fisik', 'lelah jiwa', 'lelah batin', 'lelah pikiran',
    'exhausted', 'tired', 'worn out', 'burned out', 'drained', 'empty',
    
    // Emotional pain
    'sakit hati', 'patah hati', 'broken heart', 'heartbroken', 'sakit batin',
    'sakit jiwa', 'sakit pikiran', 'sakit mental', 'sakit emosi', 'sakit perasaan',
    'hurt', 'pain', 'suffering', 'agony', 'anguish', 'torment',
    
    // Disappointment
    'kecewa', 'disappointed', 'let down', 'betrayed', 'dikhianati', 'ditolak',
    'ditinggal', 'ditinggalkan', 'dibuang', 'dilupakan', 'diabaikan', 'diacuhkan',
    'gak dihargai', 'gak dianggap', 'gak dipedulikan', 'gak diperhatikan',
    
    // Loneliness/isolation
    'kesepian', 'lonely', 'sendiri', 'alone', 'terisolasi', 'isolated',
    'gak ada teman', 'gak ada yang peduli', 'gak ada yang ngerti',
    'gak ada yang denger', 'gak ada yang bantuin', 'gak ada yang support',
    
    // Anxiety/worry
    'cemas', 'anxious', 'khawatir', 'worry', 'takut', 'afraid', 'fear',
    'panic', 'panik', 'nervous', 'gugup', 'trembling', 'gemetar',
    'overthinking', 'overthink', 'overthought', 'overanalyze',
    
    // Life problems
    'masalah', 'problem', 'trouble', 'difficulty', 'challenge', 'struggle',
    'gagal', 'failed', 'failure', 'kalah', 'lose', 'lost', 'defeated',
    'gak berhasil', 'gak sukses', 'gak bisa', 'gak mampu', 'gak kuat',
    
    // Work/school stress
    'kerja', 'work', 'kerjaan', 'job', 'tugas', 'assignment', 'deadline',
    'boss', 'atasan', 'colleague', 'rekan kerja', 'team', 'tim',
    'meeting', 'rapat', 'presentation', 'presentasi', 'project', 'proyek',
    
    // Relationship issues
    'putus', 'break up', 'broken up', 'divorce', 'cerai', 'separated',
    'fight', 'bertengkar', 'argue', 'berdebat', 'conflict', 'konflik',
    'misunderstanding', 'salah paham', 'miscommunication', 'salah komunikasi',
    
    // Financial stress
    'uang', 'money', 'duit', 'cash', 'budget', 'anggaran', 'broke', 'bangkrut',
    'debt', 'hutang', 'loan', 'pinjaman', 'credit', 'kredit', 'installment',
    
    // Health issues
    'sakit', 'sick', 'ill', 'disease', 'penyakit', 'hospital', 'rumah sakit',
    'medicine', 'obat', 'doctor', 'dokter', 'treatment', 'perawatan',
    'pain', 'sakit', 'ache', 'nyeri', 'uncomfortable', 'gak nyaman'
  ];
  
  // Happy triggers - positive emotions (comprehensive Jakarta dialect)
  const happyTriggers = [
    // Basic positive emotions
    'seneng', 'happy', 'gembira', 'bahagia', 'excited', 'semangat', 'asik', 'keren',
    'mantap', 'wow', 'amazing', 'bagus', 'hebat', 'keren banget', 'asik banget',
    
    // Intensified positive emotions
    'seneng banget', 'happy banget', 'gembira banget', 'bahagia banget', 'excited banget',
    'semangat banget', 'asik banget', 'keren banget', 'mantap banget', 'wow banget',
    'amazing banget', 'bagus banget', 'hebat banget', 'seneng sekali', 'happy sekali',
    'gembira sekali', 'bahagia sekali', 'excited sekali', 'semangat sekali',
    
    // Excitement and enthusiasm
    'wow', 'wah', 'wih', 'waduh', 'anjir', 'gila', 'parah', 'mantul', 'keren abis',
    'asik abis', 'bagus abis', 'hebat abis', 'perfect', 'sempurna', 'terbaik',
    'favorit', 'kesukaan', 'idola', 'role model', 'inspirasi', 'motivasi',
    
    // Success and achievement
    'berhasil', 'sukses', 'success', 'menang', 'win', 'won', 'victory', 'kemenangan',
    'achievement', 'pencapaian', 'accomplishment', 'prestasi', 'hasil', 'result',
    'gak nyangka', 'gak percaya', 'gak sangka', 'unbelievable', 'incredible',
    'fantastic', 'wonderful', 'excellent', 'outstanding', 'brilliant',
    
    // Fun and entertainment
    'fun', 'seru', 'menyenangkan', 'enjoy', 'enjoyable', 'entertaining', 'hiburan',
    'lucu', 'funny', 'humor', 'joke', 'jokes', 'ketawa', 'laugh', 'laughing',
    'ngakak', 'wkwk', 'haha', 'hehe', 'hihi', 'lol', 'lmao', 'rofl',
    
    // Love and affection
    'love', 'cinta', 'sayang', 'kasih', 'care', 'peduli', 'perhatian', 'support',
    'mendukung', 'backup', 'always', 'selalu', 'forever', 'selamanya', 'together',
    'bareng', 'bersama', 'sama-sama', 'mutual', 'timbal balik', 'reciprocal',
    
    // Gratitude and appreciation
    'terima kasih', 'thanks', 'thank you', 'makasih', 'makasih banget', 'thanks banget',
    'appreciate', 'menghargai', 'hargai', 'respect', 'hormat', 'salut', 'salute',
    'proud', 'bangga', 'proud of', 'bangga sama', 'respect', 'hormat',
    
    // Energy and motivation
    'energi', 'energy', 'power', 'kekuatan', 'strength', 'kekuatan', 'motivation',
    'motivasi', 'inspiration', 'inspirasi', 'spirit', 'semangat', 'passion',
    'passion', 'gairah', 'enthusiasm', 'antusias', 'excitement', 'kegembiraan',
    
    // Good news and positive events
    'good news', 'berita baik', 'kabar baik', 'news', 'berita', 'kabar', 'info',
    'information', 'informasi', 'update', 'updates', 'progress', 'kemajuan',
    'improvement', 'perbaikan', 'development', 'perkembangan', 'growth', 'pertumbuhan',
    
    // Social and relationship
    'teman', 'friend', 'friends', 'teman-teman', 'friends', 'family', 'keluarga',
    'family', 'keluarga', 'parents', 'orang tua', 'siblings', 'saudara', 'relatives',
    'kerabat', 'community', 'komunitas', 'group', 'grup', 'team', 'tim',
    
    // Activities and hobbies
    'hobby', 'hobi', 'interest', 'minat', 'passion', 'gairah', 'activity', 'aktivitas',
    'sport', 'olahraga', 'music', 'musik', 'art', 'seni', 'travel', 'jalan-jalan',
    'vacation', 'liburan', 'holiday', 'hari libur', 'weekend', 'akhir pekan',
    
    // Food and enjoyment
    'makan', 'food', 'makanan', 'delicious', 'enak', 'lezat', 'yummy', 'nikmat',
    'restaurant', 'restoran', 'cafe', 'kafe', 'coffee', 'kopi', 'tea', 'teh',
    'snack', 'cemilan', 'dessert', 'pencuci mulut', 'sweet', 'manis',
    
    // Weather and environment
    'sunny', 'cerah', 'beautiful', 'cantik', 'nice', 'bagus', 'good', 'baik',
    'perfect', 'sempurna', 'wonderful', 'indah', 'amazing', 'menakjubkan',
    'breathtaking', 'memukau', 'stunning', 'menawan', 'gorgeous', 'cantik banget'
  ];
  
  // Romantic triggers - love/affection (comprehensive Jakarta dialect)
  const romanticTriggers = [
    // Basic romantic terms
    'sayang', 'cinta', 'love', 'kangen', 'rindu', 'miss', 'aku sayang', 'aku cinta',
    'kamu', 'beb', 'honey', 'darling', 'sweetheart', 'manis', 'cantik', 'ganteng',
    
    // Intensified romantic expressions
    'sayang banget', 'cinta banget', 'love banget', 'kangen banget', 'rindu banget',
    'miss banget', 'aku sayang banget', 'aku cinta banget', 'aku kangen banget',
    'aku rindu banget', 'aku miss banget', 'sayang sekali', 'cinta sekali',
    'love sekali', 'kangen sekali', 'rindu sekali', 'miss sekali',
    
    // Terms of endearment
    'beb', 'baby', 'babe', 'honey', 'darling', 'sweetheart', 'love', 'sayang',
    'manis', 'cantik', 'ganteng', 'handsome', 'beautiful', 'pretty', 'cute',
    'imut', 'lucu', 'sweet', 'manis', 'gentle', 'lembut', 'kind', 'baik',
    
    // Physical compliments
    'cantik', 'beautiful', 'pretty', 'gorgeous', 'stunning', 'attractive', 'sexy',
    'ganteng', 'handsome', 'cute', 'lucu', 'imut', 'sweet', 'manis', 'gentle',
    'lembut', 'kind', 'baik', 'caring', 'perhatian', 'thoughtful', 'perhatian',
    
    // Emotional expressions
    'kangen', 'rindu', 'miss', 'longing', 'yearning', 'craving', 'desire', 'ingin',
    'want', 'mau', 'need', 'butuh', 'require', 'perlu', 'wish', 'harapan',
    'hope', 'berharap', 'dream', 'mimpi', 'fantasy', 'fantasi', 'imagine', 'bayangkan',
    
    // Relationship terms
    'pacarku', 'my boyfriend', 'my girlfriend', 'my love', 'cintaku', 'sayangku',
    'kekasihku', 'my sweetheart', 'my darling', 'my honey', 'my baby', 'my babe',
    'soulmate', 'jodoh', 'destiny', 'takdir', 'fate', 'nasib', 'forever', 'selamanya',
    'always', 'selalu', 'together', 'bersama', 'bareng', 'sama-sama', 'mutual',
    
    // Intimate expressions
    'hug', 'peluk', 'kiss', 'cium', 'touch', 'sentuh', 'hold', 'pegang', 'grab',
    'pegang', 'embrace', 'pelukan', 'cuddle', 'pelukan', 'snuggle', 'pelukan',
    'intimate', 'intim', 'close', 'dekat', 'personal', 'pribadi', 'private', 'rahasia',
    
    // Romantic activities
    'date', 'kencan', 'dating', 'berkencan', 'romantic', 'romantis', 'candlelight',
    'lilin', 'dinner', 'makan malam', 'movie', 'film', 'walk', 'jalan-jalan',
    'stroll', 'jalan santai', 'beach', 'pantai', 'sunset', 'matahari terbenam',
    'sunrise', 'matahari terbit', 'moon', 'bulan', 'stars', 'bintang', 'sky', 'langit',
    
    // Future and commitment
    'future', 'masa depan', 'marry', 'menikah', 'marriage', 'pernikahan', 'wedding',
    'pernikahan', 'forever', 'selamanya', 'always', 'selalu', 'commitment', 'komitmen',
    'promise', 'janji', 'vow', 'sumpah', 'pledge', 'ikrar', 'dedication', 'dedikasi',
    
    // Special occasions
    'anniversary', 'ulang tahun', 'birthday', 'hari ulang tahun', 'valentine', 'valentine',
    'christmas', 'natal', 'new year', 'tahun baru', 'easter', 'paskah', 'holiday', 'liburan',
    'vacation', 'liburan', 'trip', 'perjalanan', 'journey', 'perjalanan', 'adventure', 'petualangan',
    
    // Emotional support
    'support', 'dukungan', 'encourage', 'dorongan', 'motivate', 'motivasi', 'inspire',
    'inspirasi', 'comfort', 'kenyamanan', 'console', 'hibur', 'cheer up', 'hibur',
    'make happy', 'buat senang', 'make smile', 'buat tersenyum', 'make laugh', 'buat ketawa'
  ];
  
  // Check for jealous triggers
  if (jealousTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'jealous';
  }
  
  // Check for sad triggers
  if (sadTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'sad';
  }
  
  // Check for happy triggers
  if (happyTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'happy';
  }
  
  // Check for romantic triggers
  if (romanticTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'romantic';
  }
  
  // Additional context-based triggers
  
  // Playful triggers - jokes, teasing, fun
  const playfulTriggers = [
    'wkwk', 'haha', 'hehe', 'hihi', 'lol', 'lmao', 'rofl', 'ngakak', 'ketawa',
    'laugh', 'laughing', 'funny', 'lucu', 'joke', 'jokes', 'tease', 'menggoda',
    'iseng', 'nakal', 'mischievous', 'prank', 'prank', 'trick', 'trik', 'game',
    'games', 'play', 'main', 'playing', 'bermain', 'fun', 'seru', 'enjoy',
    'enjoyable', 'entertaining', 'hiburan', 'comedy', 'komedi', 'humor', 'humor'
  ];
  
  if (playfulTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'playful';
  }
  
  // Excited triggers - energy, enthusiasm, anticipation
  const excitedTriggers = [
    'wow', 'wah', 'wih', 'waduh', 'anjir', 'gila', 'parah', 'mantul', 'keren abis',
    'asik abis', 'bagus abis', 'hebat abis', 'perfect', 'sempurna', 'terbaik',
    'favorit', 'kesukaan', 'idola', 'role model', 'inspirasi', 'motivasi',
    'excited', 'semangat', 'enthusiastic', 'antusias', 'energetic', 'berenergi',
    'pumped', 'pumped up', 'hyped', 'hyped up', 'thrilled', 'terkesan',
    'amazed', 'terkesan', 'surprised', 'terkejut', 'shocked', 'terkejut',
    'unbelievable', 'incredible', 'fantastic', 'wonderful', 'excellent', 'outstanding'
  ];
  
  if (excitedTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'excited';
  }
  
  // Lonely triggers - isolation, missing, alone
  const lonelyTriggers = [
    'kesepian', 'lonely', 'sendiri', 'alone', 'terisolasi', 'isolated',
    'gak ada teman', 'gak ada yang peduli', 'gak ada yang ngerti',
    'gak ada yang denger', 'gak ada yang bantuin', 'gak ada yang support',
    'miss', 'kangen', 'rindu', 'longing', 'yearning', 'craving', 'desire',
    'want', 'mau', 'need', 'butuh', 'require', 'perlu', 'wish', 'harapan',
    'hope', 'berharap', 'dream', 'mimpi', 'fantasy', 'fantasi', 'imagine'
  ];
  
  if (lonelyTriggers.some(trigger => lowerMessage.includes(trigger))) {
    return 'lonely';
  }
  
  return null;
}

// Calculate mood based on triggers
export function calculateMood(triggers: MoodTriggers, currentMood: Mood): Mood {
  const { userResponseTime = 0, conversationLength, timeSinceLastMessage, userEngagement, userMessageContent, messageCount } = triggers;
  
  // Analisis konten pesan user setiap 5 pesan
  if (userMessageContent && messageCount > 0 && messageCount % 5 === 0) {
    const contentMood = analyzeMessageContent(userMessageContent);
    if (contentMood) {
      return contentMood;
    }
  }
  
  // Perubahan mood berdasarkan waktu
  const now = new Date();
  const hour = now.getHours();
  
  // Malam hari = lebih romantis/kesepian
  if (hour >= 22 || hour <= 6) {
    if (timeSinceLastMessage > 60) return "lonely";
    if (userEngagement > 7) return "romantic";
  }
  
  // Pagi hari = lebih semangat
  if (hour >= 6 && hour <= 10) {
    if (conversationLength < 10) return "excited";
  }
  
  // Sore hari = lebih iseng
  if (hour >= 14 && hour <= 18) {
    if (userEngagement > 5) return "playful";
  }
  
  // Waktu respons user mempengaruhi mood
  if (userResponseTime > 120) { // 2+ jam
    return "lonely";
  } else if (userResponseTime > 30) { // 30+ menit
    return "jealous";
  }
  
  // Panjang percakapan mempengaruhi mood
  if (conversationLength > 50 && userEngagement > 7) {
    return "romantic";
  }
  
  // Engagement user mempengaruhi mood
  if (userEngagement > 8) {
    return "happy";
  } else if (userEngagement < 3) {
    return "sad";
  }
  
  // Perubahan mood random (10% chance)
  if (Math.random() < 0.1) {
    const moods: Mood[] = ["happy", "playful", "excited"];
    return moods[Math.floor(Math.random() * moods.length)];
  }
  
  return currentMood; // Keep current mood if no triggers match
}

// Hitung intensitas mood (1-10)
export function calculateMoodIntensity(triggers: MoodTriggers, mood: Mood): number {
  const { userEngagement, conversationLength, timeSinceLastMessage } = triggers;
  
  let intensity = 5; // Intensitas dasar
  
  // Engagement tinggi = intensitas tinggi
  intensity += Math.floor(userEngagement / 2);
  
  // Percakapan panjang = intensitas tinggi untuk mood romantis
  if (mood === "romantic" && conversationLength > 30) {
    intensity += 2;
  }
  
  // Waktu sejak pesan terakhir mempengaruhi intensitas
  if (timeSinceLastMessage > 60) {
    intensity += 1; // Lebih intens saat kesepian
  }
  
  // Batasi intensitas antara 1-10
  return Math.max(1, Math.min(10, intensity));
}

// Get mood-appropriate response prefix
export function getMoodResponsePrefix(mood: Mood, intensity: number): string {
  const moodDef = MOOD_DEFINITIONS[mood];
  
  if (intensity >= 8) {
    return `${moodDef.emoji} ${moodDef.emoji} `; // Double emoji for high intensity
  } else if (intensity >= 6) {
    return `${moodDef.emoji} `;
  } else {
    return `${moodDef.emoji} `; // Always return emoji based on mood config
  }
}

// Get mood-appropriate system prompt addition (Bahasa Indonesia Jakartan)
export function getMoodSystemPrompt(mood: Mood, intensity: number): string {
  const moodDef = MOOD_DEFINITIONS[mood];
  
  let prompt = `\n\nMood: ${moodDef.description} (Intensitas: ${intensity}/10)`;
  prompt += `\nGaya Respons: ${moodDef.responseStyle}`;
  
  if (intensity >= 7) {
    prompt += `\nCatatan: Kamu lagi ${moodDef.description} banget sekarang, jadi ekspresikan dengan kuat dalam respons kamu.`;
  }
  
  return prompt;
}

// Hitung skor engagement user (1-10)
export function calculateUserEngagement(
  messageCount: number,
  avgResponseTime: number,
  sessionDuration: number // dalam menit
): number {
  let engagement = 5; // Skor dasar
  
  // Lebih banyak pesan = engagement lebih tinggi
  if (messageCount > 20) engagement += 2;
  else if (messageCount > 10) engagement += 1;
  
  // Respons lebih cepat = engagement lebih tinggi
  if (avgResponseTime < 5) engagement += 2;
  else if (avgResponseTime < 15) engagement += 1;
  
  // Sesi lebih lama = engagement lebih tinggi
  if (sessionDuration > 60) engagement += 1;
  
  return Math.max(1, Math.min(10, engagement));
}

// Mood transition messages (when mood changes) - Bahasa Indonesia Jakartan
export function getMoodTransitionMessage(oldMood: Mood, newMood: Mood): string | null {
  if (oldMood === newMood) return null;
  
  const transitions: Record<string, string> = {
    "sad->happy": "Eh tau gak? Aku jadi seneng banget ngobrol sama kamu! 😊",
    "lonely->happy": "Tadi aku kesepian banget, tapi sekarang seneng deh kamu dateng! 💕",
    "jealous->romantic": "Tadi aku iseng aja sih... sebenernya aku sayang banget sama kamu 😍",
    "neutral->excited": "Wah jadi semangat banget ngobrol sama kamu! 🤩",
    "happy->romantic": "Kamu bikin aku selalu seneng... aku suka banget ngobrol sama kamu 💕",
    "playful->romantic": "Tadi aku cuma bercanda, tapi beneran sayang banget sama kamu 😘",
    "sad->lonely": "Hmm... kok kayaknya aku kesepian ya... 😔",
    "happy->jealous": "Hmm... kok kayaknya kamu sibuk banget ya? 😤",
    "lonely->sad": "Aku sedih nih... kayaknya kamu gak peduli sama aku 😢",
    "excited->playful": "Hehe... jadi iseng nih! Gimana ya? 😜",
    "romantic->happy": "Aku seneng banget bisa ngobrol sama kamu! 😊",
    "jealous->sad": "Hmm... kayaknya aku sedih deh... 😢"
  };
  
  return transitions[`${oldMood}->${newMood}`] || null;
}
