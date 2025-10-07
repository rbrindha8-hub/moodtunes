import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Brain } from "lucide-react";

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
}

const MOODS = [
  { id: 'happy', emoji: '😊', name: 'Happy', gradient: 'mood-button-happy' },
  { id: 'sad', emoji: '😢', name: 'Sad', gradient: 'mood-button-sad' },
  { id: 'energetic', emoji: '⚡', name: 'Energetic', gradient: 'mood-button-energetic' },
  { id: 'calm', emoji: '🧘', name: 'Calm', gradient: 'mood-button-calm' },
  { id: 'anxious', emoji: '😰', name: 'Anxious', gradient: 'mood-button-anxious' },
  { id: 'peaceful', emoji: '☮️', name: 'Peaceful', gradient: 'mood-button-peaceful' },
  { id: 'excited', emoji: '🎉', name: 'Excited', gradient: 'mood-button-excited' },
  { id: 'melancholy', emoji: '🌙', name: 'Melancholy', gradient: 'mood-button-melancholy' },
  { id: 'focused', emoji: '🎯', name: 'Focused', gradient: 'mood-button-focused' },
  { id: 'romantic', emoji: '💕', name: 'Romantic', gradient: 'mood-button-romantic' },
];

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const [moodText, setMoodText] = useState("");
  const { toast } = useToast();

  const analyzeMoodMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/analyze-mood", { text });
      return response.json();
    },
    onSuccess: (data) => {
      onMoodSelect(data.mood);
      toast({
        title: "Mood Analyzed",
        description: `Detected mood: ${data.mood} (${data.confidence}% confidence)`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your mood. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMoodButtonClick = (moodId: string) => {
    onMoodSelect(moodId);
  };

  const handleAnalyzeMood = () => {
    if (!moodText.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please describe your feeling first.",
        variant: "destructive",
      });
      return;
    }
    analyzeMoodMutation.mutate(moodText);
  };

  const selectedMoodData = MOODS.find(mood => mood.id === selectedMood);

  return (
    <section className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-white">How are you feeling today?</h2>
      
      {/* Manual Mood Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-gray-300">Choose your mood</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleMoodButtonClick(mood.id)}
              className={`group relative overflow-hidden p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${mood.gradient} ${
                selectedMood === mood.id ? 'ring-4 ring-white/30' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{mood.emoji}</div>
                <span className="text-sm font-medium text-white">{mood.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Mood Display */}
      {selectedMoodData && (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
            <div className="text-2xl">{selectedMoodData.emoji}</div>
            <div>
              <span className="text-gray-300">Selected mood:</span>
              <span className="text-white font-semibold ml-2">{selectedMoodData.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Text Input Alternative */}
      <div className="border-t border-gray-600 pt-6">
        <h3 className="text-lg font-medium mb-4 text-gray-300">Or describe your feeling</h3>
        <div className="relative">
          <Textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="Tell me how you're feeling right now... (e.g., 'I'm feeling overwhelmed but hopeful')"
            className="w-full p-4 bg-slate-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none transition-all duration-200"
            rows={3}
          />
          <Button
            onClick={handleAnalyzeMood}
            disabled={analyzeMoodMutation.isPending}
            className="absolute bottom-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Brain className="w-4 h-4 mr-2" />
            {analyzeMoodMutation.isPending ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>
    </section>
  );
}
