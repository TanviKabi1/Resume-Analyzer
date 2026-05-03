import React from "react";

interface AgentStatusCardProps {
    agent: AgentStatus;
}

const statusConfig = {
    idle: {
        label: "Waiting",
        bgClass: "agent-card-idle",
        dotClass: "status-dot-idle",
        textClass: "text-gray-400",
    },
    running: {
        label: "Analyzing...",
        bgClass: "agent-card-running",
        dotClass: "status-dot-running",
        textClass: "text-blue-400",
    },
    completed: {
        label: "Completed",
        bgClass: "agent-card-completed",
        dotClass: "status-dot-completed",
        textClass: "text-emerald-400",
    },
    error: {
        label: "Error",
        bgClass: "agent-card-error",
        dotClass: "status-dot-error",
        textClass: "text-red-400",
    },
};

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent }) => {
    const config = statusConfig[agent.status];

    return (
        <div className={`agent-card ${config.bgClass}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div>
                        <p className="agent-card-name">{agent.name}</p>
                        <p className={`text-xs font-medium ${config.textClass}`}>
                            {config.label}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`status-dot ${config.dotClass}`} />
                    {agent.status === "running" && (
                        <div className="agent-spinner" />
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="agent-progress-track">
                <div
                    className={`agent-progress-bar ${agent.status === "completed"
                            ? "w-full bg-emerald-500"
                            : agent.status === "running"
                            ? "w-2/3 bg-blue-500 animate-pulse"
                            : agent.status === "error"
                            ? "w-full bg-red-500"
                            : "w-0"
                        }`}
                />
            </div>

            {/* Stats row */}
            {(agent.duration || agent.confidence) && (
                <div className="flex items-center justify-between mt-3">
                    {agent.duration && (
                        <span className="agent-stat-badge">
                            ⏱ {(agent.duration / 1000).toFixed(1)}s
                        </span>
                    )}
                    {agent.confidence && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">Confidence</span>
                            <div className="confidence-track">
                                <div
                                    className="confidence-fill"
                                    style={{ width: `${agent.confidence}%` }}
                                />
                            </div>
                            <span className="text-xs text-emerald-400 font-semibold">
                                {agent.confidence}%
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgentStatusCard;
