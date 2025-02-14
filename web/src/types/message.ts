export interface Message {
  id?: string;
  content: {
    text: string;
  };
  imageUrl?: string;
  user: string;
  timestamp?: number;
} 