import React, { useState } from 'react';
import { signup } from '../api/auth';

interface SignUpProps {
  onSignUpSuccess: () => void;
  switchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, switchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await signup(email, password);
      if (response.success) {
        onSignUpSuccess();
      } else {
        setError(response.message || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-center text-sky-400 mb-6">Sign Up</h2>
        {error && <p className="bg-red-900/50 text-red-300 text-center text-sm p-3 rounded-md mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="email-signup">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-700 border-slate-600 text-slate-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-sky-500"
            id="email-signup"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password-signup">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-slate-700 border-slate-600 text-slate-200 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-sky-500"
            id="password-signup"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <button type="button" onClick={switchToLogin} className="font-bold text-sky-500 hover:text-sky-400">
            Log In
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
