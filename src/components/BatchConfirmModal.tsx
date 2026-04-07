import { useState } from 'react';
import type { Contact } from '../types';

interface BatchConfirmModalProps {
  contacts: Contact[];
  agentName: string;
  versionName: string;
  onConfirm: (contacts: Contact[]) => void;
  onCancel: () => void;
}

export function BatchConfirmModal({ contacts, agentName, versionName, onConfirm, onCancel }: BatchConfirmModalProps) {
  const [editableContacts, setEditableContacts] = useState(contacts.map(c => ({ ...c })));

  const updatePhone = (id: string, phone: string) => {
    setEditableContacts(prev => prev.map(c => c.id === id ? { ...c, phone } : c));
  };

  const removeContact = (id: string) => {
    setEditableContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Confirm Batch Call</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and correct phone numbers before dialing.
          </p>
        </div>

        {/* Agent summary */}
        <div className="px-5 pt-4 flex gap-4 text-xs">
          <div className="flex-1 bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 uppercase tracking-widest font-bold mb-0.5">Agent</p>
            <p className="font-semibold text-gray-800 truncate">{agentName}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 uppercase tracking-widest font-bold mb-0.5">Version</p>
            <p className="font-semibold text-gray-800 truncate">{versionName}</p>
          </div>
        </div>

        {/* Recipient list */}
        <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
          {editableContacts.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">No recipients remaining.</p>
          ) : (
            editableContacts.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{c.PASTOR_NAME || c.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.CHURCH_NAME || c.company}</p>
                </div>
                <input
                  type="tel"
                  value={c.phone}
                  onChange={e => updatePhone(c.id, e.target.value)}
                  className="w-36 text-sm font-mono border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                />
                <button
                  onClick={() => removeContact(c.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(editableContacts)}
            disabled={editableContacts.length === 0}
            className="px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Call {editableContacts.length} Contact{editableContacts.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
