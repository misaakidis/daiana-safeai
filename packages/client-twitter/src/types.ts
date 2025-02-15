export type MediaData = {
  data: Buffer;
  mediaType: string;
};

export type MemeContext = {
  topic: string;
  mood?: string;
  isViral?: boolean;
  recentTweets?: string[];
};

export type GeneratedMeme = {
  buffer: Buffer;
  prompt: string;
  mediaType: string;
}; 