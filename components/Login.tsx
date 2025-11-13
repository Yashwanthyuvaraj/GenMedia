import React, { useState } from 'react';
import { login } from '../api/auth';
import ErrorMessage from './shared/ErrorMessage';

interface LoginProps {
  onLoginSuccess: () => void;
  switchToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, switchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        onLoginSuccess();
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-fuchsia-500 text-transparent bg-clip-text mb-2 text-center">Log In</h2>
      <p className="text-slate-400 mb-8 text-center">Welcome back to your playground.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage title="Login Failed" message={error} />}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email-login">
            Email
          </label>
          <input
            className="appearance-none w-full py-3 px-1 bg-transparent border-b-2 border-slate-600 text-slate-100 placeholder-slate-400 leading-tight focus:outline-none focus:border-sky-400 transition-colors duration-300"
            id="email-login"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password-login">
            Password
          </label>
          <input
            className="appearance-none w-full py-3 px-1 bg-transparent border-b-2 border-slate-600 text-slate-100 placeholder-slate-400 leading-tight focus:outline-none focus:border-sky-400 transition-colors duration-300"
            id="password-login"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="************"
          />
        </div>
        <div>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-sky-400 transition-all duration-300 disabled:opacity-50 flex items-center justify-center transform hover:scale-105"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="to 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </div>
      </form>
      
      <p className="text-center text-slate-400 text-sm mt-8">
        Don't have an account?{' '}
        <button type="button" onClick={switchToSignUp} className="font-semibold text-sky-400 hover:text-sky-300 hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;