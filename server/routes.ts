import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMusicTrackSchema, insertMoodAnalysisSchema, moodSelectSchema, textAnalysisSchema, MOODS } from "@shared/schema";
import { z } from "zod";

// Simple mood detection using keyword matching
function analyzeMoodFromText(text: string): { mood: string; confidence: number } {
  const moodKeywords = {
    happy: ['happy', 'joy', 'excited', 'cheerful', 'glad', 'pleased', 'delighted', 'elated', 'upbeat', 'positive'],
    sad: ['sad', 'depressed', 'down', 'melancholy', 'blue', 'unhappy', 'sorrowful', 'gloomy', 'dejected'],
    energetic: ['energetic', 'pumped', 'hyper', 'active', 'dynamic', 'vigorous', 'lively', 'spirited'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'quiet', 'still', 'composed'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'concerned', 'apprehensive'],
    peaceful: ['peaceful', 'zen', 'meditation', 'mindful', 'harmony', 'balance', 'serenity'],
    excited: ['thrilled', 'ecstatic', 'enthusiastic', 'eager', 'animated', 'exuberant'],
    melancholy: ['nostalgic', 'wistful', 'pensive', 'reflective', 'bittersweet'],
    focused: ['focused', 'concentrated', 'determined', 'motivated', 'driven', 'productive'],
    romantic: ['love', 'romantic', 'affectionate', 'tender', 'passionate', 'intimate']
  };

  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};

  // Calculate scores for each mood
  Object.entries(moodKeywords).forEach(([mood, keywords]) => {
    scores[mood] = keywords.reduce((score, keyword) => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      return score + matches;
    }, 0);
  });

  // Find the mood with the highest score
  const topMood = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
  
  // Calculate confidence based on keyword matches
  const totalWords = text.split(/\s+/).length;
  const confidence = Math.min(95, Math.max(30, (topMood[1] / totalWords) * 100 + 30));

  return {
    mood: topMood[1] > 0 ? topMood[0] : 'calm', // Default to calm if no keywords match
    confidence: Math.round(confidence)
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze mood from text
  app.post("/api/analyze-mood", async (req, res) => {
    try {
      const { text } = textAnalysisSchema.parse(req.body);
      
      const { mood, confidence } = analyzeMoodFromText(text);
      
      const analysis = await storage.createMoodAnalysis({
        inputText: text,
        detectedMood: mood,
        confidence
      });

      res.json({ 
        mood, 
        confidence,
        analysisId: analysis.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to analyze mood" });
      }
    }
  });

  // Generate music based on mood
  app.post("/api/generate-music", async (req, res) => {
    try {
      const { mood } = moodSelectSchema.parse(req.body);
      
      // Generate music parameters based on mood
      const musicParams = generateMusicParameters(mood);
      
      // Create a mock track entry (in real implementation, this would contain actual audio data)
      const track = await storage.createMusicTrack({
        title: `${capitalizeFirst(mood)} ${getRandomTitle()}`,
        mood,
        moodEmoji: getMoodEmoji(mood),
        duration: Math.floor(Math.random() * 30) + 30, // 30-60 seconds
        audioData: null, // Would contain actual generated audio data
        userId: undefined // For guest users
      });

      res.json({
        trackId: track.id,
        title: track.title,
        mood: track.mood,
        emoji: track.moodEmoji,
        duration: track.duration,
        musicParams
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid mood", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to generate music" });
      }
    }
  });

  // Get all music tracks (history)
  app.get("/api/music-tracks", async (req, res) => {
    try {
      const tracks = await storage.getAllMusicTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch music tracks" });
    }
  });

  // Get specific music track
  app.get("/api/music-tracks/:id", async (req, res) => {
    try {
      const track = await storage.getMusicTrack(req.params.id);
      if (!track) {
        res.status(404).json({ message: "Track not found" });
        return;
      }
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch track" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function generateMusicParameters(mood: string) {
  const moodParams = {
    happy: { tempo: 120, key: 'C', scale: 'major', rhythm: 'upbeat' },
    sad: { tempo: 60, key: 'D', scale: 'minor', rhythm: 'slow' },
    energetic: { tempo: 140, key: 'E', scale: 'major', rhythm: 'driving' },
    calm: { tempo: 70, key: 'F', scale: 'major', rhythm: 'flowing' },
    anxious: { tempo: 100, key: 'G', scale: 'minor', rhythm: 'irregular' },
    peaceful: { tempo: 65, key: 'A', scale: 'major', rhythm: 'gentle' },
    excited: { tempo: 130, key: 'B', scale: 'major', rhythm: 'energetic' },
    melancholy: { tempo: 55, key: 'Em', scale: 'minor', rhythm: 'contemplative' },
    focused: { tempo: 90, key: 'Am', scale: 'minor', rhythm: 'steady' },
    romantic: { tempo: 75, key: 'G', scale: 'major', rhythm: 'romantic' }
  };

  return moodParams[mood as keyof typeof moodParams] || moodParams.calm;
}

function getMoodEmoji(mood: string): string {
  const moodEmojis = {
    happy: '😊',
    sad: '😢', 
    energetic: '⚡',
    calm: '🧘',
    anxious: '😰',
    peaceful: '☮️',
    excited: '🎉',
    melancholy: '🌙',
    focused: '🎯',
    romantic: '💕'
  };

  return moodEmojis[mood as keyof typeof moodEmojis] || '😊';
}

function getRandomTitle(): string {
  const titles = [
    'Melody #1', 'Vibes #2', 'Symphony', 'Harmony', 'Rhythm', 'Composition',
    'Theme', 'Ballad', 'Tune', 'Song', 'Piece', 'Track'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
