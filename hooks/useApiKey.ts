import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

// Assume window.aistudio is available
// Fix: Removed the conflicting global declaration for `window.aistudio`.
// The errors indicated that this type is already defined globally, and the
// local redeclaration was causing a conflict.
export const useApiKey = (isLoggedIn: boolean) => {
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const checkKey = useCallback(async () => {
    // Check for user-provided key first when outside aistudio
    if (!window.aistudio) {
      const userKey = sessionStorage.getItem('genmedia_user_api_key');
      if (userKey) {
        setIsKeyReady(true);
        return;
      }
    }

    // Persist key selection across reloads within a login session for aistudio.
    if (localStorage.getItem('genmedia_key_selected') === 'true') {
      setIsKeyReady(true);
      return;
    }

    // Fallback to the initial check if no selection is stored.
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeyReady(hasKey);
    } else {
      // If not in aistudio and no user key, it's not ready.
      setIsKeyReady(false);
    }
  }, []);

  useEffect(() => {
    // Only check for the key if the user is logged in.
    if (isLoggedIn) {
      checkKey();
    }
  }, [isLoggedIn, checkKey]);

  const handleApiError = useCallback((error: any) => {
    console.error("API Error:", error);
    
    let message = '';
    if (error && typeof error === 'object' && error.message) {
      message = String(error.message);
    } else {
      message = String(error);
    }

    const isNotFoundError = message.includes("Requested entity was not found.");
    const isBillingError = message.includes("only accessible to billed users");
    const isApiKeyNotSetError = message.includes("API key not found");
    const isInvalidKeyError = message.includes("API key not valid");


    if (isNotFoundError || isBillingError || isApiKeyNotSetError || isInvalidKeyError) {
      let reason = 'The provided API key is invalid or missing required permissions.';
      
      if (isBillingError) {
        reason = "The API key is not associated with a billed project.";
      } else if (isApiKeyNotSetError || isInvalidKeyError) {
        reason = "The API key provided is not valid.";
      }

      const instruction = "Please provide a valid API key to continue.";
      setApiKeyError(`${reason} ${instruction}`);
      
      // The key is invalid, so clear any stored selection state.
      localStorage.removeItem('genmedia_key_selected');
      sessionStorage.removeItem('genmedia_user_api_key');

      setIsKeyReady(false); // This will trigger the ApiKeyPrompt
    }
  }, []);

  const setUserProvidedApiKey = useCallback(async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;

    setIsVerifying(true);
    setApiKeyError(null);

    try {
      // Create a temporary client to test the key
      const tempAi = new GoogleGenAI({ apiKey: trimmedKey });
      // Make a simple, low-cost call to verify the key is valid and has permissions.
      await tempAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'test',
      });

      // If the call succeeds, save the key and set ready state
      sessionStorage.setItem('genmedia_user_api_key', trimmedKey);
      setIsKeyReady(true);
    } catch (err) {
      // If it fails, it's a bad key. Show the error.
      handleApiError(err);
      setIsKeyReady(false);
    } finally {
      setIsVerifying(false);
    }
  }, [handleApiError]);

  const promptForApiKey = useCallback(async () => {
    if (window.aistudio) {
      setApiKeyError(null); // Clear previous error on new attempt
      await window.aistudio.openSelectKey();
      
      localStorage.setItem('genmedia_key_selected', 'true');
      
      setIsKeyReady(true);
    }
  }, []);

  const revokeApiKey = useCallback(() => {
    localStorage.removeItem('genmedia_key_selected');
    sessionStorage.removeItem('genmedia_user_api_key');
    setIsKeyReady(false);
    setApiKeyError(null); // Clear any errors
  }, []);
  
  const getGenAiClient = useCallback(() => {
    let apiKey: string | undefined | null = process.env.API_KEY;

    // In a non-aistudio environment, the user-provided key is the source of truth.
    if (!window.aistudio) {
      apiKey = sessionStorage.getItem('genmedia_user_api_key');
    }
    
    if (!apiKey) {
        throw new Error("API key not found. Please provide one.");
    }
    return new GoogleGenAI({ apiKey });
  }, []);

  return { isKeyReady, promptForApiKey, handleApiError, getGenAiClient, apiKeyError, revokeApiKey, setUserProvidedApiKey, isVerifying };
};