import { DirectClient } from "@elizaos/client-direct";
import {
  AgentRuntime,
  elizaLogger,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./cache/index.ts";
import { character } from "./character.ts";
import { startChat } from "./chat/index.ts";
import { initializeClients } from "./clients/index.ts";
import {
  getTokenForProvider,
  loadCharacters,
  parseArguments,
} from "./config/index.ts";
import { initializeDatabase } from "./database/index.ts";
import { imageGenerationPlugin } from "@elizaos/plugin-image-generation";
import { generateImageAction } from "./actions/generateImage.ts";
import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer';
import { generateImage } from "./utils/imageGeneration.js";
import { MediaData } from "../packages/client-twitter/src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: any | undefined;

export function createAgent(
  character: Character,
  db: any,
  cache: any,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name,
  );

  nodePlugin ??= createNodePlugin();

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      // character.settings?.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null,
      imageGenerationPlugin,
    ].filter(Boolean),
    providers: [],
    actions: [
      generateImageAction,
    ],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    if (!token) {
      throw new Error(`No token found for provider ${character.modelProvider}`);
    }
    const dataDir = path.join(__dirname, "../data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = initializeDatabase(dataDir);

    await db.init();

    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);

    await runtime.initialize();

    runtime.clients = await initializeClients(character, runtime);

    // Enhance Twitter client after initialization
    const twitterManager = runtime.clients[1];
    if (twitterManager?.post) {
      try {
        const originalPostTweet = twitterManager.post.postTweet.bind(twitterManager.post);
        twitterManager.post.postTweet = async (
          runtime: any,
          client: any,
          text: string,
          roomId: string,
          rawContent: any,
          username: string,
          mediaData?: MediaData[]
        ) => {
          try {
            const memeWorthy = /funny|cool|awesome|wild|crazy|amazing|wow|meme/i.test(text) ||
              text.includes('😂') || text.includes('🤣');
            
            if (memeWorthy && Math.random() < 0.9) {
              const attachment = await generateImage(runtime, text, true);
              if (attachment) {
                const base64Data = attachment.data.split(',')[1];
                const meme: MediaData = {
                  data: Buffer.from(base64Data, 'base64'),
                  mediaType: attachment.contentType
                };
                mediaData = mediaData ? [...mediaData, meme] : [meme];
              }
            }
            return await originalPostTweet(runtime, client, text, roomId, rawContent, username, mediaData);
          } catch (error) {
            console.error('Twitter post error:', error);
            return await originalPostTweet(runtime, client, text, roomId, rawContent, username, mediaData);
          }
        };
      } catch (error) {
        console.error('Error setting up Twitter post enhancement:', error);
      }
    }

    directClient.registerAgent(runtime);

    // report to console
    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    return runtime;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error,
    );
    console.error(error);
    throw error;
  }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
};

const validateEnvironment = () => {
  const validEnvironments = ['development', 'production', 'test'] as const;
  type ValidEnvironment = typeof validEnvironments[number];
  
  const nodeEnv = process.env.NODE_ENV as ValidEnvironment;
  
  if (!nodeEnv) {
    elizaLogger.error('NODE_ENV is not set');
    process.exit(1);
  }

  if (!validEnvironments.includes(nodeEnv)) {
    elizaLogger.error(`Invalid NODE_ENV: ${nodeEnv}. Must be one of: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  // Log startup environment
  elizaLogger.info(`Starting server in ${nodeEnv} mode`);
  elizaLogger.info(`DAIANA_URL: ${process.env.DAIANA_URL}`);
  elizaLogger.info(`WEB_URL: ${process.env.WEB_URL}`);
};

const startAgents = async () => {
  validateEnvironment();
  
  const directClient = new DirectClient();
  let serverPort = parseInt(process.env.DAIANA_SERVER_PORT || "3000");
  const args = parseArguments();

  let charactersArg = args.characters || args.character || "characters/daiana.character.json";
  let characters = [character];

  console.log("charactersArg", charactersArg);
  if (charactersArg) {
    characters = await loadCharacters(charactersArg);
  }
  console.log("characters", characters);
  try {
    for (const character of characters) {
      await startAgent(character, directClient as DirectClient);
    }
  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
  }

  while (!(await checkPortAvailable(serverPort))) {
    elizaLogger.warn(`Port ${serverPort} is in use, trying ${serverPort + 1}`);
    serverPort++;
  }

  // upload some agent functionality into directClient
  directClient.startAgent = async (character: Character) => {
    // wrap it so we don't have to inject directClient later
    return startAgent(character, directClient);
  };

  const app = express();

  // Configure CORS
  app.use(cors({
    origin: [
      process.env.CORS_ORIGIN,
      process.env.WEB_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
  }));

  directClient.start(serverPort);

  if (serverPort !== parseInt(process.env.DAIANA_SERVER_PORT || "3000")) {
    elizaLogger.log(`Server started on alternate port ${serverPort}`);
  }

  const isDaemonProcess = process.env.DAEMON_PROCESS === "true";
  if(!isDaemonProcess) {
    elizaLogger.log("Chat started. Type 'exit' to quit.");
    const chat = startChat(characters);
    chat();
  }
};

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", {
    message: error.message,
    name: error.name,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack, // Only log stack in non-production
  });
  process.exit(1);
});
