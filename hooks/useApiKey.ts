import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

export const useApiKey = () => {
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // The key is considered "ready" until an API call fails and sets an error.
  const isKeyReady = !apiKeyError;

  const handleApiError = useCallback((error: any) => {
    console.error("API Error:", error);
    
    let message = '';
    if (error && typeof error === 'object' && error.message) {
      message = String(error.message);
    } else {
      message = String(error);
    }

    const isKeyRelatedError = /API key not found|API key not valid|billed user|Requested entity was not found/i.test(message);

    if (isKeyRelatedError) {
      setApiKeyError('The application is not configured correctly with a valid API key. Please contact the administrator.');
    }
    // Other, non-key-related errors are considered transient and will be handled by component-level error states without locking the entire app.
  }, []);
  
  const getGenAiClient = useCallback(() => {
    // The app now relies exclusively on the pre-configured environment variable for the API key.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      const errMsg = "API key is not configured in the application environment.";
      // Set the persistent error state to block the UI.
      setApiKeyError('The application is not configured correctly. API key is missing.');
      throw new Error(errMsg);
    }
    return new GoogleGenAI({ apiKey });
  }, []);
  
  return { isKeyReady, handleApiError, getGenAiClient, apiKeyError };
};
