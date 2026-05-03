/**
 * AI Orchestrator Service
 * Coordinates all 4 specialist agents in parallel, then runs the orchestrator.
 * Provides live status callbacks to the UI.
 */

import { analyzeATS } from "~/agents/atsAgent";
import { analyzeTechnicalSkills } from "~/agents/technicalAgent";
import { analyzeWriting } from "~/agents/writingAgent";
import { analyzeRecruiterPerspective } from "~/agents/recruiterAgent";
import { runOrchestrator } from "~/agents/orchestratorAgent";

export type AgentUpdateCallback = (
    agentId: string,
    status: AgentStatusState,
    result?: Partial<AgentStatus>,
    logEntry?: AgentLogEntry
) => void;

const AGENTS_META = {
    ats: { id: "ats", name: "ATS Optimization Agent", icon: "🎯" },
    technical: { id: "technical", name: "Technical Skills Agent", icon: "⚙️" },
    writing: { id: "writing", name: "Writing & Impact Agent", icon: "✍️" },
    recruiter: { id: "recruiter", name: "Recruiter Perspective Agent", icon: "👔" },
    orchestrator: { id: "orchestrator", name: "Orchestrator Agent", icon: "🧠" },
};

const createLog = (
    agentId: string,
    agentName: string,
    message: string,
    type: AgentLogEntry["type"] = "info"
): AgentLogEntry => ({
    timestamp: Date.now(),
    agentId,
    agentName,
    message,
    type,
});

const runAgent = async <T>(
    agentId: keyof typeof AGENTS_META,
    fn: () => Promise<T>,
    onUpdate: AgentUpdateCallback
): Promise<T> => {
    const meta = AGENTS_META[agentId];
    const startedAt = Date.now();

    onUpdate(agentId, "running", { startedAt }, createLog(agentId, meta.name, `${meta.name} started analysis...`, "info"));

    try {
        const result = await fn();
        const completedAt = Date.now();
        const duration = completedAt - startedAt;
        const confidence = (result as any).confidence ?? (result as any).skillScore ? (result as any).confidence : undefined;

        onUpdate(
            agentId,
            "completed",
            { completedAt, duration, confidence },
            createLog(agentId, meta.name, `Analysis completed in ${(duration / 1000).toFixed(1)}s`, "success")
        );
        return result;
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        onUpdate(
            agentId,
            "error",
            {},
            createLog(agentId, meta.name, `Error: ${message}`, "error")
        );
        throw err;
    }
};

export const runMultiAgentAnalysis = async (
    resumePath: string,
    jobTitle: string,
    jobDescription: string,
    onUpdate: AgentUpdateCallback
): Promise<MultiAgentFeedback> => {

    // Log: pipeline start
    onUpdate("ats", "idle", {}, createLog("ats", "System", "🚀 Multi-agent pipeline initialized", "info"));
    onUpdate("technical", "idle", {}, createLog("technical", "System", "⚡ Running 4 agents in parallel via Promise.all()", "info"));

    // ─── Phase 1: Parallel execution of all 4 specialist agents ──────────────
    const [atsResult, technicalResult, writingResult, recruiterResult] = await Promise.all([
        runAgent("ats", () => analyzeATS(resumePath, jobTitle, jobDescription), onUpdate),
        runAgent("technical", () => analyzeTechnicalSkills(resumePath, jobTitle, jobDescription), onUpdate),
        runAgent("writing", () => analyzeWriting(resumePath, jobTitle, jobDescription), onUpdate),
        runAgent("recruiter", () => analyzeRecruiterPerspective(resumePath, jobTitle, jobDescription), onUpdate),
    ]);

    // ─── Phase 2: Orchestrator synthesizes all results ────────────────────────
    onUpdate(
        "orchestrator",
        "running",
        { startedAt: Date.now() },
        createLog("orchestrator", AGENTS_META.orchestrator.name, "All agents complete. Orchestrator is synthesizing results...", "info")
    );

    const orchestratorResult = await runAgent(
        "orchestrator",
        () => runOrchestrator(atsResult, technicalResult, writingResult, recruiterResult, jobTitle),
        onUpdate
    );

    const finalLog = createLog("orchestrator", "System", `✅ Multi-agent analysis complete. Overall score: ${orchestratorResult.overallScore}/100`, "success");
    onUpdate("orchestrator", "completed", {}, finalLog);

    return {
        _isMultiAgent: true,
        ats: atsResult,
        technical: technicalResult,
        writing: writingResult,
        recruiter: recruiterResult,
        orchestrator: orchestratorResult,
        agentLogs: [],
        executedAt: Date.now(),
    };
};

export const getInitialAgentStatuses = (): AgentStatus[] =>
    Object.values(AGENTS_META).map((meta) => ({
        ...meta,
        status: "idle" as AgentStatusState,
        log: [],
    }));
