import React, { useState } from 'react';
import ErrorMessage from './shared/ErrorMessage';

interface ApiKeyPromptProps {
  promptForApiKey: () => void;
  setUserProvidedApiKey: (key: string) => void;
  error?: string | null;
  isAistudioAvailable: boolean;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ promptForApiKey, setUserProvidedApiKey, error, isAistudioAvailable }) => {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim()) {
      setUserProvidedApiKey(localApiKey.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl max-w-md mx-auto border border-slate-700">
        <h2 className="text-2xl font-bold text-sky-400 mb-4">API Key Required</h2>
        
        {error && (
            <ErrorMessage title="API Key Error" message={error} className="mb-4 text-left" />
        )}

        <p className="text-slate-300 mb-6">
          To use GenMedia, you need a Gemini API key.
        </p>

        {isAistudioAvailable ? (
          <>
            <p className="text-slate-300 mb-6">
              Please select an API key to use for all requests to the Gemini API.
            </p>
            <button
              onClick={promptForApiKey}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Select API Key
            </button>
          </>
        ) : (
          <>
            <div className="bg-slate-700/50 text-slate-300 text-sm p-3 rounded-md mb-4 text-left" role="alert">
                <strong>Deployment Notice:</strong> Since this app is not running in Google AI Studio, please provide your own Gemini API key. Your key is stored only in your browser's session storage.
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Enter your Gemini API Key"
                  className="shadow appearance-none border rounded w-full py-3 px-4 bg-slate-700 border-slate-600 text-slate-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-sky-500"
                  required
                  autoComplete="off"
              />
              <button
                  type="submit"
                  disabled={!localApiKey.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                  Save and Continue
              </button>
            </form>
          </>
        )}
        
        <p className="text-xs text-slate-400 mt-6">
          Usage of the Gemini API may be subject to billing. For more information, please see the{' '}
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
      </div>
    </div>
  );
};

export default ApiKeyPrompt;
