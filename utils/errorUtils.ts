import React from 'react';

export interface ParsedError {
  title: string;
  message: string;
  details: React.ReactNode | null;
}

export const parseGeminiError = (err: any, context: string): ParsedError => {
  const defaultTitle = `Failed to ${context}`;
  const defaultMessage = `An unexpected error occurred while trying to ${context}. This could be due to a network issue or a problem with the API configuration.`;
  
  const result: ParsedError = {
    title: defaultTitle,
    message: defaultMessage,
    details: null
  };

  const errStr = err?.message?.toLowerCase() || JSON.stringify(err).toLowerCase();

  if (errStr.includes("api key not valid") || errStr.includes("api_key_invalid")) {
    result.title = "API Configuration Error";
    result.message = "The API key provided for this application is invalid or missing.";
    // FIX: Replaced JSX with React.createElement to be compatible with .ts file extension.
    result.details = React.createElement('p', null, "Please ensure the Gemini API key is correctly configured in the application's environment settings.");
  } else if (errStr.includes("billed users") || errStr.includes("billing")) {
    result.title = "Billing Required";
    result.message = "This feature requires the API key to be associated with a billed Google Cloud project.";
    // FIX: Replaced JSX with React.createElement to be compatible with .ts file extension.
    result.details = React.createElement('p', null, 
      'Please enable billing for the project associated with your API key. See the ',
      React.createElement('a', {
        href: "https://ai.google.dev/gemini-api/docs/billing",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-sky-400 hover:underline font-semibold"
      }, 'billing documentation'),
      ' for more details.'
    );
  } else if (errStr.includes("429") || errStr.includes("rate limit") || errStr.includes("quota")) {
    result.title = "Quota Exceeded";
    result.message = "You have exceeded the available quota for the Gemini API.";
    // FIX: Replaced JSX with React.createElement to be compatible with .ts file extension.
    result.details = React.createElement('p', null, 'Please check your usage limits in the Google AI Studio dashboard or try again later.');
  } else if (errStr.includes("network") || errStr.includes("fetch")) {
    result.title = "Network Error";
    result.message = "A network error occurred. Please check your internet connection and try again.";
  } else if (errStr.includes("permissiondeniederror") || errStr.includes("notallowederror")) {
      result.title = "Permission Denied";
      result.message = "Microphone access was denied.";
      // FIX: Replaced JSX with React.createElement to be compatible with .ts file extension.
      result.details = React.createElement('p', null, 'To use audio features, please enable microphone permissions for this site in your browser settings and try again.');
  }

  return result;
};
