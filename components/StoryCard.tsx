import React, { useState, useRef, useEffect } from 'react';
import { StoryResponse } from '../types';
import { generateStorySpeech } from '../services/geminiService';
import { decodeBase64, decodePcmAudioData } from '../utils/audioUtils';

interface StoryCardProps {
  story: StoryResponse;
  onReset: () => void;
}

const AVAILABLE_VOICES = [
  { name: 'Zephyr', label: 'Zephyr (Ljus)' },
  { name: 'Kore', label: 'Kore (Lugn)' },
  { name: 'Puck', label: 'Puck (Busig)' },
  { name: 'Charon', label: 'Charon (Djup)' },
  { name: 'Fenrir', label: 'Fenrir (Mörk)' },
];

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const StoryCard: React.FC<StoryCardProps> = ({ story, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const currentVoiceRef = useRef<string>('Zephyr');

  // Cleanup audio on unmount
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

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoice = e.target.value;
    setSelectedVoice(newVoice);
    
    // If playing, stop
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    }

    // If the voice changed, clear the buffer so we fetch new audio
    if (newVoice !== currentVoiceRef.current) {
      audioBufferRef.current = null;
      currentVoiceRef.current = newVoice;
    }
  };

  const toggleAudio = async () => {
    // STOP
    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // PLAY
    try {
      setIsAudioLoading(true);

      // Initialize AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Check cache
      let buffer = audioBufferRef.current;

      if (!buffer) {
        // Fetch new audio
        const base64Audio = await generateStorySpeech(story.title + ". " + story.content, selectedVoice);
        const pcmData = decodeBase64(base64Audio);
        buffer = await decodePcmAudioData(pcmData, audioContextRef.current);
        audioBufferRef.current = buffer;
      }

      // Browser requires resume on user interaction
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setIsPlaying(false);
      
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);

    } catch (error) {
      console.error("Audio playback error:", error);
      alert("Kunde inte spela upp ljudet just nu.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn w-full max-w-3xl mx-auto mt-8 p-1 pb-20">
      <div className="bg-story-paper rounded-3xl shadow-xl border-4 border-kid-orange overflow-hidden relative">
        {/* Decoration Dots */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-kid-red"></div>
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-kid-blue"></div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-8 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 font-sans leading-tight">
              {story.title}
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-3 bg-white p-2 rounded-full border border-gray-200 shadow-sm">
              <div className="flex items-center px-2">
                 <span className="text-sm font-bold text-gray-500 mr-2">Röst:</span>
                 <select 
                  value={selectedVoice}
                  onChange={handleVoiceChange}
                  className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer hover:text-kid-orange transition-colors"
                 >
                   {AVAILABLE_VOICES.map(v => (
                     <option key={v.name} value={v.name}>{v.label}</option>
                   ))}
                 </select>
              </div>

              <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

              <button
                onClick={toggleAudio}
                disabled={isAudioLoading}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all text-sm md:text-base min-w-[160px] justify-center
                  ${isPlaying 
                    ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200' 
                    : 'bg-kid-green/10 text-green-700 border border-kid-green/50 hover:bg-kid-green/20'
                  }
                `}
              >
                {isAudioLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Laddar...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <StopIcon />
                    <span>Sluta lyssna</span>
                  </>
                ) : (
                  <>
                    <SpeakerIcon />
                    <span>Lyssna</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line story-scroll max-h-[60vh] overflow-y-auto pr-4">
            {story.content}
          </div>

          {story.moral && (
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border-2 border-amber-200 flex gap-4 items-start">
              <span className="text-3xl">🌟</span>
              <div>
                <h4 className="font-bold text-amber-800 uppercase text-sm tracking-wider mb-1">Sensmoral</h4>
                <p className="text-amber-900 italic">{story.moral}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-amber-100 p-4 flex justify-center">
          <button 
            onClick={onReset}
            className="text-amber-800 font-bold hover:text-amber-900 underline decoration-2 decoration-amber-400 underline-offset-4"
          >
            Läsa en till saga?
          </button>
        </div>
      </div>
    </div>
  );
};