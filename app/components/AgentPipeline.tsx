import React from "react";

interface AgentPipelineProps {
    agentStatuses: AgentStatus[];
}

const PipelineNode = ({
    label,
    icon,
    status,
    isLast = false,
}: {
    label: string;
    icon: string;
    status: AgentStatusState | "parallel" | "done";
    isLast?: boolean;
}) => {
    const nodeClass =
        status === "completed" || status === "done"
            ? "pipeline-node pipeline-node-done"
            : status === "running"
            ? "pipeline-node pipeline-node-running"
            : status === "error"
            ? "pipeline-node pipeline-node-error"
            : "pipeline-node pipeline-node-idle";

    return (
        <div className="flex flex-col items-center">
            <div className={nodeClass}>
                <span className="text-xl">{icon}</span>
            </div>
            <p className="pipeline-node-label">{label}</p>
            {!isLast && <div className="pipeline-arrow">↓</div>}
        </div>
    );
};

const AgentPipeline: React.FC<AgentPipelineProps> = ({ agentStatuses }) => {
    const getStatus = (id: string): AgentStatusState =>
        agentStatuses.find((a) => a.id === id)?.status ?? "idle";

    const parallelStatus = (): AgentStatusState => {
        const statuses = ["ats", "technical", "writing", "recruiter"].map(getStatus);
        if (statuses.every((s) => s === "completed")) return "completed";
        if (statuses.some((s) => s === "running")) return "running";
        if (statuses.some((s) => s === "error")) return "error";
        return "idle";
    };

    return (
        <div className="agent-pipeline-wrapper">
            <h3 className="pipeline-title">AI Agent Pipeline</h3>
            <div className="pipeline-flow">
                {/* Upload node */}
                <PipelineNode icon="📄" label="Resume Upload" status="done" />

                {/* Parallel agents block */}
                <div className="pipeline-arrow">↓</div>
                <div className="pipeline-parallel-block">
                    <div className="pipeline-parallel-label">Parallel Analysis</div>
                    <div className="pipeline-parallel-agents">
                        {[
                            { id: "ats", icon: "🎯", label: "ATS" },
                            { id: "technical", icon: "⚙️", label: "Technical" },
                            { id: "writing", icon: "✍️", label: "Writing" },
                            { id: "recruiter", icon: "👔", label: "Recruiter" },
                        ].map((agent) => (
                            <div key={agent.id} className="pipeline-mini-node-wrapper">
                                <div
                                    className={`pipeline-mini-node ${
                                        getStatus(agent.id) === "completed"
                                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                            : getStatus(agent.id) === "running"
                                            ? "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse"
                                            : getStatus(agent.id) === "error"
                                            ? "bg-red-500/20 border-red-500 text-red-400"
                                            : "bg-gray-800 border-gray-600 text-gray-400"
                                    }`}
                                >
                                    <span>{agent.icon}</span>
                                    <span className="text-xs">{agent.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orchestrator */}
                <div className="pipeline-arrow">↓</div>
                <PipelineNode
                    icon="🧠"
                    label="Orchestrator"
                    status={getStatus("orchestrator")}
                />

                {/* Final report */}
                <div className="pipeline-arrow">↓</div>
                <PipelineNode
                    icon="📊"
                    label="Final Report"
                    status={getStatus("orchestrator") === "completed" ? "done" : "idle"}
                    isLast
                />
            </div>
        </div>
    );
};

export default AgentPipeline;
