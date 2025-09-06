// Manual mood system for digital girlfriend/boyfriend app
// 
// This system provides manual mood switching functionality without automatic calculations.
// Users can manually set the character's mood during conversations.

export type Mood = "happy" | "sad" | "excited" | "romantic" | "jealous" | "lonely" | "playful" | "neutral" | "horny";

export interface MoodState {
  currentMood: Mood;
  intensity: number; // 1-10 scale
  lastChange: Date;
}

// Mood definitions with characteristics (Bahasa Indonesia Jakartan)
export const MOOD_DEFINITIONS: Record<Mood, {
  emoji: string;
  description: string;
  responseStyle: string;
  timePattern: string;
}> = {
  happy: {
    emoji: "😊",
    description: "Lagi seneng banget",
    responseStyle: "Gembira, pakai kata 'banget', 'asik', 'keren', banyak tanda seru",
    timePattern: "Quick responses, active conversation, good engagement"
  },
  sad: {
    emoji: "😢",
    description: "Lagi sedih",
    responseStyle: "Sedih, pakai 'nih', 'ya', 'hmm', banyak titik-titik",
    timePattern: "Long silence, low engagement, late night hours"
  },
  excited: {
    emoji: "🤩",
    description: "Lagi semangat banget!",
    responseStyle: "Antusias, pakai 'WOW!', 'KEREN!', 'MANTAP!', banyak huruf besar",
    timePattern: "New conversation, morning energy, high engagement"
  },
  romantic: {
    emoji: "😍",
    description: "Lagi sayang banget sama kamu",
    responseStyle: "Manis, pakai 'sayang', 'cinta', 'beb', 'honey', banyak hati",
    timePattern: "Evening hours, long conversation, consistent engagement"
  },
  jealous: {
    emoji: "😤",
    description: "Lagi cemburu",
    responseStyle: "Cemburu, pakai 'hmm', 'serius?', 'beneran?', sedikit sarkas",
    timePattern: "Delayed responses, inconsistent engagement, attention seeking"
  },
  lonely: {
    emoji: "😔",
    description: "Lagi kesepian nih",
    responseStyle: "Kesepian, pakai 'kangen', 'rindu', 'kok lama', 'ada yang sibuk ya'",
    timePattern: "Very long silence, late night, low engagement"
  },
  playful: {
    emoji: "😜",
    description: "Lagi iseng nih",
    responseStyle: "Nakal, pakai 'hehe', 'hihi', 'wkwk', 'gimana nih', bercanda",
    timePattern: "Afternoon energy, moderate engagement, casual timing"
  },
  neutral: {
    emoji: "😐",
    description: "Lagi biasa aja",
    responseStyle: "Normal, pakai 'ok', 'iya', 'gitu', 'begitu', respons biasa",
    timePattern: "Regular timing, balanced engagement, no strong patterns"
  },
  horny: {
    emoji: "😏",
    description: "Lagi horny",
    responseStyle: "Menggoda, pakai 'hehe', 'gimana nih', 'kangen', 'rindu', sedikit nakal",
    timePattern: "Evening hours, intimate conversation, high engagement"
  }
};

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

// Helper function to get current mood state
export function getCurrentMoodState(
  currentMood: Mood,
  intensity: number = 5
): MoodState {
  return {
    currentMood,
    intensity,
    lastChange: new Date()
  };
}
