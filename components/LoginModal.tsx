import React, { useState } from 'react';
import { Button } from './Button';
import { Language } from '../types';
import { translations } from '../utils/localization';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string, password: string) => void;
  onClose: () => void;
  language: Language;
  error?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, onClose, language, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username, password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 p-8 rounded-[3rem] shadow-2xl border-4 border-kid-blue max-w-md w-full relative overflow-hidden animate-bounce-slight">
        {/* Decoration */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-kid-blue to-kid-teal"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-display font-bold text-kid-blue">{t.loginTitle}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-xl text-center text-sm font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-600 font-bold mb-2 ml-2 uppercase text-xs tracking-wider">
              {t.loginNameLabel}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.loginPlaceholder}
              className="w-full p-4 text-lg font-sans bg-blue-50 border-2 border-blue-100 rounded-2xl focus:border-kid-pink focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-600 font-bold mb-2 ml-2 uppercase text-xs tracking-wider">
              {t.loginPasswordLabel}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full p-4 text-lg font-sans bg-blue-50 border-2 border-blue-100 rounded-2xl focus:border-kid-pink focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div className="flex justify-center pt-2">
            <Button onClick={() => {}} disabled={!username.trim() || !password.trim()} className="w-full">
              {t.loginButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
