import { useState } from 'react';
import appConfig from '../data/config.json';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export function ApiKeyModal({ onSave }: ApiKeyModalProps) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = value.trim();
    if (!key) return;

    setStatus('loading');
    try {
      const res = await fetch(`${appConfig.api.baseUrl}/tools/auth/validate`, {
        headers: { 'x-api-key': key },
      });
      if (res.ok) {
        onSave(key);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">API Key required</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the access key to use the AI call platform. It will be saved in your browser.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
              status === 'error'
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-200 focus:ring-primary-500'
            }`}
            placeholder="e.g. church-sales-key-2024"
            value={value}
            onChange={e => { setValue(e.target.value); setStatus('idle'); }}
            autoFocus
          />
          {status === 'error' && (
            <p className="text-xs text-red-500 font-semibold -mt-2">Invalid key. Please try again.</p>
          )}
          <button
            type="submit"
            disabled={!value.trim() || status === 'loading'}
            className="w-full py-3 rounded-lg bg-primary-600 text-white font-bold text-sm disabled:opacity-40 hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {status === 'loading' ? 'Validating...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
