export interface WebhookTranscriptEntry {
  role: 'agent' | 'user';
  message: string;
  time_in_call_secs: number;
}

export interface WebhookEvent {
  id: string;
  received_at: string;
  conversation_id: string;
  agent_id: string;
  status: string;
  call_duration_secs: number;
  transcript: WebhookTranscriptEntry[];
  summary?: string;
}

interface WebhookViewerProps {
  events: WebhookEvent[];
  onReset: () => void;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function WebhookViewer({ events, onReset }: WebhookViewerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Call Results</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Post-call transcripts received via webhook · {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset
        </button>
      </div>

      {events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
          <svg className="w-14 h-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium text-gray-500">No call results yet</p>
          <p className="text-sm mt-1 max-w-xs">
            After calls complete, ElevenLabs fires{' '}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">POST /tools/webhooks/elevenlabs/post-call</code>
            {' '}and the backend stores transcripts in memory.
            Results are loaded via{' '}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">GET /tools/webhooks/elevenlabs/results</code>
            {' '}(pending backend implementation).
          </p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Event header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-1">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conversation ID</p>
                  <p className="text-xs font-mono text-gray-700">{event.conversation_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                  <p className="text-xs font-semibold text-gray-700">{formatDuration(event.call_duration_secs)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    event.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{event.status}</span>
                </div>
                <div className="ml-auto">
                  <p className="text-[10px] text-gray-400">{new Date(event.received_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Summary */}
              {event.summary && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">AI Summary</p>
                  <p className="text-xs text-blue-800">{event.summary}</p>
                </div>
              )}

              {/* Transcript */}
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {event.transcript.map((entry, i) => (
                  <div key={i} className={`flex gap-3 ${entry.role === 'agent' ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                      entry.role === 'agent' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.role === 'agent' ? 'AI' : 'U'}
                    </div>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                      entry.role === 'agent'
                        ? 'bg-primary-50 text-primary-900 rounded-tl-none'
                        : 'bg-gray-100 text-gray-800 rounded-tr-none'
                    }`}>
                      <p>{entry.message}</p>
                      <p className="text-[10px] opacity-50 mt-0.5">{entry.time_in_call_secs}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
