import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Play, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistorySectionProps {
  onTrackSelect: (track: any) => void;
}

export default function HistorySection({ onTrackSelect }: HistorySectionProps) {
  const { toast } = useToast();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["/api/music-tracks"],
  });

  const handlePlayTrack = (track: any) => {
    onTrackSelect(track);
    toast({
      title: "Track Selected",
      description: `Now playing: ${track.title}`,
    });
  };

  const handleDownload = (track: any) => {
    toast({
      title: "Download Started",
      description: `Downloading: ${track.title}`,
    });
  };

  const getMoodGradient = (mood: string) => {
    const gradients = {
      happy: 'from-yellow-400 to-orange-500',
      sad: 'from-blue-400 to-blue-600',
      energetic: 'from-red-400 to-pink-500',
      calm: 'from-green-400 to-teal-500',
      anxious: 'from-purple-400 to-indigo-500',
      peaceful: 'from-indigo-400 to-purple-500',
      excited: 'from-pink-400 to-red-500',
      melancholy: 'from-gray-400 to-gray-600',
      focused: 'from-blue-400 to-indigo-500',
      romantic: 'from-pink-400 to-purple-500'
    };
    return gradients[mood as keyof typeof gradients] || 'from-gray-400 to-gray-600';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <section className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-white">Your Music History</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-slate-900/30 rounded-xl animate-pulse">
              <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6 text-white">Your Music History</h2>
      
      {tracks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No tracks generated yet. Create your first mood-based composition above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track: any) => (
            <div
              key={track.id}
              className="flex items-center space-x-4 p-4 bg-slate-900/30 rounded-xl hover:bg-slate-900/50 transition-all duration-200 cursor-pointer"
              onClick={() => handlePlayTrack(track)}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${getMoodGradient(track.mood)} rounded-lg flex items-center justify-center`}>
                <span className="text-xl">{track.moodEmoji}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{track.title}</h3>
                <p className="text-gray-400 text-sm">
                  {track.mood.charAt(0).toUpperCase() + track.mood.slice(1)} • {track.duration} seconds
                </p>
                <p className="text-gray-500 text-xs">{formatTimeAgo(track.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                  className="text-indigo-500 hover:text-indigo-400 p-2 hover:bg-indigo-500/10 rounded-lg"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(track);
                  }}
                  className="text-emerald-500 hover:text-emerald-400 p-2 hover:bg-emerald-500/10 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tracks.length > 0 && (
        <div className="text-center mt-6">
          <Button variant="ghost" className="text-indigo-500 hover:text-indigo-400 font-medium">
            View All History →
          </Button>
        </div>
      )}
    </section>
  );
}
