import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeKey: () => void;
  onRevokeKey: () => void;
  isAistudioAvailable: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onChangeKey, onRevokeKey, isAistudioAvailable }) => {
  if (!isOpen) {
    return null;
  }
  
  const handleChange = () => {
    onChangeKey();
    onClose();
  };

  const handleRevoke = () => {
    if (window.confirm('Are you sure you want to revoke your API key for this session? You will be prompted to provide a new one.')) {
      onRevokeKey();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-sky-400 mb-4">Manage API Key</h2>
        <p className="text-slate-300 mb-2">An API key is currently active for your session.</p>
        
        {isAistudioAvailable ? (
            <p className="text-slate-400 text-sm mb-6">You can change the key you are using, or revoke it to be prompted again.</p>
        ) : (
            <p className="text-slate-400 text-sm mb-6">You can enter a new key, or revoke the current one for this session.</p>
        )}


        <div className="space-y-4">
            <button
                onClick={handleChange}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
            >
                {isAistudioAvailable ? 'Change API Key' : 'Enter New API Key'}
            </button>
            <button
                onClick={handleRevoke}
                className="w-full bg-transparent hover:bg-red-900/50 text-red-400 font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out border border-red-800 hover:border-red-700"
            >
                Revoke API Key
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;