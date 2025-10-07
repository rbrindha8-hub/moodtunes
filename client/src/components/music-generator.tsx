import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Wand2 } from "lucide-react";
import { generateAudioFromMood } from "@/lib/audio-engine";

interface MusicGeneratorProps {
  selectedMood: string;
  onTrackGenerated: (track: any) => void;
}

export default function MusicGenerator({ selectedMood, onTrackGenerated }: MusicGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateMusicMutation = useMutation({
    mutationFn: async (mood: string) => {
      const response = await apiRequest("POST", "/api/generate-music", { mood });
      return response.json();
    },
    onSuccess: async (data) => {
      // Generate actual audio using Tone.js
      setIsGenerating(true);
      try {
        const audioBuffer = await generateAudioFromMood(data.musicParams);
        const trackWithAudio = {
          ...data,
          audioBuffer,
          isPlaying: false,
          currentTime: 0
        };
        onTrackGenerated(trackWithAudio);
        toast({
          title: "Music Generated",
          description: `Created "${data.title}" based on your ${data.mood} mood`,
        });
      } catch (error) {
        toast({
          title: "Audio Generation Failed",
          description: "Could not generate audio. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate music. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerateMusic = () => {
    if (!selectedMood) {
      toast({
        title: "No Mood Selected",
        description: "Please select a mood first.",
        variant: "destructive",
      });
      return;
    }
    generateMusicMutation.mutate(selectedMood);
  };

  return (
    <section className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
      {/* Generation Button */}
      <div className="text-center mb-8">
        <Button
          onClick={handleGenerateMusic}
          disabled={!selectedMood || generateMusicMutation.isPending || isGenerating}
          className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Wand2 className="w-5 h-5 mr-3" />
          Generate My Music
        </Button>
      </div>

      {/* Loading State */}
      {(generateMusicMutation.isPending || isGenerating) && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="text-lg text-gray-300">
              {generateMusicMutation.isPending ? "Creating your personalized music..." : "Generating audio..."}
            </span>
          </div>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full animate-pulse w-3/5"></div>
          </div>
        </div>
      )}
    </section>
  );
}
