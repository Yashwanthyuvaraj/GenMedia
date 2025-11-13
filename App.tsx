
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tab } from './types';
import { useApiKey } from './hooks/useApiKey';
import { checkAuthStatus, logout } from './api/auth';
import { useIdleTimer } from './hooks/useIdleTimer';

import ImageAnalysis from './components/ImageAnalysis';
import AudioTranscription from './components/AudioTranscription';
import VideoAnalysis from './components/VideoAnalysis';
import ImageGeneration from './components/ImageGeneration';
import TabButton from './components/shared/TabButton';
import Auth from './components/Auth';
import WelcomeModal from './components/WelcomeModal';
import ScrollToTopButton from './components/shared/ScrollToTopButton';


const App: React.FC = () => {
  const [authInfo, setAuthInfo] = useState(checkAuthStatus());
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ImageAnalysis);
  const [showWelcome, setShowWelcome] = useState(false);
  const { getGenAiClient } = useApiKey();

  const spotlightRef = useRef<HTMLDivElement>(null);

  const handleAuthSuccess = useCallback(() => {
    const status = checkAuthStatus();
    setAuthInfo(status);
    if (status.isLoggedIn && !sessionStorage.getItem('welcomeShown')) {
        setShowWelcome(true);
        sessionStorage.setItem('welcomeShown', 'true');
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setAuthInfo({ isLoggedIn: false, userName: null });
    sessionStorage.removeItem('welcomeShown');
  }, []);

  // Spotlight cursor effect
  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      window.requestAnimationFrame(() => {
        spotlight.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(29, 78, 216, 0.15), transparent 250px)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


  // Auto-logout after 30 minutes of inactivity
  useIdleTimer(handleLogout, 30 * 60 * 1000, authInfo.isLoggedIn);
  
  if (!authInfo.isLoggedIn) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }
  
  const renderContent = () => {
    const props = { getGenAiClient };
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
    <div className="min-h-screen text-white font-sans">
       <WelcomeModal 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
        userName={authInfo.userName || 'User'} 
      />
       <div ref={spotlightRef} className="pointer-events-none fixed inset-0 z-20 transition-all duration-300"></div>
       <header className="bg-slate-950/70 backdrop-blur-lg sticky top-0 z-10 py-4 px-4 sm:px-8 border-b border-white/10 shadow-xl shadow-black/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sky-400">
              <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
              <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
            </svg>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-fuchsia-500 text-transparent bg-clip-text">GenMedia</h1>
          </div>
          <div className="flex items-center gap-4">
            {authInfo.userName && (
                <div className="hidden sm:flex items-center gap-2 animate-fade-in">
                    <p className="text-slate-300 text-sm font-medium">Welcome, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-400">{authInfo.userName}</span>!</p>
                </div>
            )}
            <button 
              onClick={handleLogout}
              title="Logout"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-slate-300 hover:text-white font-semibold w-10 h-10 flex items-center justify-center rounded-full transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
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

      <ScrollToTopButton />
    </div>
  );
};

export default App;