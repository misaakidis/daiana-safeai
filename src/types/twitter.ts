export interface TwitterClient {
  enhancePost: (text: string) => Promise<{
    text: string;
    media?: Array<{
      data: string;
      type: string;
    }>;
  }>;
} 