import { Language, Mood } from '../types';

export const translations = {
  sv: {
    appTitle: 'Sagostund',
    greeting: 'Hej kompis! 👋',
    promptQuestion: 'Vad ska kvällens godnattsaga handla om?',
    promptLabel: 'Berätta lite kort...',
    promptPlaceholder: 'T.ex. En liten drake som tappade en tand...',
    moodLabel: 'Vilken känsla?',
    generateButton: 'Skapa Saga',
    loadingTitle: 'Sago-fen tänker så det knakar...',
    loadingSubtitle: 'Häller upp lite magi...',
    errorTitle: 'Hoppsan!',
    errorGeneric: 'Något gick fel.',
    retry: 'Försök igen',
    voiceLabel: 'Röst:',
    listenButton: 'Lyssna',
    stopButton: 'Sluta lyssna',
    loadingAudio: 'Laddar...',
    moralLabel: 'Sensmoral',
    readAgain: 'Läsa en till saga?',
    moods: {
      [Mood.HAPPY]: 'Glad',
      [Mood.EXCITING]: 'Spännande',
      [Mood.CALM]: 'Lugn',
      [Mood.FUNNY]: 'Knäpp',
    },
    examples: [
      '🦄 En enhörning som inte kunde flyga',
      '🐻 En björn som älskade blåbär',
      '🚀 En resa till månen av ost'
    ]
  },
  en: {
    appTitle: 'Storytime',
    greeting: 'Hi friend! 👋',
    promptQuestion: 'What should tonight\'s bedtime story be about?',
    promptLabel: 'Tell me a little bit...',
    promptPlaceholder: 'E.g. A little dragon who lost a tooth...',
    moodLabel: 'Which mood?',
    generateButton: 'Create Story',
    loadingTitle: 'The Story Fairy is thinking hard...',
    loadingSubtitle: 'Pouring some magic...',
    errorTitle: 'Whoops!',
    errorGeneric: 'Something went wrong.',
    retry: 'Try again',
    voiceLabel: 'Voice:',
    listenButton: 'Listen',
    stopButton: 'Stop listening',
    loadingAudio: 'Loading...',
    moralLabel: 'Moral',
    readAgain: 'Read another story?',
    moods: {
      [Mood.HAPPY]: 'Happy',
      [Mood.EXCITING]: 'Exciting',
      [Mood.CALM]: 'Calm',
      [Mood.FUNNY]: 'Silly',
    },
    examples: [
      '🦄 A unicorn who couldn\'t fly',
      '🐻 A bear who loved blueberries',
      '🚀 A trip to the moon made of cheese'
    ]
  }
};

export const getMoodLabel = (mood: Mood, lang: Language): string => {
  return translations[lang].moods[mood] || mood;
};
