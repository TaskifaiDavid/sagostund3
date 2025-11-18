import React from 'react';
import { Mood, Language } from '../types';
import { getMoodLabel } from '../utils/localization';

interface MoodSelectorProps {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
  language: Language;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect, language }) => {
  const moods = [
    { value: Mood.HAPPY, icon: '☀️', color: 'bg-yellow-100 border-yellow-400 text-yellow-800', activeRing: 'ring-yellow-400' },
    { value: Mood.EXCITING, icon: '🚀', color: 'bg-red-100 border-red-400 text-red-800', activeRing: 'ring-red-400' },
    { value: Mood.CALM, icon: '🌙', color: 'bg-blue-100 border-blue-400 text-blue-800', activeRing: 'ring-blue-400' },
    { value: Mood.FUNNY, icon: '🤪', color: 'bg-green-100 border-green-400 text-green-800', activeRing: 'ring-green-400' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {moods.map((m) => {
        const isSelected = selectedMood === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onSelect(m.value)}
            className={`
              flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 transition-all duration-300
              ${isSelected 
                ? `${m.color} transform scale-110 -translate-y-2 shadow-xl ring-4 ring-offset-4 ring-offset-white ${m.activeRing}` 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50 hover:border-gray-200 hover:scale-105'
              }
            `}
          >
            <span className={`text-3xl mb-1 filter ${isSelected ? 'drop-shadow-md' : 'grayscale opacity-70'}`}>{m.icon}</span>
            <span className="font-display font-bold text-sm">{getMoodLabel(m.value, language)}</span>
          </button>
        );
      })}
    </div>
  );
};