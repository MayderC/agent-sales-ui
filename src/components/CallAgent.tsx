import { useState, useEffect } from 'react';
import type { Contact } from '../types';

interface CallAgentProps {
  contact: Contact | null;
  onCall: (contactId: string, dynamicVars: Record<string, any>) => Promise<void>;
  onClearSelection: () => void;
  updateContact: (contact: Contact) => void;
}

export function CallAgent({ contact, onCall, onClearSelection, updateContact }: CallAgentProps) {
  const [calling, setCalling] = useState(false);
  const [localContact, setLocalContact] = useState<Contact | null>(contact);

  useEffect(() => {
    setLocalContact(contact);
  }, [contact]);

  if (!contact || !localContact) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center h-full flex flex-col justify-center items-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-200 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
        </svg>
        <p className="text-lg font-medium text-gray-600">Select a contact</p>
        <p className="max-w-xs mt-2 text-sm">Choose a lead from the list to configure and start an AI-powered voice call.</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let val: any = value;
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      val = value === '' ? '' : Number(value);
    }

    const updated = { ...localContact, [name]: val };

    if (name === 'ATTENDANCE' && typeof val === 'number' && val > 2000) {
      updated.MULTI_CAMPUS = true;
    }

    setLocalContact(updated);
    updateContact(updated);
  };

  const isFormValid = Boolean(
    localContact.phone?.toString().trim() &&
    localContact.CHURCH_NAME?.trim() &&
    localContact.DENOMINATION?.trim() &&
    localContact.CITY_STATE?.trim() &&
    localContact.ATTENDANCE !== undefined && String(localContact.ATTENDANCE) !== '' &&
    localContact.PASTOR_NAME?.trim() &&
    localContact.ATTEMPT !== undefined && String(localContact.ATTEMPT) !== '' &&
    localContact.ADDITIONAL_RESEARCH_NOTES?.trim() &&
    localContact.VOICE_MESSAGE?.trim()
  );

  const handleCall = async () => {
    setCalling(true);
    try {
      const dynamicVars = {
        PROSPECT_NAME: localContact.name,
        COMPANY_NAME: localContact.COMPANY_NAME || localContact.company,
        CHURCH_NAME: localContact.CHURCH_NAME || localContact.company,
        CITY_STATE: localContact.CITY_STATE || '',
        DENOMINATION: localContact.DENOMINATION || '',
        ATTENDANCE: String(localContact.ATTENDANCE ?? 0),
        PASTOR_NAME: localContact.PASTOR_NAME || '',
        ADDITIONAL_RESEARCH_NOTES: localContact.ADDITIONAL_RESEARCH_NOTES || localContact.context,
        MULTI_CAMPUS: !!localContact.MULTI_CAMPUS,
        ATTEMPT: Number(localContact.ATTEMPT || 1),
      };
      await onCall(contact.id, dynamicVars);
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl h-full flex flex-col border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs">
            {localContact.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-gray-800">Call Configuration</h2>
        </div>
        <button onClick={onClearSelection} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-white space-y-6">

        {/* Contact summary card — exact JSON variable names */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">PROSPECT_NAME</p>
            <p className="text-sm font-bold text-gray-800">{localContact.name}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">CHURCH_NAME</p>
            <p className="text-sm font-bold text-gray-800">{localContact.CHURCH_NAME || localContact.company}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">CITY_STATE</p>
            <p className="text-sm text-gray-600">{localContact.CITY_STATE || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">DENOMINATION</p>
            <p className="text-sm text-gray-600">{localContact.DENOMINATION || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">PASTOR_NAME</p>
            <p className="text-sm text-gray-600">{localContact.PASTOR_NAME || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">ATTENDANCE</p>
            <p className="text-sm text-gray-600">{localContact.ATTENDANCE ?? '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">MULTI_CAMPUS</p>
            <p className="text-sm text-gray-600">{localContact.MULTI_CAMPUS ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">ATTEMPT</p>
            <p className="text-sm text-gray-600">{localContact.ATTEMPT ?? '—'}</p>
          </div>
        </div>

        {/* Phone — prominent editable */}
        <div className="p-5 rounded-xl border-2 border-primary-300 bg-primary-50/30">
          <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">
            Target Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <input
              type="tel"
              name="phone"
              className="w-full text-2xl tracking-wide font-black text-gray-900 border-2 border-primary-300 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white transition-all outline-none placeholder:text-gray-300"
              value={localContact.phone || ''}
              onChange={handleInputChange}
              placeholder="+1 555 123 4567"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 ml-1">The AI Agent will dial this number automatically.</p>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Editable form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

          <div className="md:col-span-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Church Information</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Church Name <span className="text-red-500">*</span></label>
            <input type="text" name="CHURCH_NAME"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500"
              value={localContact.CHURCH_NAME ?? ''} onChange={handleInputChange} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Denomination <span className="text-red-500">*</span></label>
            <input type="text" name="DENOMINATION"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500"
              value={localContact.DENOMINATION ?? ''} onChange={handleInputChange} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">City, State <span className="text-red-500">*</span></label>
            <input type="text" name="CITY_STATE"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500"
              value={localContact.CITY_STATE ?? ''} onChange={handleInputChange} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Attendance <span className="text-red-500">*</span></label>
            <input type="number" name="ATTENDANCE"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500"
              value={localContact.ATTENDANCE !== undefined ? localContact.ATTENDANCE : ''} onChange={handleInputChange} />
          </div>

          <div className="md:col-span-2 pt-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leadership Details</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Pastor Name <span className="text-red-500">*</span></label>
            <input type="text" name="PASTOR_NAME"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500"
              value={localContact.PASTOR_NAME ?? ''} onChange={handleInputChange} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Attempt # <span className="text-red-500">*</span></label>
            <input type="number" name="ATTEMPT"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500"
              value={localContact.ATTEMPT ?? 1} onChange={handleInputChange} />
            <p className="text-[10px] text-gray-400 mt-1">Number of call attempts (e.g. 1st, 2nd).</p>
          </div>

          <div className="md:col-span-1 flex items-center pt-2">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input type="checkbox" name="MULTI_CAMPUS" className="sr-only"
                  checked={!!localContact.MULTI_CAMPUS} onChange={handleInputChange} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${localContact.MULTI_CAMPUS ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${localContact.MULTI_CAMPUS ? 'translate-x-4' : ''}`}></div>
              </div>
              <div className="ml-3 text-xs font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                Multi-Campus Location
                {(localContact.ATTENDANCE ?? 0) > 2000 && (
                  <span className="block text-[10px] font-normal text-primary-500 mt-0.5">Auto-enabled (&gt;2000 attendance)</span>
                )}
              </div>
            </label>
          </div>

          <div className="md:col-span-2 pt-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              Additional Research <span className="text-red-500">*</span>
            </label>
            <textarea name="ADDITIONAL_RESEARCH_NOTES"
              className="w-full border-gray-200 rounded-md text-xs p-2 border focus:ring-1 focus:ring-primary-500 min-h-[80px]"
              value={localContact.ADDITIONAL_RESEARCH_NOTES ?? ''} onChange={handleInputChange} />
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              Voice Mail Message <span className="text-red-500">*</span>
            </label>
            <textarea name="VOICE_MESSAGE"
              className="w-full border-gray-200 rounded-lg shadow-inner text-sm p-3 border focus:ring-1 focus:ring-primary-500 bg-gray-50 min-h-[100px] transition-all"
              placeholder="Message the agent will deliver..."
              value={localContact.VOICE_MESSAGE ?? ''} onChange={handleInputChange} />
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
        {!isFormValid && (
          <p className="text-xs text-red-500 font-bold text-center">* All fields are required to start the AI call.</p>
        )}
        <button
          onClick={handleCall}
          disabled={calling || !isFormValid}
          className={`w-full flex justify-center items-center py-4 px-6 rounded-xl shadow-lg text-sm font-black text-white uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:translate-y-0
            ${calling || !isFormValid
              ? 'bg-gray-300 cursor-not-allowed shadow-none translate-y-0'
              : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-300/50'
            }
          `}
        >
          {calling ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calling...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Start AI Call
            </>
          )}
        </button>
      </div>
    </div>
  );
}
