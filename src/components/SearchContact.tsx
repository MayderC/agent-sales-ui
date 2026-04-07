import { useState } from 'react';
import type { Contact } from '../types';

interface SearchContactProps {
  onSearch: (query: string, type: 'url' | 'context') => Promise<Contact[]>;
}

export function SearchContact({ onSearch }: SearchContactProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'url' | 'context'>('context');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      await onSearch(query, type);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Discover Prospects</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                className="text-primary-600 focus:ring-primary-500" 
                checked={type === 'context'} 
                onChange={() => setType('context')}
              />
              <span className="ml-2 text-sm text-gray-700">By Context/Keywords</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                className="text-primary-600 focus:ring-primary-500" 
                checked={type === 'url'} 
                onChange={() => setType('url')}
              />
              <span className="ml-2 text-sm text-gray-700">By Website URL</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {type === 'context' ? 'Keywords or Context' : 'Company Website URL'}
          </label>
          <input
            type="text"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            placeholder={type === 'context' ? 'e.g. tech startups looking for marketing' : 'https://example.com'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search in CRM'}
        </button>
      </form>
    </div>
  );
}
