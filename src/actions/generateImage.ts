import { Action } from "@elizaos/core";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

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

    try {
      let contextualPrompt = prompt;
      
      if (isMeme) {
        // Get recent messages from the conversation
        const recentMessages = runtime.memory?.getRecentMessages?.(5) || [];
        const conversationContext = recentMessages
          .map(msg => {
            const sender = msg.user === runtime.agentId ? 'Assistant' : 'User';
            return `${sender}: ${msg.content?.text || ''}`;
          })
          .filter(Boolean)
          .join('\n');

        // Get chat context if available (especially for Telegram)
        const chatContext = runtime.chatContext || {};
        const { chatTitle, chatType } = chatContext;
        const currentTopic = runtime.memory?.getCurrentTopic?.() || '';
        
        contextualPrompt = `Create a humorous meme for a ${chatType || 'chat'} conversation${chatTitle ? ` in "${chatTitle}"` : ''}.
Topic: ${currentTopic}
Recent conversation:
${conversationContext}
Specific request: ${prompt}
Make the meme funny and relevant to this specific chat conversation.`;
      }

      const result = await runtime.plugins.imageGeneration.generate({
        model: process.env.IMAGE_VENICE_MODEL || "flux-dev",
        prompt: contextualPrompt,
        outputDir: 'generatedImages'
      });

      const imageBuffer = readFileSync(result.url);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = 'image/png';

      await runtime.reply({
        text: `✨ Generated ${isMeme ? 'meme' : 'image'} for: "${prompt}"`,
        attachments: [{
          id: randomUUID(),
          contentType: mimeType,
          data: `data:${mimeType};base64,${base64Image}`,
          title: isMeme ? "Generated meme" : "Generated image",
          source: "imageGeneration",
          description: prompt,
          text: prompt
        }]
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
      { user: "{{user}}", content: { text: "Generate an image of a sunset" }},
      { user: "{{agent}}", content: { text: "✨ Generated image for: \"a sunset\"", action: "generateImage" }}
    ],
    [
      { user: "{{user}}", content: { text: "Generate a meme about cats" }},
      { user: "{{agent}}", content: { text: "✨ Generated meme for: \"cats\"", action: "generateImage" }}
    ]
  ]
}; 