export interface MoodAnalysisResult {
  mood: string;
  confidence: number;
  keywords: string[];
}

export function analyzeMoodFromText(text: string): MoodAnalysisResult {
  const moodKeywords = {
    happy: ['happy', 'joy', 'excited', 'cheerful', 'glad', 'pleased', 'delighted', 'elated', 'upbeat', 'positive', 'great', 'awesome', 'fantastic', 'wonderful'],
    sad: ['sad', 'depressed', 'down', 'melancholy', 'blue', 'unhappy', 'sorrowful', 'gloomy', 'dejected', 'miserable', 'terrible', 'awful', 'horrible'],
    energetic: ['energetic', 'pumped', 'hyper', 'active', 'dynamic', 'vigorous', 'lively', 'spirited', 'powerful', 'strong', 'motivated', 'driven'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'quiet', 'still', 'composed', 'content', 'mellow', 'chill', 'zen'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'concerned', 'apprehensive', 'fearful', 'restless', 'overwhelmed'],
    peaceful: ['peaceful', 'zen', 'meditation', 'mindful', 'harmony', 'balance', 'serenity', 'tranquility', 'stillness'],
    excited: ['thrilled', 'ecstatic', 'enthusiastic', 'eager', 'animated', 'exuberant', 'pumped up', 'stoked'],
    melancholy: ['nostalgic', 'wistful', 'pensive', 'reflective', 'bittersweet', 'longing', 'contemplative'],
    focused: ['focused', 'concentrated', 'determined', 'motivated', 'driven', 'productive', 'sharp', 'clear'],
    romantic: ['love', 'romantic', 'affectionate', 'tender', 'passionate', 'intimate', 'loving', 'sweet']
  };

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const scores: Record<string, { score: number; matchedKeywords: string[] }> = {};

  // Initialize scores
  Object.keys(moodKeywords).forEach(mood => {
    scores[mood] = { score: 0, matchedKeywords: [] };
  });

  // Calculate scores for each mood
  Object.entries(moodKeywords).forEach(([mood, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        scores[mood].score += matches.length;
        if (!scores[mood].matchedKeywords.includes(keyword)) {
          scores[mood].matchedKeywords.push(keyword);
        }
      }
    });
  });

  // Find the mood with the highest score
  const sortedMoods = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score)
    .filter(([, data]) => data.score > 0);

  if (sortedMoods.length === 0) {
    // No keywords matched, analyze sentence structure and common words
    const sentimentWords = {
      positive: ['good', 'nice', 'well', 'fine', 'ok', 'okay', 'alright', 'better'],
      negative: ['bad', 'not', 'never', 'no', 'hard', 'difficult', 'tough', 'rough'],
      neutral: ['today', 'feeling', 'been', 'just', 'really', 'very', 'quite']
    };

    let positiveScore = 0;
    let negativeScore = 0;

    sentimentWords.positive.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });

    sentimentWords.negative.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) {
      return { mood: 'happy', confidence: 40, keywords: [] };
    } else if (negativeScore > positiveScore) {
      return { mood: 'sad', confidence: 40, keywords: [] };
    } else {
      return { mood: 'calm', confidence: 30, keywords: [] };
    }
  }

  const topMood = sortedMoods[0];
  const totalWords = words.length;
  const keywordDensity = topMood[1].score / totalWords;
  
  // Calculate confidence based on keyword matches and density
  let confidence = Math.min(95, Math.max(30, keywordDensity * 100 + 30));
  
  // Boost confidence if multiple keywords of the same mood are found
  if (topMood[1].matchedKeywords.length > 1) {
    confidence += 15;
  }
  
  // Check for competing moods and reduce confidence if they're close
  if (sortedMoods.length > 1 && sortedMoods[1][1].score / topMood[1].score > 0.7) {
    confidence -= 20;
  }

  return {
    mood: topMood[0],
    confidence: Math.round(Math.min(95, Math.max(30, confidence))),
    keywords: topMood[1].matchedKeywords
  };
}

export function getMoodDescription(mood: string): string {
  const descriptions = {
    happy: "Uplifting and joyful melodies that capture your positive energy",
    sad: "Gentle, contemplative tones that honor your emotional depth",
    energetic: "Dynamic rhythms and powerful beats that match your vitality",
    calm: "Soothing harmonies that promote relaxation and peace",
    anxious: "Structured compositions that help organize chaotic thoughts",
    peaceful: "Serene soundscapes that enhance your inner tranquility",
    excited: "Vibrant and dynamic music that celebrates your enthusiasm",
    melancholy: "Nostalgic melodies that embrace bittersweet emotions",
    focused: "Minimalist compositions that support concentration",
    romantic: "Tender melodies that express love and affection"
  };

  return descriptions[mood as keyof typeof descriptions] || "Personalized music tailored to your current state";
}
