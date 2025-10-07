import MoodSelector from "@/components/mood-selector";
import MusicGenerator from "@/components/music-generator";
import AudioPlayer from "@/components/audio-player";
import HistorySection from "@/components/history-section";
import { useState } from "react";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [currentTrack, setCurrentTrack] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-4">
              MoodTunes
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your emotions into personalized music with AI-powered composition
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MoodSelector 
          selectedMood={selectedMood} 
          onMoodSelect={setSelectedMood} 
        />
        
        <MusicGenerator 
          selectedMood={selectedMood}
          onTrackGenerated={setCurrentTrack}
        />
        
        {currentTrack && (
          <AudioPlayer 
            track={currentTrack}
          />
        )}
        
        <HistorySection 
          onTrackSelect={setCurrentTrack}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/30 border-t border-gray-700/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 MoodTunes. Transforming emotions into music with AI.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="hover:text-indigo-500 transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-indigo-500 transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-indigo-500 transition-colors duration-200">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
