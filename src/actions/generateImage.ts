import { Action } from "@elizaos/core";
import { generateImage } from "../utils/imageGeneration.js";

export const generateImageAction: Action = {
  name: "generateImage",
  description: "Generates images or memes using Venice AI",
  similes: ["create_image", "draw_image", "make_image", "generate_meme", "create_meme"],
  
  validate: async (runtime: any, message: any) => {
    const pattern = /^(?:generate|create|make|draw)\s+(?:an?\s+)?(?:image|meme)\s+(?:of\s+)?(.+)/i;
    return pattern.test(message.content?.text || '');
  },

  handler: async (runtime: any, message: any): Promise<boolean> => {
    const text = message.content?.text || '';
    const pattern = /^(?:generate|create|make|draw)\s+(?:an?\s+)?(?:image|meme)\s+(?:of\s+)?(.+)/i;
    const match = text.match(pattern);
    
    if (!match) return false;
    
    const prompt = match[1].trim();
    const isMeme = text.toLowerCase().includes('meme');

    const attachment = await generateImage(runtime, prompt, isMeme);
    if (!attachment) {
      await runtime.reply("Sorry, I encountered an error generating the image.");
      return false;
    }

    await runtime.reply({
      text: `✨ Generated ${isMeme ? 'meme' : 'image'} for: "${prompt}"`,
      attachments: [attachment]
    });
    
    return true;
  },

  examples: [
    [
      { user: "{{user}}", content: { text: "Generate an image of a sunset" }},
      { user: "{{agent}}", content: { text: "✨ Generated image for: \"a sunset\"", action: "generateImage" }}
    ],
    [
      { user: "{{user}}", content: { text: "Generate a meme about cats" }},
      { user: "{{agent}}", content: { text: "✨ Generated meme for: \"cats\"", action: "generateImage" }}
    ]
  ]
}; 