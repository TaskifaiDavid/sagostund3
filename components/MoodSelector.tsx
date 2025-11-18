import React from 'react';
import { Mood } from '../types';

interface MoodSelectorProps {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect }) => {
  const moods = [
    { value: Mood.HAPPY, label: 'Glad', icon: '☀️', color: 'bg-yellow-100 border-yellow-300' },
    { value: Mood.EXCITING, label: 'Spännande', icon: '🚀', color: 'bg-red-100 border-red-300' },
    { value: Mood.CALM, label: 'Lugn', icon: '🌙', color: 'bg-blue-100 border-blue-300' },
    { value: Mood.FUNNY, label: 'Knäpp', icon: '🤪', color: 'bg-green-100 border-green-300' },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {moods.map((m) => (
        <button
          key={m.value}
          onClick={() => onSelect(m.value)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all
            ${selectedMood === m.value ? `${m.color} scale-105 shadow-md ring-2 ring-offset-2 ring-kid-orange` : 'bg-white border-gray-200 hover:bg-gray-50'}
          `}
        >
          <span className="text-2xl">{m.icon}</span>
          <span className="font-bold text-gray-700">{m.label}</span>
        </button>
      ))}
    </div>
  );
};