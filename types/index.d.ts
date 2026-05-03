// ─── Legacy single-agent types (kept for backward compat) ─────────────────────

interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback | MultiAgentFeedback;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}

// ─── Multi-Agent Types ─────────────────────────────────────────────────────────

type AgentStatusState = "idle" | "running" | "completed" | "error";

interface AgentStatus {
    id: string;
    name: string;
    icon: string;
    status: AgentStatusState;
    startedAt?: number;
    completedAt?: number;
    duration?: number;
    confidence?: number;
    log: AgentLogEntry[];
}

interface AgentLogEntry {
    timestamp: number;
    agentId: string;
    agentName: string;
    message: string;
    type: "info" | "success" | "error" | "result";
}

// ATS Agent
interface ATSAgentResult {
    score: number;
    missingKeywords: string[];
    formattingIssues: string[];
    atsSuggestions: { type: "good" | "improve"; tip: string }[];
    confidence: number;
}

// Technical Skills Agent
interface TechnicalAgentResult {
    skillScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    projectEvaluation: string;
    recommendations: string[];
    confidence: number;
}

// Writing & Impact Agent
interface WritingAgentResult {
    writingScore: number;
    weakBullets: string[];
    grammarIssues: string[];
    rewrittenExamples: { original: string; improved: string }[];
    toneFeedback: string;
    confidence: number;
}

// Recruiter Perspective Agent
interface RecruiterAgentResult {
    recruiterScore: number;
    firstImpression: string;
    redFlags: string[];
    interviewProbability: string;
    hiringRecommendation: string;
    confidence: number;
}

// Orchestrator Agent
interface OrchestratorResult {
    overallScore: number;
    finalVerdict: string;
    strengths: string[];
    weaknesses: string[];
    prioritizedImprovements: { priority: "high" | "medium" | "low"; action: string }[];
    finalSummary: string;
    consensusAnalysis: string;
    agentDisagreements: string[];
}

// Top-level multi-agent feedback stored in KV
interface MultiAgentFeedback {
    _isMultiAgent: true;
    jobTitle?: string;
    jobDescription?: string;
    companyName?: string;
    ats: ATSAgentResult;
    technical: TechnicalAgentResult;
    writing: WritingAgentResult;
    recruiter: RecruiterAgentResult;
    orchestrator: OrchestratorResult;
    agentLogs: AgentLogEntry[];
    executedAt: number;
    totalDuration?: number;
}
