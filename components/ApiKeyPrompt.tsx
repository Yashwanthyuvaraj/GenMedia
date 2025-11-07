import React from 'react';

interface ApiKeyPromptProps {
  promptForApiKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ promptForApiKey }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl max-w-md mx-auto border border-slate-700">
        <h2 className="text-2xl font-bold text-sky-400 mb-4">API Key Required</h2>
        <p className="text-slate-300 mb-6">
          To use GenMedia, you need to select an API key. This will be used for all requests to the Gemini API.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Please note that usage of the Gemini API may be subject to billing. For more information, please see the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-500 hover:underline"
          >
            billing documentation
          </a>
          .
        </p>
        <button
          onClick={promptForApiKey}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;