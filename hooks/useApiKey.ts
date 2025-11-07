import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

// Assume window.aistudio is available
// Fix: Removed the conflicting global declaration for `window.aistudio`.
// The errors indicated that this type is already defined globally, and the
// local redeclaration was causing a conflict.
export const useApiKey = (isLoggedIn: boolean) => {
  const [isKeyReady, setIsKeyReady] = useState(false);

  const checkKey = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeyReady(hasKey);
    } else {
        // Fallback for environments where aistudio is not present
        setIsKeyReady(!!process.env.API_KEY);
    }
  }, []);

  useEffect(() => {
    // Only check for the key if the user is logged in.
    if (isLoggedIn) {
      checkKey();
    }
  }, [isLoggedIn, checkKey]);

  const promptForApiKey = useCallback(async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success after prompt to handle race condition
      setIsKeyReady(true); 
    }
  }, []);

  const handleApiError = useCallback((error: any) => {
    console.error("API Error:", error);
    
    // Extract the error message reliably, whether it's an Error object or an API response object.
    let message = '';
    if (error && typeof error === 'object' && error.message) {
      message = String(error.message);
    } else {
      message = String(error);
    }

    const isNotFoundError = message.includes("Requested entity was not found.");
    const isBillingError = message.includes("only accessible to billed users");

    if (isNotFoundError || isBillingError) {
      const reason = isBillingError 
        ? "API key is not associated with a billed project."
        : "API key may be invalid or missing.";
      console.log(`${reason} Prompting user to select a new key.`);
      setIsKeyReady(false); // This will trigger the ApiKeyPrompt
    }
  }, []);
  
  const getGenAiClient = useCallback(() => {
    if (!process.env.API_KEY) {
        // This case should ideally be handled by the isKeyReady check
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }, []);

  return { isKeyReady, promptForApiKey, handleApiError, getGenAiClient };
};