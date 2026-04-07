import { useState } from 'react'
import { ContactList } from './components/ContactList'
import { AddContact } from './components/AddContact'
import { CallAgent } from './components/CallAgent'
import { BatchConfirmModal } from './components/BatchConfirmModal'
import { WebhookViewer } from './components/WebhookViewer'
import type { WebhookEvent } from './components/WebhookViewer'
import type { Contact } from './types'
import { mockProfiles } from './data/mockProfiles'
import agentsConfig from './data/agents.json'
import appConfig from './data/config.json'
import './index.css'
import { useEffect } from 'react'

const API_BASE_URL = appConfig.api.baseUrl
const TENANT_ID = appConfig.api.tenantId

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const method = (options.method ?? 'GET').toUpperCase();
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': TENANT_ID,
    'Authorization': `Bearer ${appConfig.api.authToken}`,
    ...(isWrite ? { 'idempotency-key': crypto.randomUUID() } : {}),
    ...(options.headers as Record<string, string>),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(error.error?.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState(agentsConfig.agents[0]?.id ?? '')
  const [selectedVersionId, setSelectedVersionId] = useState(agentsConfig.agents[0]?.versions[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState<'contacts' | 'results'>('contacts')
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  // Load initial contacts from mock data
  useEffect(() => {
    setContacts(mockProfiles)
  }, [])

  // Health check — ping /health on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false))
  }, [])

  const handleToggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    const allChecked = contacts.every(c => checkedIds.has(c.id));
    setCheckedIds(allChecked ? new Set() : new Set(contacts.map(c => c.id)));
  };

  // Mock API Call - Add to HubSpot
  const handleAdd = async (contactData: Partial<Contact>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newContact: Contact = {
          id: String(Date.now()),
          name: contactData.name || '',
          company: contactData.company || '',
          email: contactData.email || '',
          phone: contactData.phone || '',
          context: contactData.context || '',
          status: 'new'
        };
        setContacts(prev => [newContact, ...prev]);
        setSelectedContact(newContact);
        setIsAddModalOpen(false);
        resolve();
      }, 1000);
    });
  }

  // Integrated API Call - Trigger ElevenLabs Call via Backline voice.elevenlabs_call
  const handleCall = async (contactId: string, dynamicVars: Record<string, any>) => {
    const contact = contacts.find(c => c.id === contactId)
    if (!contact) return

    setIsLoading(true)
    try {
      const agent = agentsConfig.agents.find(a => a.id === selectedAgentId)
      await fetchWithAuth('/tools/voice/elevenlabs_call', {
        method: 'POST',
        body: JSON.stringify({
          phone_number: contact.phone,
          customer_id: contactId,
          agent_id: selectedAgentId,
          agent_phone_number_id: agent?.agent_phone_number_id ?? '',
          branch_id: selectedVersionId,
          dynamic_variables: dynamicVars
        })
      })

      alert(`Call initiated successfully for ${contact.name}!`)
      
      // Update status visually
      setContacts(prev => prev.map(c => 
        c.id === contactId ? { ...c, status: 'contacted' as const } : c
      ))
      
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact({ ...selectedContact, status: 'contacted' })
      }
    } catch (error) {
      console.error('Call initiation failed:', error)
      alert(`Call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Batch call — triggered after user confirms/edits numbers in the modal
  const handleBatchCall = async (confirmedContacts: Contact[]) => {
    setShowBatchConfirm(false)
    if (confirmedContacts.length === 0) return

    const agent = agentsConfig.agents.find(a => a.id === selectedAgentId)
    setIsBatchLoading(true)
    try {
      await fetchWithAuth('/tools/voice/elevenlabs_batch_call', {
        method: 'POST',
        body: JSON.stringify({
          call_name: `${appConfig.campaign.callNamePrefix} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          agent_id: selectedAgentId,
          agent_phone_number_id: agent?.agent_phone_number_id ?? '',
          branch_id: selectedVersionId,
          recipients: confirmedContacts.map(c => ({
            phone_number: c.phone,
            dynamic_variables: {
              COMPANY_NAME: c.COMPANY_NAME ?? c.company,
              CHURCH_NAME: c.CHURCH_NAME ?? c.company,
              CITY_STATE: c.CITY_STATE ?? '',
              DENOMINATION: c.DENOMINATION ?? '',
              ATTENDANCE: String(c.ATTENDANCE ?? 0),
              PASTOR_NAME: c.PASTOR_NAME ?? c.name,
              ADDITIONAL_RESEARCH_NOTES: c.ADDITIONAL_RESEARCH_NOTES ?? c.context,
              MULTI_CAMPUS: !!c.MULTI_CAMPUS,
              ATTEMPT: c.ATTEMPT ?? 1,
            }
          }))
        })
      })

      setContacts(prev => prev.map(c =>
        confirmedContacts.find(cc => cc.id === c.id) ? { ...c, status: 'contacted' as const } : c
      ))
      setActiveTab('results')
    } catch (error) {
      alert(`Batch call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsBatchLoading(false)
    }
  }

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    if (selectedContact?.id === updatedContact.id) {
      setSelectedContact(updatedContact);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 m-0">AI Sales Agent Platform</h1>
            <p className="mt-1 flex items-center text-sm text-gray-500">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isLoading || isBatchLoading ? 'bg-yellow-400 animate-pulse' :
                isConnected === null ? 'bg-gray-300 animate-pulse' :
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              {isLoading || isBatchLoading ? 'Processing...' :
               isConnected === null ? 'Connecting...' :
               isConnected ? 'API Connected' : 'API Offline — check backend on :3030'}
            </p>
          </div>
          
          <nav className="flex items-center gap-2">
            {/* Agent selector */}
            <select
              value={selectedAgentId}
              onChange={e => {
                setSelectedAgentId(e.target.value)
                const agent = agentsConfig.agents.find(a => a.id === e.target.value)
                setSelectedVersionId(agent?.versions[0]?.id ?? '')
              }}
              className="text-sm border border-gray-200 rounded-md px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {agentsConfig.agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            {/* Version selector */}
            <select
              value={selectedVersionId}
              onChange={e => setSelectedVersionId(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {agentsConfig.agents.find(a => a.id === selectedAgentId)?.versions.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Batch call */}
            {(() => {
              const targetContacts = checkedIds.size > 0
                ? contacts.filter(c => checkedIds.has(c.id))
                : contacts;
              return (
                <button
                  onClick={() => setShowBatchConfirm(true)}
                  disabled={isBatchLoading || targetContacts.length === 0}
                  className="px-4 py-2 rounded-md font-medium text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isBatchLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                  {checkedIds.size > 0 ? `Call Selected (${checkedIds.size})` : `Call All (${contacts.length})`}
                </button>
              );
            })()}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-md font-medium text-sm bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
            >
              Add Manually
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === 'contacts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Call Results
            {webhookEvents.length > 0 && (
              <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {webhookEvents.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'contacts' ? (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            <div className="w-full lg:w-1/3 h-full flex flex-col">
              <ContactList
                contacts={contacts}
                onSelect={setSelectedContact}
                selectedId={selectedContact?.id}
                checkedIds={checkedIds}
                onToggleCheck={handleToggleCheck}
                onToggleAll={handleToggleAll}
              />
            </div>
            <div className="w-full lg:w-2/3 h-full">
              <CallAgent
                contact={selectedContact}
                onCall={handleCall}
                onClearSelection={() => setSelectedContact(null)}
                updateContact={handleUpdateContact}
              />
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)] min-h-[500px]">
            <WebhookViewer
              events={webhookEvents}
              onReset={() => setWebhookEvents([])}
            />
          </div>
        )}

        {/* Batch confirm modal */}
        {showBatchConfirm && (
          <BatchConfirmModal
            contacts={checkedIds.size > 0 ? contacts.filter(c => checkedIds.has(c.id)) : contacts}
            agentName={agentsConfig.agents.find(a => a.id === selectedAgentId)?.name ?? selectedAgentId}
            versionName={agentsConfig.agents.find(a => a.id === selectedAgentId)?.versions.find(v => v.id === selectedVersionId)?.name ?? selectedVersionId}
            onConfirm={handleBatchCall}
            onCancel={() => setShowBatchConfirm(false)}
          />
        )}

        {/* Modal for AddContact */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-2 pt-6">
                <AddContact onAdd={handleAdd} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
