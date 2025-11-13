import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

interface AuthProps {
  onAuthSuccess: () => void;
}

const features = [
  { 
    name: 'Image Analysis', 
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  },
  { 
    name: 'Video Analysis', 
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
  },
  { 
    name: 'Audio Transcription', 
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  },
  { 
    name: 'Image Generation', 
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 8.25 1.5 1.5m-7.5-3 3 3m-7.5 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v7.5A2.25 2.25 0 0 0 4.5 16.5Z" />
  },
];


const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 antialiased">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left Column: Welcome Text & Features */}
            <div className="text-center md:text-left">
                <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                    Welcome to <span className="block mt-1 bg-gradient-to-r from-sky-400 to-fuchsia-500 text-transparent bg-clip-text">GenMedia</span>
                </h1>
                <p className="text-slate-300 mt-6 text-lg md:text-xl max-w-xl mx-auto md:mx-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    Your AI-Powered Media Playground. Unlock the full potential of generative AI.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-8">
                    {features.map((feature, index) => (
                        <div 
                            key={feature.name} 
                            className="animate-fade-in flex items-center gap-2.5 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 px-4 py-2"
                            style={{ animationDelay: `${300 + index * 100}ms`}}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-sky-400">
                            {feature.icon}
                            </svg>
                            <span className="text-slate-200 font-medium text-sm">{feature.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Right Column: Auth Card */}
            <div className="w-full max-w-md mx-auto md:mx-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="rounded-2xl bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-2xl border border-white/10">
                    <div className="p-8 sm:p-10">
                        <div key={showLogin ? 'login' : 'signup'} className="animate-fade-in">
                            {showLogin ? (
                            <Login onLoginSuccess={onAuthSuccess} switchToSignUp={() => setShowLogin(false)} />
                            ) : (
                            <SignUp onSignUpSuccess={onAuthSuccess} switchToLogin={() => setShowLogin(true)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default Auth;
