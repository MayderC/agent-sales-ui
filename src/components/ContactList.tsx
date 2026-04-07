import type { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  selectedId?: string;
  checkedIds: Set<string>;
  onToggleCheck: (id: string) => void;
  onToggleAll: () => void;
}

export function ContactList({ contacts, onSelect, selectedId, checkedIds, onToggleCheck, onToggleAll }: ContactListProps) {
  const allChecked = contacts.length > 0 && contacts.every(c => checkedIds.has(c.id));
  const someChecked = contacts.some(c => checkedIds.has(c.id));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <input
          type="checkbox"
          checked={allChecked}
          ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
          onChange={onToggleAll}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 cursor-pointer"
        />
        <h2 className="text-lg font-semibold text-gray-800 flex-1">Customers & Leads</h2>
        {someChecked && (
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {checkedIds.size} selected
          </span>
        )}
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {contacts.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No contacts found. Use search or add a new one.
          </div>
        ) : (
          <ul className="space-y-2">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className={`p-3 rounded-md transition-colors border flex items-start gap-3 ${
                  selectedId === contact.id
                    ? 'border-primary-500 bg-primary-50'
                    : checkedIds.has(contact.id)
                    ? 'border-primary-200 bg-primary-50/40'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(contact.id)}
                  onChange={() => onToggleCheck(contact.id)}
                  onClick={e => e.stopPropagation()}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(contact)}>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                    </div>
                    <span className={`ml-2 shrink-0 text-xs px-2 py-1 rounded-full ${
                      contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      contact.status === 'interested' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {contact.phone}{contact.email ? ` • ${contact.email}` : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
