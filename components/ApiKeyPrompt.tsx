
import React, { useState } from 'react';
import ErrorMessage from './shared/ErrorMessage';

interface ApiKeyPromptProps {
  setUserProvidedApiKey: (key: string) => Promise<void>;
  error?: string | null;
  isVerifying: boolean;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ setUserProvidedApiKey, error, isVerifying }) => {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim() && !isVerifying) {
      setUserProvidedApiKey(localApiKey.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl max-w-md mx-auto border border-slate-700">
        <h2 className="text-2xl font-bold text-sky-400 mb-4">Gemini API Key Required</h2>
        
        {error && (
            <ErrorMessage title="API Key Error" message={error} className="mb-4 text-left" />
        )}

        <p className="text-slate-300 mb-6">
          To use GenMedia, please provide your Gemini API key. Your key is stored in your browser's session storage and is only used for this session.
        </p>
        
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
              disabled={!localApiKey.trim() || isVerifying}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying Key...
                </>
              ) : 'Save and Continue'}
          </button>
        </form>
        
        <p className="text-xs text-slate-400 mt-6">
          You can get your API key from Google AI Studio. Usage may be subject to billing. For more info, see the{' '}
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
