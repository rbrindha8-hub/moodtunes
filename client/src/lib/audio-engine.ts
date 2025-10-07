import * as Tone from "tone";

interface MusicParams {
  tempo: number;
  key: string;
  scale: 'major' | 'minor';
  rhythm: string;
}

// Scale definitions
const scales = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

// Note mapping
const noteMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enhanced audio generation with proper musical structure
export async function generateAudioFromMood(params: MusicParams): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const duration = 30; // 30 seconds
  const sampleRate = audioContext.sampleRate;
  const numSamples = sampleRate * duration;
  
  // Create audio buffer
  const audioBuffer = audioContext.createBuffer(2, numSamples, sampleRate);
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = audioBuffer.getChannelData(1);

  // Generate scale based on key and mode
  const keyIndex = noteMap.indexOf(params.key.charAt(0));
  const scaleNotes = scales[params.scale].map(interval => {
    const noteIndex = (keyIndex + interval) % 12;
    return noteMap[noteIndex];
  });

  // Note frequencies
  const getFrequency = (note: string, octave: number): number => {
    const noteIndex = noteMap.indexOf(note);
    return 440 * Math.pow(2, (noteIndex - 9 + (octave - 4) * 12) / 12);
  };

  // Create chord progressions based on actual mood
  const getChordProgression = (scale: string) => {
    if (scale === 'minor') {
      return [0, 2, 5, 0]; // i-III-vi-i (minor progression)
    } else {
      return [0, 3, 4, 0]; // I-IV-V-I (major progression)
    }
  };

  // Generate musical patterns based on tempo and key
  const beatLength = 60 / params.tempo; // seconds per beat
  const measureLength = beatLength * 4; // 4/4 time
  const chordProgression = getChordProgression(params.scale);
  
  // Get mood-specific characteristics with unique vibes
  const getMoodVibe = (rhythm: string, tempo: number, scale: string) => {
    const vibes = {
      'upbeat': { // Happy
        bassType: 'bouncy',
        melodyStyle: 'dancing',
        harmony: 'bright',
        effects: ['sparkle', 'bounce'],
        rhythmComplexity: 4
      },
      'slow': { // Sad
        bassType: 'melancholic',
        melodyStyle: 'sorrowful',
        harmony: 'emotional',
        effects: ['reverb', 'tears'],
        rhythmComplexity: 1
      },
      'driving': { // Energetic
        bassType: 'pounding',
        melodyStyle: 'soaring',
        harmony: 'powerful',
        effects: ['distortion', 'pulse'],
        rhythmComplexity: 8
      },
      'flowing': { // Calm
        bassType: 'gentle',
        melodyStyle: 'floating',
        harmony: 'peaceful',
        effects: ['wave', 'breath'],
        rhythmComplexity: 2
      },
      'irregular': { // Anxious
        bassType: 'restless',
        melodyStyle: 'uncertain',
        harmony: 'unsettled',
        effects: ['flutter', 'hesitate'],
        rhythmComplexity: 5
      },
      'gentle': { // Peaceful
        bassType: 'soft',
        melodyStyle: 'lullaby',
        harmony: 'warm',
        effects: ['whisper', 'glow'],
        rhythmComplexity: 1
      },
      'energetic': { // Excited
        bassType: 'jumping',
        melodyStyle: 'celebrating',
        harmony: 'vibrant',
        effects: ['burst', 'fizz'],
        rhythmComplexity: 6
      },
      'contemplative': { // Melancholy
        bassType: 'hollow',
        melodyStyle: 'longing',
        harmony: 'nostalgic',
        effects: ['drift', 'memory'],
        rhythmComplexity: 1
      },
      'steady': { // Focused
        bassType: 'solid',
        melodyStyle: 'precise',
        harmony: 'clear',
        effects: ['focus', 'sharp'],
        rhythmComplexity: 2
      },
      'romantic': { // Romantic
        bassType: 'warm',
        melodyStyle: 'tender',
        harmony: 'intimate',
        effects: ['caress', 'velvet'],
        rhythmComplexity: 3
      }
    };
    
    return vibes[rhythm as keyof typeof vibes] || vibes['flowing'];
  };
  
  const moodVibe = getMoodVibe(params.rhythm, params.tempo, params.scale);

  // Generate waveform
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    let sample = 0;

    // Calculate current measure and beat
    const currentMeasure = Math.floor(time / measureLength) % 4;
    const beatInMeasure = (time % measureLength) / beatLength;
    const currentChord = chordProgression[currentMeasure];

    // Chord tones
    const root = getFrequency(scaleNotes[currentChord], 3);
    const third = getFrequency(scaleNotes[(currentChord + 2) % scaleNotes.length], 3);
    const fifth = getFrequency(scaleNotes[(currentChord + 4) % scaleNotes.length], 3);

    // Generate bass with unique vibe
    sample += generateBass(moodVibe.bassType, root, time, beatInMeasure, moodVibe.rhythmComplexity);
    
    // Generate harmony with mood-specific character
    sample += generateHarmony(moodVibe.harmony, root, third, fifth, time, params.tempo);
    
    // Generate melody with unique style
    sample += generateMelody(moodVibe.melodyStyle, scaleNotes, time, params.tempo, currentMeasure);
    
    // Add mood-specific effects
    sample = applyMoodEffects(sample, moodVibe.effects, time, root, params.tempo);

    // Apply overall envelope
    let envelope = 1;
    if (time < 2) {
      envelope = time / 2; // Fade in
    } else if (time > duration - 3) {
      envelope = (duration - time) / 3; // Fade out
    }
    sample *= envelope;

    // Apply dynamic range based on mood
    if (params.scale === 'minor') {
      sample *= 0.7; // Softer for minor keys
    }

    // Limit amplitude and add slight compression
    sample = Math.tanh(sample * 0.8) * 0.9;
    
    leftChannel[i] = sample;
    rightChannel[i] = sample * 0.95; // Slight stereo width
  }

  return audioBuffer;
}

// Helper function to generate different waveforms
function generateWaveform(frequency: number, time: number, type: 'sine' | 'triangle' | 'sawtooth'): number {
  const phase = 2 * Math.PI * frequency * time;
  
  switch (type) {
    case 'sine':
      return Math.sin(phase);
    case 'triangle':
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case 'sawtooth':
      return 2 * (phase / (2 * Math.PI) - Math.floor(phase / (2 * Math.PI) + 0.5));
    default:
      return Math.sin(phase);
  }
}

// Generate noise for percussion effects
function generateNoise(time: number): number {
  return (Math.random() * 2 - 1) * Math.exp(-time * 10);
}

// Generate bass with unique characteristics
function generateBass(bassType: string, rootFreq: number, time: number, beat: number, complexity: number): number {
  const bassFreq = rootFreq * 0.5;
  
  switch (bassType) {
    case 'bouncy': // Happy
      const bouncePattern = Math.sin(beat * Math.PI * 2) > 0 ? 1 : 0.3;
      return 0.4 * bouncePattern * generateWaveform(bassFreq, time, 'triangle');
      
    case 'melancholic': // Sad
      const melancholyEnvelope = 0.4 + 0.3 * Math.sin(time * 0.2);
      const bassModulation = 1 + 0.1 * Math.sin(time * 0.3);
      return 0.45 * melancholyEnvelope * generateWaveform(bassFreq * bassModulation, time, 'sine');
      
    case 'pounding': // Energetic
      const poundPattern = Math.floor(beat * complexity) % complexity < 2 ? 1 : 0.1;
      return 0.6 * poundPattern * (generateWaveform(bassFreq, time, 'sawtooth') + 0.3 * generateNoise(time));
      
    case 'gentle': // Calm
      return 0.25 * (1 + 0.3 * Math.sin(time * 0.5)) * generateWaveform(bassFreq, time, 'sine');
      
    case 'restless': // Anxious
      const restlessRate = 1 + 0.4 * Math.sin(time * 1.5);
      const restlessEnvelope = 0.35 + 0.15 * Math.abs(Math.sin(time * 2.3));
      return restlessEnvelope * generateWaveform(bassFreq * restlessRate, time, 'triangle');
      
    case 'soft': // Peaceful
      return 0.2 * Math.sin(time * 0.3 + Math.PI/4) * generateWaveform(bassFreq, time, 'sine');
      
    case 'jumping': // Excited
      const jump = Math.sin(beat * Math.PI * 4) > 0.5 ? 1 : 0.2;
      return 0.45 * jump * generateWaveform(bassFreq, time, 'triangle');
      
    case 'hollow': // Melancholy
      return 0.3 * (1 - Math.exp(-time * 0.1)) * generateWaveform(bassFreq * 0.7, time, 'triangle');
      
    case 'solid': // Focused
      return 0.35 * generateWaveform(bassFreq, time, 'sawtooth');
      
    case 'warm': // Romantic
      return 0.3 * (1 + 0.2 * Math.sin(time * 0.8)) * generateWaveform(bassFreq, time, 'sine');
      
    default:
      return 0.3 * generateWaveform(bassFreq, time, 'sawtooth');
  }
}

// Generate harmony with mood character
function generateHarmony(harmonyType: string, root: number, third: number, fifth: number, time: number, tempo: number): number {
  const harmonicRate = tempo / 120;
  
  switch (harmonyType) {
    case 'bright': // Happy
      const brightness = 0.3 + 0.2 * Math.sin(time * harmonicRate);
      return brightness * (0.25 * generateWaveform(root, time, 'triangle') + 
                          0.2 * generateWaveform(third, time, 'triangle') + 
                          0.15 * generateWaveform(fifth, time, 'triangle') +
                          0.1 * generateWaveform(root * 2, time, 'sine'));
      
    case 'emotional': // Sad
      const emotionalDepth = 0.25 + 0.15 * Math.sin(time * 0.4);
      const harmonyShift = 1 + 0.05 * Math.sin(time * 0.6);
      return emotionalDepth * (0.8 * generateWaveform(root * harmonyShift, time, 'sine') + 
                             0.6 * generateWaveform(third * 0.97, time, 'sine') +
                             0.4 * generateWaveform(fifth * 0.95, time, 'triangle'));
      
    case 'powerful': // Energetic
      const power = 0.4 + 0.3 * Math.abs(Math.sin(time * harmonicRate * 2));
      return power * (0.3 * generateWaveform(root, time, 'sawtooth') + 
                     0.25 * generateWaveform(fifth, time, 'sawtooth'));
      
    case 'peaceful': // Calm
      return 0.2 * Math.sin(time * 0.3) * (generateWaveform(root, time, 'sine') + 
                                          0.6 * generateWaveform(third, time, 'sine'));
      
    case 'unsettled': // Anxious
      const unsettledShift = 1 + 0.2 * Math.sin(time * 1.8);
      const unsettledDepth = 0.28 + 0.12 * Math.abs(Math.sin(time * 2.1));
      return unsettledDepth * (0.7 * generateWaveform(root * unsettledShift, time, 'sine') + 
                               0.5 * generateWaveform(third * 1.05, time, 'triangle') +
                               0.3 * generateWaveform(fifth * 0.98, time, 'sine'));
      
    case 'warm': // Peaceful
      return 0.18 * (1 + 0.4 * Math.sin(time * 0.4)) * 
             (generateWaveform(root, time, 'sine') + 0.5 * generateWaveform(third, time, 'sine'));
      
    case 'vibrant': // Excited
      const vibrance = 0.35 + 0.25 * Math.sin(time * harmonicRate * 1.5);
      return vibrance * (generateWaveform(root, time, 'triangle') + 
                        0.8 * generateWaveform(fifth, time, 'triangle'));
      
    case 'nostalgic': // Melancholy
      return 0.2 * Math.exp(-time * 0.05) * (generateWaveform(root * 0.95, time, 'sine') + 
                                            0.6 * generateWaveform(third * 0.98, time, 'sine'));
      
    case 'clear': // Focused
      return 0.25 * (generateWaveform(root, time, 'triangle') + 
                    0.7 * generateWaveform(fifth, time, 'triangle'));
      
    case 'intimate': // Romantic
      return 0.22 * (1 + 0.3 * Math.sin(time * 0.6)) * 
             (generateWaveform(root, time, 'sine') + 0.8 * generateWaveform(third, time, 'sine'));
      
    default:
      return 0.2 * (generateWaveform(root, time, 'triangle') + 
                   0.7 * generateWaveform(third, time, 'triangle'));
  }
}

// Generate melody with unique style
function generateMelody(melodyStyle: string, scaleNotes: string[], time: number, tempo: number, measure: number): number {
  const melodyRate = tempo / 120;
  
  switch (melodyStyle) {
    case 'dancing': // Happy
      const danceIndex = Math.floor((time * melodyRate * 2) % scaleNotes.length);
      const danceFreq = getFrequency(scaleNotes[danceIndex], 5);
      const dance = 0.25 * (1 + 0.5 * Math.sin(time * melodyRate * 3));
      return dance * generateWaveform(danceFreq, time, 'sine');
      
    case 'sorrowful': // Sad
      const sorrowIndex = Math.floor((time * melodyRate * 0.6) % scaleNotes.length);
      const sorrowFreq = getFrequency(scaleNotes[sorrowIndex], 4);
      const sorrow = 0.28 * (0.8 + 0.4 * Math.sin(time * 0.3)) * (1 + 0.1 * Math.sin(time * 1.2));
      const bend = 1 + 0.08 * Math.sin(time * 2.5); // Pitch bending for emotion
      return sorrow * generateWaveform(sorrowFreq * bend, time, 'sine');
      
    case 'soaring': // Energetic
      const soarIndex = Math.floor((time * melodyRate * 3) % scaleNotes.length);
      const soarFreq = getFrequency(scaleNotes[soarIndex], 5 + Math.floor(time / 4) % 2);
      return 0.3 * generateWaveform(soarFreq, time, 'sawtooth');
      
    case 'floating': // Calm
      const floatIndex = Math.floor((time * melodyRate * 0.8) % scaleNotes.length);
      const floatFreq = getFrequency(scaleNotes[floatIndex], 4);
      const float = 0.2 * (1 + 0.4 * Math.sin(time * 0.3));
      return float * generateWaveform(floatFreq, time, 'sine');
      
    case 'uncertain': // Anxious
      const uncertainIndex = Math.floor((time * melodyRate * (1.2 + 0.5 * Math.sin(time * 1.7))) % scaleNotes.length);
      const uncertainFreq = getFrequency(scaleNotes[uncertainIndex], 4);
      const uncertainty = 0.26 * (0.7 + 0.3 * Math.sin(time * 1.9)) * (1 + 0.1 * Math.sin(time * 3.1));
      const waver = 1 + 0.05 * Math.sin(time * 4.2); // Slight pitch wavering
      return uncertainty * generateWaveform(uncertainFreq * waver, time, 'sine');
      
    case 'lullaby': // Peaceful
      const lullabyIndex = Math.floor((time * melodyRate * 0.4) % scaleNotes.length);
      const lullabyFreq = getFrequency(scaleNotes[lullabyIndex], 4);
      return 0.15 * Math.sin(time * 0.2) * generateWaveform(lullabyFreq, time, 'sine');
      
    case 'celebrating': // Excited
      const celebIndex = Math.floor((time * melodyRate * 2.5) % scaleNotes.length);
      const celebFreq = getFrequency(scaleNotes[celebIndex], 5);
      const celebration = 0.28 * (1 + 0.6 * Math.sin(time * melodyRate * 2));
      return celebration * generateWaveform(celebFreq, time, 'triangle');
      
    case 'longing': // Melancholy
      const longIndex = Math.floor((time * melodyRate * 0.3) % scaleNotes.length);
      const longFreq = getFrequency(scaleNotes[longIndex], 4);
      const longing = 0.18 * (1 + Math.sin(time * 0.1));
      return longing * generateWaveform(longFreq, time, 'sine');
      
    case 'precise': // Focused
      const preciseIndex = Math.floor((time * melodyRate) % scaleNotes.length);
      const preciseFreq = getFrequency(scaleNotes[preciseIndex], 4);
      return 0.22 * generateWaveform(preciseFreq, time, 'triangle');
      
    case 'tender': // Romantic
      const tenderIndex = Math.floor((time * melodyRate * 0.7) % scaleNotes.length);
      const tenderFreq = getFrequency(scaleNotes[tenderIndex], 4);
      const tenderness = 0.2 * (1 + 0.3 * Math.sin(time * 0.5));
      return tenderness * generateWaveform(tenderFreq, time, 'sine');
      
    default:
      const defaultIndex = Math.floor((time * melodyRate) % scaleNotes.length);
      const defaultFreq = getFrequency(scaleNotes[defaultIndex], 4);
      return 0.2 * generateWaveform(defaultFreq, time, 'sine');
  }
}

// Apply mood-specific effects
function applyMoodEffects(sample: number, effects: string[], time: number, rootFreq: number, tempo: number): number {
  let processed = sample;
  
  for (const effect of effects) {
    switch (effect) {
      case 'sparkle': // Happy
        processed += 0.05 * Math.sin(time * 8) * generateWaveform(rootFreq * 4, time, 'sine');
        break;
        
      case 'bounce': // Happy
        processed *= 1 + 0.1 * Math.abs(Math.sin(time * tempo / 30));
        break;
        
      case 'reverb': // Sad
        processed += 0.15 * sample * Math.sin(time * 0.3 - Math.PI/3);
        processed += 0.08 * sample * Math.sin(time * 0.7 - Math.PI/2);
        break;
        
      case 'tears': // Sad
        const tearDrop = Math.sin(time * 0.8) * Math.exp(-((time % 4) - 2) * ((time % 4) - 2));
        processed += 0.12 * tearDrop * generateWaveform(rootFreq * 1.5, time, 'sine');
        break;
        
      case 'distortion': // Energetic
        processed = Math.tanh(processed * 1.5) * 0.8;
        break;
        
      case 'pulse': // Energetic
        processed *= 1 + 0.3 * Math.sin(time * tempo / 15);
        break;
        
      case 'wave': // Calm
        processed += 0.05 * Math.sin(time * 0.3) * sample;
        break;
        
      case 'breath': // Calm
        processed *= 1 + 0.1 * Math.sin(time * 0.8);
        break;
        
      case 'flutter': // Anxious
        const flutter = 1 + 0.08 * Math.sin(time * 6.5);
        processed *= flutter;
        break;
        
      case 'hesitate': // Anxious
        const hesitation = Math.sin(time * 1.3);
        if (hesitation > 0.8) processed *= 0.6;
        else if (hesitation < -0.8) processed *= 1.2;
        break;
        
      case 'whisper': // Peaceful
        processed *= 0.7 + 0.2 * Math.sin(time * 0.2);
        break;
        
      case 'glow': // Peaceful
        processed += 0.03 * Math.sin(time * 0.4) * generateWaveform(rootFreq * 2, time, 'sine');
        break;
        
      case 'burst': // Excited
        const burstTime = time % 2;
        if (burstTime < 0.1) processed *= 1 + burstTime * 3;
        break;
        
      case 'fizz': // Excited
        processed += 0.04 * (Math.random() - 0.5) * Math.sin(time * 10);
        break;
        
      case 'drift': // Melancholy
        processed += 0.08 * sample * Math.sin(time * 0.1);
        break;
        
      case 'memory': // Melancholy
        processed += 0.06 * sample * Math.sin(time * 0.05 - Math.PI/2);
        break;
        
      case 'focus': // Focused
        processed = processed > 0 ? Math.min(processed, 0.8) : Math.max(processed, -0.8);
        break;
        
      case 'sharp': // Focused
        processed *= 1 + 0.05 * Math.sign(processed);
        break;
        
      case 'caress': // Romantic
        processed *= 1 + 0.2 * Math.sin(time * 0.7);
        break;
        
      case 'velvet': // Romantic
        processed = Math.sign(processed) * Math.pow(Math.abs(processed), 0.8);
        break;
    }
  }
  
  return processed;
}

// Helper function to get note frequency (needed for melody generation)
function getFrequency(note: string, octave: number): number {
  const noteMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = noteMap.indexOf(note);
  return 440 * Math.pow(2, (noteIndex - 9 + (octave - 4) * 12) / 12);
}
