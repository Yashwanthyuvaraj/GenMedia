import React, { useState, useMemo } from 'react';
import { signup } from '../api/auth';
import ErrorMessage from './shared/ErrorMessage';

interface SignUpProps {
  onSignUpSuccess: () => void;
  switchToLogin: () => void;
}

const PasswordRequirement: React.FC<{isValid: boolean; text: string}> = ({ isValid, text }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${isValid ? 'text-green-400' : 'text-slate-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d={isValid ? "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" : "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"} clipRule="evenodd" />
        </svg>
        {text}
    </div>
);

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, switchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const passwordValidation = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
        setError("Please ensure your password meets all the requirements.");
        return;
    }
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await signup(name, email, password);
      if (response.success) {
        setSuccessMessage('Sign up successful! You can now log in.');
        setTimeout(() => {
          setIsLoading(false);
          switchToLogin();
        }, 2000);
      } else {
        setError(response.message || 'Sign up failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-fuchsia-500 text-transparent bg-clip-text mb-2 text-center">Create Account</h2>
      <p className="text-slate-400 mb-8 text-center">Join GenMedia to get started.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage title="Sign-Up Failed" message={error} />}
        {successMessage && (
          <div className="bg-green-900/50 text-green-200 text-sm p-3 rounded-lg text-center" role="alert">
            {successMessage}
          </div>
        )}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="name-signup">
            Name
          </label>
          <input
            className="appearance-none w-full py-3 px-1 bg-transparent border-b-2 border-slate-600 text-slate-100 placeholder-slate-400 leading-tight focus:outline-none focus:border-sky-400 transition-colors duration-300"
            id="name-signup"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email-signup">
            Email
          </label>
          <input
            className="appearance-none w-full py-3 px-1 bg-transparent border-b-2 border-slate-600 text-slate-100 placeholder-slate-400 leading-tight focus:outline-none focus:border-sky-400 transition-colors duration-300"
            id="email-signup"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password-signup">
            Password
          </label>
          <input
            className="appearance-none w-full py-3 px-1 bg-transparent border-b-2 border-slate-600 text-slate-100 placeholder-slate-400 leading-tight focus:outline-none focus:border-sky-400 transition-colors duration-300"
            id="password-signup"
            type="password"
            placeholder="8+ strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
            <PasswordRequirement isValid={passwordValidation.minLength} text="At least 8 characters" />
            <PasswordRequirement isValid={passwordValidation.hasUpper} text="One uppercase letter" />
            <PasswordRequirement isValid={passwordValidation.hasLower} text="One lowercase letter" />
            <PasswordRequirement isValid={passwordValidation.hasNumber} text="One number" />
            <PasswordRequirement isValid={passwordValidation.hasSpecial} text="One special character" />
        </div>
        <div>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-sky-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
            type="submit"
            disabled={isLoading || !isPasswordValid}
          >
             {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <p className="text-center text-slate-400 text-sm mt-8">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={switchToLogin} 
          className="font-semibold text-sky-400 hover:text-sky-300 hover:underline"
          disabled={isLoading}
        >
          Log In
        </button>
      </p>
    </div>
  );
};

export default SignUp;