import { Action } from "@elizaos/core";
import path from "path";

export const generateImageAction: Action = {
  name: "generateImage",
  description: "Generates images using Venice AI",
  similes: ["create_image", "draw_image", "make_image"],
  
  validate: async (runtime: any, message: any) => {
    const pattern = /^(?:generate|create|make|draw)\s+(?:an?\s+)?image\s+(?:of\s+)?(.+)/i;
    return pattern.test(message.content?.text || '');
  },

  handler: async (runtime: any, message: any): Promise<boolean> => {
    const text = message.content?.text || '';
    const pattern = /^(?:generate|create|make|draw)\s+(?:an?\s+)?image\s+(?:of\s+)?(.+)/i;
    const match = text.match(pattern);
    
    if (!match) return false;
    
    const prompt = match[1].trim();

    try {
      const result = await runtime.plugins.imageGeneration.generate({
        model: process.env.IMAGE_VENICE_MODEL || "flux-dev",
        prompt,
        outputDir: 'generatedImages'
      });

      const imageUrl = result.url;

      await runtime.reply({
        text: `✨ Generated image for: "${prompt}"`,
        imageUrl
      });
      
      return true;
    } catch (error) {
      console.error('Image generation error:', error);
      await runtime.reply("Sorry, I encountered an error generating the image.");
      return false;
    }
  },

  examples: [
    [
      {
        user: "{{user}}",
        content: { text: "Generate an image of a sunset" }
      },
      {
        user: "{{agent}}",
        content: { 
          text: "✨ Generated image for: \"a sunset\"",
          action: "generateImage"
        }
      }
    ]
  ]
}; 