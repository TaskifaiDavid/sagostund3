import React, { useState } from 'react';
import { generateStory } from './services/geminiService';
import { StoryState, Mood, Language } from './types';
import { Button } from './components/Button';
import { StoryCard } from './components/StoryCard';
import { MoodSelector } from './components/MoodSelector';
import { translations } from './utils/localization';

// Decorative Background Elements
const Cloud = ({ className }: { className: string }) => (
  <div className={`absolute pointer-events-none opacity-80 ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-white w-full h-full filter drop-shadow-lg">
      <path d="M17.5,19c4.142,0,7.5-3.358,7.5-7.5c0-4.142-3.358-7.5-7.5-7.5c-0.716,0-1.398,0.112-2.033,0.308 C14.599,1.753,11.961,0,9,0C4.582,0,1,3.582,1,8c0,0.309,0.021,0.613,0.058,0.913C0.422,9.42,0,10.173,0,11c0,2.209,1.791,4,4,4 c0.146,0,0.288-0.011,0.428-0.027C5.119,17.298,7.343,19,10,19c0.363,0,0.717-0.032,1.062-0.091C12.386,20.729,14.772,22,17.5,22 c2.879,0,5.25-1.429,6.424-3.612C22.577,18.767,20.966,19,17.5,19z" />
    </svg>
  </div>
);

const Star = ({ className }: { className: string }) => (
  <div className={`absolute text-yellow-300 animate-twinkle pointer-events-none ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full filter drop-shadow-md">
      <path d="M12 0.587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
    </svg>
  </div>
);

const LoadingCloud: React.FC<{ text: string, subtext: string }> = ({ text, subtext }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-float-slow">
    <div className="relative">
      <div className="text-8xl relative z-10">☁️</div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-spin">✨</div>
    </div>
    <div className="bg-white/90 backdrop-blur-sm px-8 py-4 rounded-3xl shadow-xl text-center border-4 border-white">
      <p className="text-2xl font-display font-bold text-kid-blue mb-2">
        {text}
      </p>
      <p className="text-lg text-gray-500 font-sans">{subtext}</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [mood, setMood] = useState<Mood>(Mood.HAPPY);
  const [language, setLanguage] = useState<Language>('sv');
  const [storyState, setStoryState] = useState<StoryState>({
    isLoading: false,
    data: null,
    error: null,
  });

  const t = translations[language];

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setStoryState({ isLoading: true, data: null, error: null });
    
    try {
      const result = await generateStory(input, mood, language);
      setStoryState({ isLoading: false, data: result, error: null });
    } catch (error) {
      setStoryState({ 
        isLoading: false, 
        data: null, 
        error: error instanceof Error ? error.message : t.errorGeneric 
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
    <div className="relative min-h-screen pb-20 overflow-hidden">
      
      {/* Animated Background Elements */}
      <Cloud className="w-32 h-20 top-10 left-10 animate-float-slow opacity-60" />
      <Cloud className="w-48 h-32 top-20 right-20 animate-float-medium opacity-40" />
      <Cloud className="w-24 h-16 bottom-32 left-1/4 animate-float-slow delay-75 opacity-50" />
      <Star className="w-8 h-8 top-32 left-1/3 delay-100" />
      <Star className="w-6 h-6 top-12 right-1/3 delay-300" />
      <Star className="w-10 h-10 bottom-20 right-20 delay-500" />

      {/* Header */}
      <header className="relative z-10 pt-6 px-4 mb-8">
        <div className="container mx-auto flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg border-2 border-white">
          <div className="flex items-center gap-3 pl-2">
            <span className="text-4xl animate-bounce-slight">🏰</span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-kid-blue tracking-wide">
              {t.appTitle}
            </h1>
          </div>
          
          {/* Language Switcher */}
          <div className="flex gap-1 bg-blue-50 p-1 rounded-full border border-blue-100">
             <button 
              onClick={() => setLanguage('sv')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all transform ${language === 'sv' ? 'bg-white text-kid-blue shadow-md scale-105' : 'text-gray-400 hover:text-kid-blue'}`}
             >
               🇸🇪 SV
             </button>
             <button 
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all transform ${language === 'en' ? 'bg-white text-kid-blue shadow-md scale-105' : 'text-gray-400 hover:text-kid-blue'}`}
             >
               🇬🇧 EN
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {!storyState.data && !storyState.isLoading && (
          <div className="w-full max-w-2xl animate-fade-in-up">
            
            <div className="text-center mb-8 text-white drop-shadow-md">
              <h2 className="text-4xl font-display font-bold mb-2">
                {t.greeting}
              </h2>
              <p className="text-xl font-sans font-medium opacity-95">
                {t.promptQuestion}
              </p>
            </div>

            {/* Magic Input Card */}
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-2xl border-4 border-white transform transition-all hover:scale-[1.01]">
              <div className="space-y-8">
                
                {/* Text Input */}
                <div className="relative group">
                  <label className="block text-kid-blue font-display font-bold mb-3 ml-4 text-lg uppercase tracking-wider">
                    {t.promptLabel}
                  </label>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.promptPlaceholder}
                      className="w-full p-6 text-xl font-sans text-gray-700 bg-blue-50 border-2 border-blue-100 rounded-3xl focus:border-kid-pink focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none h-40 placeholder-blue-200 shadow-inner"
                    />
                    <div className="absolute -top-3 -right-3 text-4xl animate-bounce-slight opacity-0 group-hover:opacity-100 transition-opacity">
                      🧚‍♀️
                    </div>
                  </div>
                </div>

                {/* Mood Selection */}
                <div>
                  <label className="block text-kid-blue font-display font-bold mb-4 text-center text-lg uppercase tracking-wider">
                    {t.moodLabel}
                  </label>
                  <MoodSelector selectedMood={mood} onSelect={setMood} language={language} />
                </div>

                {/* Action Button */}
                <div className="pt-4 flex justify-center">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!input.trim()}
                    className="w-full md:w-auto min-w-[200px]"
                  >
                    <span className="text-2xl mr-2">✨</span>
                    {t.generateButton}
                  </Button>
                </div>
              </div>
            </div>

            {/* Inspiration Pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {t.examples.map((ex, i) => (
                 <button 
                  key={i} 
                  className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 text-white font-bold text-sm shadow-lg hover:bg-white hover:text-kid-blue hover:scale-105 transition-all" 
                  onClick={() => setInput(ex.substring(2))}
                 >
                   {ex}
                 </button>
              ))}
            </div>
          </div>
        )}

        {storyState.isLoading && <LoadingCloud text={t.loadingTitle} subtext={t.loadingSubtitle} />}

        {storyState.error && (
          <div className="bg-red-50 border-4 border-red-200 p-8 rounded-[2rem] max-w-lg mt-8 shadow-xl text-center">
            <span className="text-6xl block mb-4">🥺</span>
            <h3 className="font-display font-bold text-2xl text-red-500 mb-2">{t.errorTitle}</h3>
            <p className="text-red-400 font-sans text-lg mb-4">{storyState.error}</p>
            <Button onClick={() => setStoryState(prev => ({...prev, error: null}))} variant="secondary">
              {t.retry}
            </Button>
          </div>
        )}

        {storyState.data && (
          <StoryCard story={storyState.data} onReset={resetStory} language={language} />
        )}

      </main>
    </div>
  );
};

export default App;