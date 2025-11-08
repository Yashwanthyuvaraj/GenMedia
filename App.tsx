import React, { useState, useCallback } from 'react';
import { Tab } from './types';
import { useApiKey } from './hooks/useApiKey';
import { checkAuthStatus, logout } from './api/auth';
import { useIdleTimer } from './hooks/useIdleTimer';

import ApiKeyPrompt from './components/ApiKeyPrompt';
import ImageAnalysis from './components/ImageAnalysis';
import AudioTranscription from './components/AudioTranscription';
import VideoAnalysis from './components/VideoAnalysis';
import ImageGeneration from './components/ImageGeneration';
import TabButton from './components/shared/TabButton';
import Auth from './components/Auth';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(checkAuthStatus().isLoggedIn);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ImageAnalysis);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isKeyReady, promptForApiKey, handleApiError, getGenAiClient, apiKeyError, revokeApiKey, setUserProvidedApiKey, isVerifying } = useApiKey(isLoggedIn);

  const handleLogout = useCallback(() => {
    logout();
    // Also revoke the key to ensure a clean state for the next login
    revokeApiKey();
    setIsLoggedIn(false);
  }, [revokeApiKey]);

  // Auto-logout after 30 minutes of inactivity
  useIdleTimer(handleLogout, 30 * 60 * 1000, isLoggedIn);
  
  if (!isLoggedIn) {
    return <Auth onAuthSuccess={() => setIsLoggedIn(true)} />;
  }
  
  const isAistudioAvailable = !!window.aistudio;
  
  if (!isKeyReady) {
    return <ApiKeyPrompt 
      promptForApiKey={promptForApiKey} 
      setUserProvidedApiKey={setUserProvidedApiKey}
      error={apiKeyError} 
      isAistudioAvailable={isAistudioAvailable}
      isVerifying={isVerifying}
    />;
  }
  
  const renderContent = () => {
    const props = { getGenAiClient, handleApiError };
    switch (activeTab) {
      case Tab.ImageAnalysis:
        return <ImageAnalysis {...props} />;
      case Tab.AudioTranscription:
        return <AudioTranscription {...props} />;
      case Tab.VideoAnalysis:
        return <VideoAnalysis {...props} />;
      case Tab.ImageGeneration:
        return <ImageGeneration {...props} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: Tab.ImageAnalysis, label: 'Image Analysis', icon: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> },
    { id: Tab.AudioTranscription, label: 'Audio Transcription', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z" /> },
    { id: Tab.VideoAnalysis, label: 'Video Analysis', icon: <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /> },
    { id: Tab.ImageGeneration, label: 'Image Generation', icon: <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 8.25 1.5 1.5m-7.5-3 3 3m-7.5 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v7.5A2.25 2.25 0 0 0 4.5 16.5Z" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
       <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10 py-4 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sky-400">
              <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
              <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
            </svg>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 text-transparent bg-clip-text">GenMedia</h1>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition duration-300"
              aria-label="Settings"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226a11.98 11.98 0 0 1 2.59 0c.55.219 1.02.684 1.11 1.226a11.98 11.98 0 0 1 0 2.59c-.09.542-.56 1.007-1.11 1.226a11.98 11.98 0 0 1-2.59 0c-.55-.219-1.02-.684-1.11-1.226a11.98 11.98 0 0 1 0-2.59Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-8">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
        
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onChangeKey={isAistudioAvailable ? promptForApiKey : revokeApiKey}
        onRevokeKey={revokeApiKey}
        isAistudioAvailable={isAistudioAvailable}
      />
    </div>
  );
};

export default App;