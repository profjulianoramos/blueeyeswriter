
export type RibbonTabType = 'Arquivo' | 'Início' | 'Exibir' | 'Ajuda' | 'IA';
export type ThemeType = 'office-classic' | 'dark' | 'macos' | 'google-docs' | 'hacker';

export interface FileState {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  path?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface Source {
  id: string;
  author: string;
  year?: string;
  title?: string;
  site?: string;
  fullReference: string;
  createdAt: number;
}

export interface SaveLogEntry {
  id: string;
  timestamp: number; 
  summary: string;
  content: string;
}

export interface AppSettings {
  showPreview: boolean;
  spellCheck: boolean;
  autoSave: boolean;
  fontSize: number;
  isFullWidth: boolean;
  isFocusMode: boolean;
  theme: ThemeType;
  isLive?: boolean; // Novo campo
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}