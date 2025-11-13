
import { GoogleGenAI } from '@google/genai';
import { useCallback } from 'react';

// A simple in-memory cache for the client instance.
let genAIClient: GoogleGenAI | null = null;

export const useApiKey = () => {

  const getGenAiClient = useCallback(() => {
    // Per guidelines, assume process.env.API_KEY is pre-configured and valid.
    
    // Use cached client if available.
    if (genAIClient) {
      return genAIClient;
    }

    // Initialize the client. The key is injected by the environment.
    genAIClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return genAIClient;
  }, []);

  return { 
    getGenAiClient 
  };
};
