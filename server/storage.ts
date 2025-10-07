import { type User, type InsertUser, type MusicTrack, type InsertMusicTrack, type MoodAnalysis, type InsertMoodAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Music tracks
  createMusicTrack(track: InsertMusicTrack): Promise<MusicTrack>;
  getMusicTrack(id: string): Promise<MusicTrack | undefined>;
  getAllMusicTracks(): Promise<MusicTrack[]>;
  getUserMusicTracks(userId?: string): Promise<MusicTrack[]>;
  
  // Mood analyses
  createMoodAnalysis(analysis: InsertMoodAnalysis): Promise<MoodAnalysis>;
  getMoodAnalyses(): Promise<MoodAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private musicTracks: Map<string, MusicTrack>;
  private moodAnalyses: Map<string, MoodAnalysis>;

  constructor() {
    this.users = new Map();
    this.musicTracks = new Map();
    this.moodAnalyses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMusicTrack(insertTrack: InsertMusicTrack): Promise<MusicTrack> {
    const id = randomUUID();
    const track: MusicTrack = {
      ...insertTrack,
      id,
      createdAt: new Date(),
    };
    this.musicTracks.set(id, track);
    return track;
  }

  async getMusicTrack(id: string): Promise<MusicTrack | undefined> {
    return this.musicTracks.get(id);
  }

  async getAllMusicTracks(): Promise<MusicTrack[]> {
    return Array.from(this.musicTracks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getUserMusicTracks(userId?: string): Promise<MusicTrack[]> {
    return Array.from(this.musicTracks.values())
      .filter(track => !userId || track.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createMoodAnalysis(insertAnalysis: InsertMoodAnalysis): Promise<MoodAnalysis> {
    const id = randomUUID();
    const analysis: MoodAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.moodAnalyses.set(id, analysis);
    return analysis;
  }

  async getMoodAnalyses(): Promise<MoodAnalysis[]> {
    return Array.from(this.moodAnalyses.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
