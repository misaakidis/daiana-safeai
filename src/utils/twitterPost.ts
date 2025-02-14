import { readFileSync } from "fs";

export async function enhanceTweet(text: string, runtime: any) {
  try {
    // Skip meme generation for certain types of tweets
    if (text.toLowerCase().includes('generated') || text.length < 10) {
      return { text };
    }

    const result = await runtime.plugins.imageGeneration.generate({
      model: process.env.IMAGE_VENICE_MODEL || "flux-dev",
      prompt: `Create a viral meme about: ${text}`,
      outputDir: 'generatedImages'
    });

    const imageBuffer = readFileSync(result.url);
    const base64Image = imageBuffer.toString('base64');
    
    return {
      text,
      media: [{
        data: base64Image,
        type: 'image/png'
      }]
    };
  } catch (error) {
    console.error('Tweet enhancement error:', error);
    return { text };
  }
} 