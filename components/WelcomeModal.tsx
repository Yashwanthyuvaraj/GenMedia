import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const features = [
  { 
    name: 'Image Analysis', 
    description: 'Upload an image to get a detailed analysis of its content.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  },
  { 
    name: 'Audio Transcription', 
    description: 'Record your voice and get a live, real-time transcription.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  },
  { 
    name: 'Video Analysis', 
    description: 'Let AI analyze video content by examining key frames.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  },
  { 
    name: 'Image Generation', 
    description: 'Bring your ideas to life by generating images from text prompts.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 8.25 1.5 1.5m-7.5-3 3 3m-7.5 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v7.5A2.25 2.25 0 0 0 4.5 16.5Z" />
  },
];

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in" 
        style={{ animationFillMode: 'forwards', animationDelay: '100ms', animationName: 'zoomIn' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes zoomIn {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome to <span className="bg-gradient-to-r from-sky-400 to-fuchsia-500 text-transparent bg-clip-text">GenMedia</span>, {userName}!</h2>
          <p className="text-slate-300 mt-2">Here's a quick look at what you can do:</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-sky-900/50 rounded-lg text-sky-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">{feature.name}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
