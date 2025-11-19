import React, { useState, useRef, useEffect } from 'react';
import { StoryResponse, Language } from '../types';
import { generateStorySpeech } from '../services/geminiService';
import { decodeBase64, decodePcmAudioData } from '../utils/audioUtils';
import { translations } from '../utils/localization';

interface StoryCardProps {
  story: StoryResponse;
  onReset: () => void;
  language: Language;
}

const AVAILABLE_VOICES = [
  { name: 'Zephyr', label: 'Zephyr' },
  { name: 'Kore', label: 'Kore' },
  { name: 'Puck', label: 'Puck' },
  { name: 'Charon', label: 'Charon' },
  { name: 'Fenrir', label: 'Fenrir' },
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const StoryCard: React.FC<StoryCardProps> = ({ story, onReset, language }) => {
  // State
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused' | 'buffering'>('idle');
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Refs for audio logic
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndexRef = useRef(0);
  const audioCacheRef = useRef<Map<number, AudioBuffer>>(new Map());
  const processingQueueRef = useRef<Set<number>>(new Set());
  const isStoppedRef = useRef(false);

  const t = translations[language];

  // Cleanup and Reset Effects
  useEffect(() => {
    stopAudio(true);
    chunksRef.current = [];
    audioCacheRef.current.clear();
    currentChunkIndexRef.current = 0;
    setElapsedTime(0);
  }, [story]);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: number;
    if (playbackState === 'playing') {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playbackState]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoice = e.target.value;
    setSelectedVoice(newVoice);
    if (playbackState === 'playing' || playbackState === 'buffering') {
      pauseAudio();
    }
    audioCacheRef.current.clear();
  };

  const fetchAudioChunk = async (index: number, text: string): Promise<AudioBuffer | null> => {
    if (audioCacheRef.current.has(index)) return audioCacheRef.current.get(index) || null;
    if (processingQueueRef.current.has(index)) return null;

    processingQueueRef.current.add(index);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await generateStorySpeech(text, selectedVoice);
      const pcmData = decodeBase64(base64Audio);
      const buffer = await decodePcmAudioData(pcmData, audioContextRef.current);
      
      audioCacheRef.current.set(index, buffer);
      processingQueueRef.current.delete(index);
      return buffer;
    } catch (error) {
      console.error(`Failed to load chunk ${index}`, error);
      processingQueueRef.current.delete(index);
      return null;
    }
  };

  const playNextChunk = async () => {
    if (isStoppedRef.current) return;

    const idx = currentChunkIndexRef.current;
    if (idx >= chunksRef.current.length) {
      setPlaybackState('idle');
      currentChunkIndexRef.current = 0;
      setElapsedTime(0);
      return;
    }

    let buffer = audioCacheRef.current.get(idx);
    if (!buffer) {
      setPlaybackState('buffering');
      buffer = await fetchAudioChunk(idx, chunksRef.current[idx]);
      if (!buffer) {
        setPlaybackState('paused'); 
        return;
      }
    }

    if (isStoppedRef.current) return;

    setPlaybackState('playing');
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current!.destination);
    source.onended = () => {
      if (!isStoppedRef.current) {
        currentChunkIndexRef.current++;
        playNextChunk();
      }
    };
    source.start();
    sourceNodeRef.current = source;

    // Prefetch
    const nextIdx = idx + 1;
    if (nextIdx < chunksRef.current.length) fetchAudioChunk(nextIdx, chunksRef.current[nextIdx]);
    if (nextIdx + 1 < chunksRef.current.length) fetchAudioChunk(nextIdx + 1, chunksRef.current[nextIdx + 1]);
  };

  const startAudio = async () => {
    isStoppedRef.current = false;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (chunksRef.current.length === 0) {
      const contentChunks = story.content.split(/\n\s*\n/).filter(c => c.trim().length > 0);
      // Start reading story immediately, skipping title
      chunksRef.current = contentChunks;
    }
    playNextChunk();
  };

  const pauseAudio = () => {
    isStoppedRef.current = true;
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setPlaybackState('paused');
  };

  const stopAudio = (reset: boolean = false) => {
    isStoppedRef.current = true;
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setPlaybackState('idle');
    if (reset) {
      currentChunkIndexRef.current = 0;
      setElapsedTime(0);
    }
  };

  const toggleAudio = () => {
    if (playbackState === 'playing' || playbackState === 'buffering') {
      pauseAudio();
    } else {
      startAudio();
    }
  };

  return (
    <div className="animate-fade-in-up w-full max-w-4xl mx-auto mt-4 pb-12">
      {/* Book Container */}
      <div className="bg-story-paper rounded-[2rem] shadow-2xl border-[6px] border-white relative overflow-hidden">
        
        {/* Book Spine/Decoration - Updated Colors */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-kid-blue via-kid-teal to-kid-pink opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-kid-blue via-kid-teal to-kid-pink opacity-50"></div>

        <div className="p-8 md:p-16">
          
          {/* Title Header */}
          <div className="text-center mb-10 relative">
            <div className="inline-block px-6 py-2 rounded-full bg-orange-50 border-2 border-orange-100 text-orange-800 font-bold text-sm uppercase tracking-wider mb-4 shadow-sm">
              {language === 'sv' ? 'En magisk saga' : 'A magical story'}
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-gray-800 mb-4 leading-tight">
              {story.title}
            </h2>
            <div className="w-24 h-1.5 bg-kid-orange mx-auto rounded-full opacity-50"></div>
          </div>

          {/* Controls */}
          <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100 mb-8 flex flex-wrap items-center justify-between gap-4 transform transition-all hover:shadow-xl">
             <div className="flex items-center gap-2">
               <span className="text-xl">🗣️</span>
               <select 
                  value={selectedVoice}
                  onChange={handleVoiceChange}
                  className="bg-transparent font-display font-bold text-gray-700 text-lg outline-none cursor-pointer hover:text-kid-blue"
                 >
                   {AVAILABLE_VOICES.map(v => (
                     <option key={v.name} value={v.name}>{v.label}</option>
                   ))}
               </select>
             </div>

             <div className="flex items-center gap-3 flex-1 justify-center">
                <button
                  onClick={toggleAudio}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition-all transform active:scale-95 shadow-md
                    ${(playbackState === 'playing' || playbackState === 'buffering')
                      ? 'bg-kid-yellow text-yellow-900 border-2 border-yellow-400' 
                      : 'bg-kid-blue text-white border-2 border-blue-400 hover:bg-blue-400'
                    }
                  `}
                >
                  {playbackState === 'buffering' ? (
                    <span className="animate-pulse">⏳ {t.loadingAudio}</span>
                  ) : playbackState === 'playing' ? (
                    <span>⏸️ {t.stopButton.replace('Sluta', 'Pausa').replace('Stop', 'Pause')}</span>
                  ) : (
                    <span>▶️ {playbackState === 'paused' ? (language === 'sv' ? 'Fortsätt' : 'Resume') : t.listenButton}</span>
                  )}
                </button>
             </div>

             <div className="font-mono font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
               {formatTime(elapsedTime)}
             </div>
          </div>

          {/* Content */}
          <div className="prose prose-xl max-w-none text-gray-700 leading-loose font-sans story-scroll max-h-[60vh] overflow-y-auto pr-6 pl-2 relative">
            {/* Drop Cap Effect for first letter */}
            <div className="first-letter:text-6xl first-letter:font-display first-letter:font-bold first-letter:text-kid-blue first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px] whitespace-pre-line">
               {story.content}
            </div>
          </div>

          {/* Moral */}
          {story.moral && (
            <div className="mt-12 p-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl border-4 border-white shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 left-0 opacity-10 text-9xl transform -translate-x-8 -translate-y-8">✨</div>
              <div className="relative z-10 flex gap-6 items-center">
                <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">🌟</span>
                <div>
                  <h4 className="font-display font-bold text-orange-800 uppercase tracking-wider mb-2">{t.moralLabel}</h4>
                  <p className="font-sans text-xl text-orange-900 italic font-medium">"{story.moral}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t-4 border-gray-50 p-6 flex justify-center">
          <button 
            onClick={onReset}
            className="group flex items-center gap-2 text-gray-400 hover:text-kid-pink transition-colors font-bold font-display text-lg"
          >
            <span className="transform group-hover:-rotate-180 transition-transform duration-500">🔄</span>
            {t.readAgain}
          </button>
        </div>

      </div>
    </div>
  );
};