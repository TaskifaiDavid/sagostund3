export interface StoryResponse {
  title: string;
  content: string;
  moral?: string;
}

export interface StoryState {
  isLoading: boolean;
  data: StoryResponse | null;
  error: string | null;
}

export enum Mood {
  HAPPY = 'Glad',
  EXCITING = 'Spännande',
  CALM = 'Lugn',
  FUNNY = 'Rolig',
}