import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <h1 className="text-5xl font-extrabold text-white mb-2">
        Welcome to <span className="text-sky-400">GenMedia</span>
      </h1>
      <p className="text-lg text-slate-400 mb-8">Your AI-Powered Media Playground</p>
      {showLogin ? (
        <Login onLoginSuccess={onAuthSuccess} switchToSignUp={() => setShowLogin(false)} />
      ) : (
        <SignUp onSignUpSuccess={onAuthSuccess} switchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
};

export default Auth;
