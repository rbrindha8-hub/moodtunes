import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward, Download, VolumeX, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  track: {
    trackId: string;
    title: string;
    mood: string;
    emoji: string;
    duration: number;
    audioBuffer?: AudioBuffer;
    musicParams: any;
  };
}

export default function AudioPlayer({ track }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeInputMode, setIsVolumeInputMode] = useState(false);
  const [volumeInput, setVolumeInput] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume / 100;
    }

    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle keyboard input for volume control
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isVolumeInputMode) return;
      
      const digit = e.key;
      if (/^\d$/.test(digit)) {
        const newInput = volumeInput + digit;
        setVolumeInput(newInput);
        
        if (newInput.length === 2) {
          const newVolume = parseInt(newInput, 10);
          if (newVolume >= 1 && newVolume <= 100) {
            setVolume(newVolume);
            toast({
              title: "Volume Set",
              description: `Volume set to ${newVolume}%`,
            });
          } else {
            toast({
              title: "Invalid Volume", 
              description: "Volume must be between 01-99",
              variant: "destructive",
            });
          }
          setIsVolumeInputMode(false);
          setVolumeInput("");
        } else if (newInput.length === 1) {
          // Allow single digit, will wait for second digit
        }
      } else if (e.key === 'Escape') {
        setIsVolumeInputMode(false);
        setVolumeInput("");
      }
    };

    if (isVolumeInputMode) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVolumeInputMode, volumeInput, toast]);

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayPause = async () => {
    if (!audioContextRef.current || !track.audioBuffer) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      stopAudio();
      pauseTimeRef.current = currentTime;
    } else {
      stopAudio();
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = track.audioBuffer;
      source.connect(gainNodeRef.current!);
      
      const startOffset = pauseTimeRef.current;
      startTimeRef.current = audioContextRef.current.currentTime - startOffset;
      
      source.start(0, startOffset);
      sourceRef.current = source;
      
      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        pauseTimeRef.current = 0;
      };
      
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    pauseTimeRef.current = time;
    setCurrentTime(time);
    
    if (isPlaying) {
      // Restart playback from new position
      stopAudio();
      togglePlayPause();
    }
  };

  const handleRewind = () => {
    const newTime = Math.max(0, currentTime - 10);
    seekTo(newTime);
  };

  const handleFastForward = () => {
    const newTime = Math.min(track.duration, currentTime + 10);
    seekTo(newTime);
  };

  const handleVolumeButtonClick = () => {
    setIsVolumeInputMode(true);
    setVolumeInput("");
    toast({
      title: "Volume Input Mode",
      description: "Type any 2-digit number (01-99) to set volume. Press Esc to cancel.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your track is being prepared for download.",
    });
    // In a real implementation, this would trigger an actual download
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update current time when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && audioContextRef.current) {
      interval = setInterval(() => {
        const elapsed = audioContextRef.current!.currentTime - startTimeRef.current;
        const newTime = Math.min(elapsed, track.duration);
        setCurrentTime(newTime);
        
        if (newTime >= track.duration) {
          stopAudio();
          setCurrentTime(0);
          pauseTimeRef.current = 0;
        }
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, track.duration]);

  return (
    <section className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6 text-center text-white">Your Generated Music</h2>
      
      {/* Track Info */}
      <div className="flex items-center space-x-4 mb-6 p-4 bg-slate-900/50 rounded-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
          {track.emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{track.title}</h3>
          <p className="text-gray-400 text-sm">Generated from: {track.mood} mood</p>
          <p className="text-gray-500 text-xs">Created just now</p>
        </div>
        <Button
          onClick={handleDownload}
          variant="ghost"
          size="sm"
          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>

      {/* Audio Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={track.duration}
            step={0.1}
            onValueChange={(value) => seekTo(value[0])}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => seekTo(0)}
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full"
            onClick={handleRewind}
          >
            <Rewind className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-4 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full"
            onClick={handleFastForward}
          >
            <FastForward className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => seekTo(track.duration)}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVolumeButtonClick}
            className={`${isVolumeInputMode ? 'text-yellow-400 bg-yellow-500/20 animate-pulse' : 'text-gray-400 hover:text-white'} transition-all duration-200`}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <div className="w-24">
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="cursor-pointer"
            />
          </div>
          {isVolumeInputMode && (
            <div className="ml-3 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm font-mono">
              {volumeInput.length === 0 ? "__" : volumeInput.padEnd(2, "_")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
