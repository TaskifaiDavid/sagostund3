import React, { useState } from 'react';
import { generateStory } from './services/geminiService';
import { StoryState, Mood } from './types';
import { Button } from './components/Button';
import { StoryCard } from './components/StoryCard';
import { MoodSelector } from './components/MoodSelector';

// SVG Icons for UI
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-white">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const LoadingCloud = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-6">
    <div className="relative">
      <div className="w-24 h-24 border-8 border-kid-blue border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
    </div>
    <p className="text-xl font-bold text-kid-blue animate-pulse text-center">
      Sago-fen tänker så det knakar...<br/>
      <span className="text-base font-normal text-gray-500">Häller upp lite magi...</span>
    </p>
  </div>
);

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [mood, setMood] = useState<Mood>(Mood.HAPPY);
  const [storyState, setStoryState] = useState<StoryState>({
    isLoading: false,
    data: null,
    error: null,
  });

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setStoryState({ isLoading: true, data: null, error: null });
    
    try {
      const result = await generateStory(input, mood);
      setStoryState({ isLoading: false, data: result, error: null });
    } catch (error) {
      setStoryState({ 
        isLoading: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'Något gick fel.' 
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const resetStory = () => {
    setStoryState({ isLoading: false, data: null, error: null });
    setInput('');
  };

  return (
    <div className="min-h-screen bg-story-bg pb-20">
      {/* Header */}
      <header className="bg-kid-orange shadow-md relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <BookIcon />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-md">
            Sagostund
          </h1>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-6 bg-kid-orange rounded-b-[50%] transform scale-x-110"></div>
      </header>

      <main className="container mx-auto px-4 pt-12 md:pt-16 flex flex-col items-center">
        
        {!storyState.data && !storyState.isLoading && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">
                Hej kompis! 👋
              </h2>
              <p className="text-gray-600 text-lg">
                Vad ska kvällens godnattsaga handla om?
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-2 border-orange-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2 ml-2 text-sm uppercase tracking-wider">
                    Berätta lite kort...
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="T.ex. En liten drake som tappade en tand..."
                    className="w-full p-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-kid-orange focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none h-32 placeholder-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2 ml-2 text-sm uppercase tracking-wider text-center">
                    Vilken känsla?
                  </label>
                  <MoodSelector selectedMood={mood} onSelect={setMood} />
                </div>

                <div className="pt-4 flex justify-center">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!input.trim()}
                    className="flex items-center gap-2 px-10 py-4 text-xl"
                  >
                    <SparklesIcon />
                    <span>Skapa Saga</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Example Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="px-3 py-1 bg-white rounded-full border border-gray-200">🦄 En enhörning som inte kunde flyga</span>
              <span className="px-3 py-1 bg-white rounded-full border border-gray-200">🐻 En björn som älskade blåbär</span>
              <span className="px-3 py-1 bg-white rounded-full border border-gray-200">🚀 En resa till månen av ost</span>
            </div>
          </div>
        )}

        {storyState.isLoading && <LoadingCloud />}

        {storyState.error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl max-w-lg mt-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🥺</span>
              <div>
                <h3 className="font-bold text-red-800">Hoppsan!</h3>
                <p className="text-red-700">{storyState.error}</p>
                <button 
                  onClick={() => setStoryState(prev => ({...prev, error: null}))}
                  className="text-red-600 underline mt-2 font-bold"
                >
                  Försök igen
                </button>
              </div>
            </div>
          </div>
        )}

        {storyState.data && (
          <StoryCard story={storyState.data} onReset={resetStory} />
        )}

      </main>
    </div>
  );
};

export default App;