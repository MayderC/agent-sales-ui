import type { Agent } from '../types';


interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string;
  selectedVersionId: string;
  onAgentChange: (agentId: string) => void;
  onVersionChange: (versionId: string) => void;
}

export function AgentSelector({
  agents,
  selectedAgentId,
  selectedVersionId,
  onAgentChange,
  onVersionChange
}: AgentSelectorProps) {
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border-l-4 border-primary-500">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Active Agent
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border bg-white"
            value={selectedAgentId}
            onChange={(e) => onAgentChange(e.target.value)}
          >
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full text-white">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Version / Branch
          </label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border bg-white text-black"
            value={selectedVersionId}
            onChange={(e) => onVersionChange(e.target.value)}
          >
            {selectedAgent?.versions.map(version => (
              <option key={version.id} value={version.id}>{version.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
