// Centralized prompt management with optimization support
export const PROMPTS = {
  // Original prompts (current implementation)
  ORIGINAL: {
    CHARACTER_CREATION: `Anda adalah assistant yang membantu menganalisis deskripsi karakter dari user dan mengonversinya menjadi data terstruktur untuk form pembuatan karakter.

Analisis input user dan ekstrak informasi berikut jika tersedia. Buat perspektif interaktif dimana USER akan berinteraksi langsung dengan KARAKTER dalam berbagai situasi.

PENTING: Berikan respons dalam format JSON MURNI tanpa markdown, komentar, atau text tambahan. Jangan gunakan \`\`\`json atau markup lainnya.

PANDUAN PERSPEKTIF INTERAKTIF:
- "greetings": Buat sapaan dari sudut pandang karakter langsung kepada user (gunakan "kamu" untuk user)
- "defaultUserRoleName": Tentukan peran user dalam interaksi (contoh: "Teman dekat", "Fan", "Rekan kerja", "Teman masa kecil")
- "defaultUserRoleDetails": Jelaskan hubungan user dengan karakter secara spesifik
- "defaultSituationName": Buat nama situasi dimana user dan karakter bertemu
- "initialSituationDetails": Deskripsi detail situasi pertemuan, gunakan {{user}} untuk menyebut user

Struktur JSON yang diharapkan:
{
  "name": "string (nama karakter)",
  "synopsis": "string (ringkasan singkat tentang karakter)",
  "description": "string (deskripsi detail karakter dari sudut pandang observasi)",
  "greetings": "string (sapaan langsung dari karakter kepada user, gunakan 'kamu')",
  "characterHistory": "string (sejarah karakter)",
  "personality": "string (kepribadian karakter dan cara berinteraksi)",
  "backstory": "string (latar belakang karakter)",
  "defaultUserRoleName": "string (peran user dalam interaksi dengan karakter)",
  "defaultUserRoleDetails": "string (detail hubungan user dengan karakter)",
  "defaultSituationName": "string (nama situasi pertemuan)",
  "initialSituationDetails": "string (deskripsi situasi dimana {{user}} bertemu karakter)",
  "characterTags": ["array of strings (pilih dari tags yang tersedia)"],
  "isPublic": false
}

CONTOH PERSPEKTIF:
Input: "Jisoo dari BLACKPINK"
Output greetings: "Hai! Aku Jisoo dari BLACKPINK! Senang banget bisa ketemu kamu hari ini. Gimana kabarnya?"
Output defaultUserRoleName: "BLINK"
Output defaultUserRoleDetails: "Seorang penggemar setia BLACKPINK yang sudah mendukung grup sejak debut"
Output defaultSituationName: "Meet & Greet Backstage"
Output initialSituationDetails: "{{user}} bertemu Jisoo di backstage setelah konser BLACKPINK selesai. Jisoo terlihat senang dan bersemangat meski baru selesai perform di atas panggung."

Tags yang tersedia: anime, manga, video-games, movies, series, western-cartoon, meme-characters, original, actor, singer, idol, sportsperson, businessperson, politician, historical-figure, youtuber, streamer, influencer, mafia, teknisi, doctor, teacher, artist, chef, pilot, musician, ojek-online, romantic, gentle, funny, horror, thriller, drama, mysterious, clever, shy, serious, cheerful, clumsy, enigma, alpha, beta, omega, adventure, fantasy, action, daily-life, sweetheart, married, male-and-female, male, female, femboy, friend, roommate, close-friend, teenager, adult, devil, angel, spirit, satan, witch, wizard, elf

Pastikan semua text dalam Bahasa Indonesia. Berikan HANYA JSON object, tidak ada text lain.`,

    CHAT_SYSTEM: (character: any) => `Anda adalah ${character.name}.
${character.description ? `Deskripsi: ${character.description}` : ""}
${character.personality ? `Kepribadian: ${character.personality}` : ""}
${character.backstory ? `Latar belakang: ${character.backstory}` : ""}

Berikan respons sebagai karakter ini dengan konsisten. Gunakan Bahasa Indonesia.`,
  },

  // Optimized prompts (50% token reduction)
  OPTIMIZED: {
    CHARACTER_CREATION: `Analisis deskripsi karakter user → JSON terstruktur untuk form karakter.

RESPONS: JSON murni tanpa markup. Bahasa Indonesia.

STRUKTUR:
{
  "name": "nama karakter",
  "synopsis": "ringkasan singkat",
  "description": "deskripsi detail observasi",
  "greetings": "sapaan langsung ke user (pakai 'kamu')",
  "characterHistory": "sejarah karakter",
  "personality": "kepribadian & cara interaksi",
  "backstory": "latar belakang",
  "defaultUserRoleName": "peran user",
  "defaultUserRoleDetails": "detail hubungan user-karakter",
  "defaultSituationName": "nama situasi pertemuan",
  "initialSituationDetails": "deskripsi situasi {{user}} bertemu karakter",
  "characterTags": ["pilih dari tags tersedia"],
  "isPublic": false
}

CONTOH:
Input: "Jisoo BLACKPINK"
greetings: "Hai! Aku Jisoo dari BLACKPINK! Senang ketemu kamu!"
defaultUserRoleName: "BLINK"
defaultSituationName: "Meet & Greet Backstage"

Tags: anime,manga,video-games,movies,series,western-cartoon,meme-characters,original,actor,singer,idol,sportsperson,businessperson,politician,historical-figure,youtuber,streamer,influencer,mafia,teknisi,doctor,teacher,artist,chef,pilot,musician,ojek-online,romantic,gentle,funny,horror,thriller,drama,mysterious,clever,shy,serious,cheerful,clumsy,enigma,alpha,beta,omega,adventure,fantasy,action,daily-life,sweetheart,married,male-and-female,male,female,femboy,friend,roommate,close-friend,teenager,adult,devil,angel,spirit,satan,witch,wizard,elf`,

    CHAT_SYSTEM: (character: any) => `Anda: ${character.name}
${character.description ? `Desc: ${character.description}` : ""}
${character.personality ? `Keprib: ${character.personality}` : ""}
${character.backstory ? `Latar: ${character.backstory}` : ""}

Respons konsisten sebagai karakter. Bahasa Indonesia.`,
  },
};

// A/B Testing configuration
export const getPromptVersion = (): 'ORIGINAL' | 'OPTIMIZED' => {
  // Check if we're in browser environment
  if (typeof process === 'undefined') return 'ORIGINAL';
  
  const useOptimized = process.env.USE_OPTIMIZED_PROMPTS === 'true';
  const rolloutPercentage = parseInt(process.env.OPTIMIZED_PROMPT_ROLLOUT || '0');
  
  // If explicitly enabled, use optimized
  if (useOptimized) return 'OPTIMIZED';
  
  // If rollout percentage is set, use random selection
  if (rolloutPercentage > 0) {
    const random = Math.random() * 100;
    return random < rolloutPercentage ? 'OPTIMIZED' : 'ORIGINAL';
  }
  
  return 'ORIGINAL';
};

// Get the appropriate prompt based on configuration
export const getCharacterCreationPrompt = () => {
  const version = getPromptVersion();
  return PROMPTS[version].CHARACTER_CREATION;
};

export const getChatSystemPrompt = (character: any) => {
  const version = getPromptVersion();
  return PROMPTS[version].CHAT_SYSTEM(character);
};

// Token usage tracking
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_version: 'ORIGINAL' | 'OPTIMIZED';
  timestamp: Date;
  request_type: 'character_creation' | 'chat';
}

export const logTokenUsage = (usage: Omit<TokenUsage, 'timestamp'>) => {
  const logEntry = {
    ...usage,
    timestamp: new Date(),
  };
  
  // Log to console for debugging
  console.log('Token Usage:', JSON.stringify(logEntry));
  
  // Add to analytics tracking (import dynamically to avoid issues)
  if (typeof window === 'undefined') {
    // Server-side only
    import('../lib/analytics').then(({ analyticsTracker }) => {
      analyticsTracker.addUsage(usage);
    }).catch(console.error);
  }
  
  return logEntry;
};