import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: React.ReactNode;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = "An Error Occurred", message, details, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`bg-red-900/50 text-red-200 text-sm p-4 rounded-lg w-full ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-red-300">{title}</h3>
          <div className="mt-2 text-sm text-red-200">
            <p>{message}</p>
            {details && <div className="mt-2">{details}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
