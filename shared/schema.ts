import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const musicTracks = pgTable("music_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  mood: text("mood").notNull(),
  moodEmoji: text("mood_emoji").notNull(),
  duration: integer("duration").notNull(), // in seconds
  audioData: text("audio_data"), // base64 encoded audio or URL
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  userId: varchar("user_id"), // optional for guest users
});

export const moodAnalyses = pgTable("mood_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inputText: text("input_text").notNull(),
  detectedMood: text("detected_mood").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertMusicTrackSchema = createInsertSchema(musicTracks).omit({
  id: true,
  createdAt: true,
});

export const insertMoodAnalysisSchema = createInsertSchema(moodAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertMusicTrack = z.infer<typeof insertMusicTrackSchema>;
export type MusicTrack = typeof musicTracks.$inferSelect;
export type InsertMoodAnalysis = z.infer<typeof insertMoodAnalysisSchema>;
export type MoodAnalysis = typeof moodAnalyses.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Mood types for validation
export const MOODS = [
  'happy',
  'sad', 
  'energetic',
  'calm',
  'anxious',
  'peaceful',
  'excited',
  'melancholy',
  'focused',
  'romantic'
] as const;

export type Mood = typeof MOODS[number];

export const moodSelectSchema = z.object({
  mood: z.enum(MOODS),
});

export const textAnalysisSchema = z.object({
  text: z.string().min(3).max(500),
});
