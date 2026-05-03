import React, { useEffect, useRef } from "react";

interface AgentLogProps {
    logs: AgentLogEntry[];
}

const agentColors: Record<string, string> = {
    ats: "text-yellow-400",
    technical: "text-blue-400",
    writing: "text-purple-400",
    recruiter: "text-pink-400",
    orchestrator: "text-emerald-400",
    System: "text-gray-300",
};

const typeIcons: Record<string, string> = {
    info: "ℹ",
    success: "✓",
    error: "✗",
    result: "→",
};

const typeColors: Record<string, string> = {
    info: "text-gray-400",
    success: "text-emerald-400",
    error: "text-red-400",
    result: "text-cyan-400",
};

const formatTime = (ts: number): string => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
};

const AgentLog: React.FC<AgentLogProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="agent-log-panel">
            <div className="agent-log-header">
                <span className="text-emerald-400 font-mono text-sm">● LIVE</span>
                <span className="text-gray-400 text-xs font-mono">Agent Execution Log</span>
                <span className="text-gray-500 text-xs font-mono">{logs.length} entries</span>
            </div>
            <div className="agent-log-body">
                {logs.length === 0 && (
                    <p className="text-gray-600 font-mono text-xs italic p-2">
                        Waiting for agents to start...
                    </p>
                )}
                {logs.map((entry, i) => (
                    <div key={i} className="log-entry">
                        <span className="log-timestamp">{formatTime(entry.timestamp)}</span>
                        <span className={`log-agent-tag ${agentColors[entry.agentId] ?? "text-gray-400"}`}>
                            [{entry.agentName.split(" ")[0]}]
                        </span>
                        <span className={`log-type-icon ${typeColors[entry.type]}`}>
                            {typeIcons[entry.type]}
                        </span>
                        <span className={`log-message ${typeColors[entry.type]}`}>
                            {entry.message}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default AgentLog;
