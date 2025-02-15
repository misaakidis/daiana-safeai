import { readFileSync } from "fs";
import { randomUUID } from "crypto";

export async function generateImage(runtime: any, prompt: string, isMeme: boolean = false) {
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

      // Get chat context if available
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

    return {
      id: randomUUID(),
      contentType: mimeType,
      data: `data:${mimeType};base64,${base64Image}`,
      title: isMeme ? "Generated meme" : "Generated image",
      source: "imageGeneration",
      description: prompt,
      text: prompt
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
} 