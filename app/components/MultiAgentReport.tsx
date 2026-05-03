import React, { useState } from "react";

interface MultiAgentReportProps {
    feedback: MultiAgentFeedback;
    companyName?: string;
    jobTitle?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ScoreRing = ({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) => {
    const color =
        score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
    const r = size === "lg" ? 44 : 28;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const dim = size === "lg" ? 100 : 64;

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
                <circle
                    cx={dim / 2} cy={dim / 2} r={r}
                    fill="none" stroke="#1e293b" strokeWidth={size === "lg" ? 8 : 6}
                />
                <circle
                    cx={dim / 2} cy={dim / 2} r={r}
                    fill="none" stroke={color} strokeWidth={size === "lg" ? 8 : 6}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <text
                    x="50%" y="50%"
                    textAnchor="middle" dominantBaseline="central"
                    fill={color}
                    fontSize={size === "lg" ? "18" : "11"}
                    fontWeight="bold"
                >
                    {score}
                </text>
            </svg>
        </div>
    );
};

const AgentTag = ({ agentId }: { agentId: string }) => {
    const colors: Record<string, string> = {
        ats: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
        technical: "bg-blue-500/20 text-blue-400 border-blue-500/40",
        writing: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        recruiter: "bg-pink-500/20 text-pink-400 border-pink-500/40",
        orchestrator: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    };
    const labels: Record<string, string> = {
        ats: "🎯 ATS Agent",
        technical: "⚙️ Technical Agent",
        writing: "✍️ Writing Agent",
        recruiter: "👔 Recruiter Agent",
        orchestrator: "🧠 Orchestrator",
    };
    return (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-mono font-medium ${colors[agentId]}`}>
            {labels[agentId]}
        </span>
    );
};

const PriorityBadge = ({ priority }: { priority: "high" | "medium" | "low" }) => {
    const cfg = {
        high: "bg-red-500/20 text-red-400 border-red-500/40",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
        low: "bg-gray-500/20 text-gray-400 border-gray-500/40",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${cfg[priority]}`}>
            {priority}
        </span>
    );
};

const SectionCard = ({
    title, icon, agentId, score, children, defaultOpen = false,
}: {
    title: string; icon: string; agentId: string; score: number;
    children: React.ReactNode; defaultOpen?: boolean;
}) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="report-section-card">
            <button
                className="report-section-header"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div className="text-left">
                        <p className="text-white font-semibold text-base">{title}</p>
                        <AgentTag agentId={agentId} />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ScoreRing score={score} size="sm" />
                    <span className="text-gray-400 text-lg transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▾
                    </span>
                </div>
            </button>
            {open && <div className="report-section-body">{children}</div>}
        </div>
    );
};

const Chip = ({ label, type }: { label: string; type: "good" | "bad" | "neutral" }) => {
    const cls = {
        good: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        bad: "bg-red-500/15 text-red-400 border-red-500/30",
        neutral: "bg-gray-700 text-gray-300 border-gray-600",
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-md border font-mono ${cls[type]}`}>
            {label}
        </span>
    );
};

// ── Download roadmap ───────────────────────────────────────────────────────────

const downloadRoadmap = (feedback: MultiAgentFeedback, jobTitle: string) => {
    const lines = [
        `AI-GENERATED RESUME IMPROVEMENT ROADMAP`,
        `Job Target: ${jobTitle}`,
        `Generated: ${new Date(feedback.executedAt).toLocaleString()}`,
        `Overall Score: ${feedback.orchestrator.overallScore}/100`,
        ``,
        `═══════════════════════════════════════`,
        `FINAL VERDICT`,
        `═══════════════════════════════════════`,
        feedback.orchestrator.finalVerdict,
        ``,
        `EXECUTIVE SUMMARY`,
        feedback.orchestrator.finalSummary,
        ``,
        `═══════════════════════════════════════`,
        `PRIORITIZED ACTION PLAN`,
        `═══════════════════════════════════════`,
        ...feedback.orchestrator.prioritizedImprovements.map(
            (imp, i) => `${i + 1}. [${imp.priority.toUpperCase()}] ${imp.action}`
        ),
        ``,
        `═══════════════════════════════════════`,
        `AGENT SCORES`,
        `═══════════════════════════════════════`,
        `🎯 ATS Score:        ${feedback.ats.score}/100`,
        `⚙️  Technical Score:  ${feedback.technical.skillScore}/100`,
        `✍️  Writing Score:    ${feedback.writing.writingScore}/100`,
        `👔 Recruiter Score:  ${feedback.recruiter.recruiterScore}/100`,
        `🧠 Overall Score:    ${feedback.orchestrator.overallScore}/100`,
        ``,
        `═══════════════════════════════════════`,
        `MISSING KEYWORDS (ATS Agent)`,
        `═══════════════════════════════════════`,
        feedback.ats.missingKeywords.join(", "),
        ``,
        `═══════════════════════════════════════`,
        `MISSING TECHNICAL SKILLS`,
        `═══════════════════════════════════════`,
        feedback.technical.missingSkills.join(", "),
        ``,
        `═══════════════════════════════════════`,
        `RECRUITER PERSPECTIVE`,
        `═══════════════════════════════════════`,
        `Interview Probability: ${feedback.recruiter.interviewProbability}`,
        `Hiring Recommendation: ${feedback.recruiter.hiringRecommendation}`,
        ``,
        `─── Generated by AI Resume Analyzer Multi-Agent System ───`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-improvement-roadmap-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};

// ── Main Component ─────────────────────────────────────────────────────────────

const MultiAgentReport: React.FC<MultiAgentReportProps> = ({
    feedback, companyName, jobTitle,
}) => {
    const { ats, technical, writing, recruiter, orchestrator } = feedback;

    return (
        <div className="multi-agent-report">

            {/* ── Hero Score Banner ── */}
            <div className="report-hero">
                <div className="report-hero-left">
                    <ScoreRing score={orchestrator.overallScore} size="lg" />
                    <div>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-1">Overall Score</p>
                        <p className="text-white font-bold text-xl leading-tight">{orchestrator.finalVerdict}</p>
                        {companyName && jobTitle && (
                            <p className="text-gray-400 text-sm mt-1">
                                {jobTitle} @ {companyName}
                            </p>
                        )}
                    </div>
                </div>
                <div className="report-hero-scores">
                    {[
                        { label: "ATS", score: ats.score, icon: "🎯" },
                        { label: "Technical", score: technical.skillScore, icon: "⚙️" },
                        { label: "Writing", score: writing.writingScore, icon: "✍️" },
                        { label: "Recruiter", score: recruiter.recruiterScore, icon: "👔" },
                    ].map((s) => (
                        <div key={s.label} className="mini-score-block">
                            <ScoreRing score={s.score} size="sm" />
                            <p className="text-xs text-gray-400 mt-1">{s.icon} {s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Strengths & Weaknesses ── */}
            <div className="report-sw-grid">
                <div className="report-sw-card">
                    <p className="report-sw-title text-emerald-400">✅ Strengths</p>
                    <ul className="space-y-2">
                        {orchestrator.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="text-emerald-400 mt-0.5">•</span>{s}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="report-sw-card">
                    <p className="report-sw-title text-red-400">⚠️ Weaknesses</p>
                    <ul className="space-y-2">
                        {orchestrator.weaknesses.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <span className="text-red-400 mt-0.5">•</span>{w}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ── ATS Section ── */}
            <SectionCard title="ATS Optimization Analysis" icon="🎯" agentId="ats" score={ats.score} defaultOpen>
                <div className="space-y-4">
                    {ats.missingKeywords.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Missing Keywords</p>
                            <div className="flex flex-wrap gap-2">
                                {ats.missingKeywords.map((k) => <Chip key={k} label={k} type="bad" />)}
                            </div>
                        </div>
                    )}
                    {ats.formattingIssues.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Formatting Issues</p>
                            <ul className="space-y-1">
                                {ats.formattingIssues.map((f, i) => (
                                    <li key={i} className="text-sm text-red-300 flex gap-2"><span>⚠</span>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">ATS Suggestions</p>
                        <div className="space-y-2">
                            {ats.atsSuggestions.map((s, i) => (
                                <div key={i} className={`flex gap-2 items-start text-sm p-2 rounded-lg ${s.type === "good" ? "bg-emerald-500/10 text-emerald-300" : "bg-yellow-500/10 text-yellow-300"}`}>
                                    <span>{s.type === "good" ? "✓" : "→"}</span>{s.tip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ── Technical Section ── */}
            <SectionCard title="Technical Skills Evaluation" icon="⚙️" agentId="technical" score={technical.skillScore}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Matched Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {technical.matchedSkills.map((s) => <Chip key={s} label={s} type="good" />)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Missing Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {technical.missingSkills.map((s) => <Chip key={s} label={s} type="bad" />)}
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Project Evaluation</p>
                        <p className="text-sm text-gray-300 bg-gray-800/60 p-3 rounded-lg">{technical.projectEvaluation}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recommendations</p>
                        <ul className="space-y-2">
                            {technical.recommendations.map((r, i) => (
                                <li key={i} className="text-sm text-blue-300 flex gap-2"><span className="text-blue-400">→</span>{r}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </SectionCard>

            {/* ── Writing Section ── */}
            <SectionCard title="Writing & Impact Review" icon="✍️" agentId="writing" score={writing.writingScore}>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tone Feedback</p>
                        <p className="text-sm text-gray-300 bg-gray-800/60 p-3 rounded-lg">{writing.toneFeedback}</p>
                    </div>
                    {writing.grammarIssues.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Grammar / Style Issues</p>
                            <ul className="space-y-1">
                                {writing.grammarIssues.map((g, i) => (
                                    <li key={i} className="text-sm text-red-300 flex gap-2"><span>⚠</span>{g}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {writing.rewrittenExamples.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Rewritten Bullet Examples</p>
                            <div className="space-y-3">
                                {writing.rewrittenExamples.map((ex, i) => (
                                    <div key={i} className="bg-gray-800/60 rounded-lg p-3 space-y-2">
                                        <p className="text-xs text-red-400 font-mono">BEFORE:</p>
                                        <p className="text-sm text-gray-400 italic">"{ex.original}"</p>
                                        <p className="text-xs text-emerald-400 font-mono">AFTER:</p>
                                        <p className="text-sm text-emerald-300 font-medium">"{ex.improved}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* ── Recruiter Section ── */}
            <SectionCard title="Recruiter Perspective" icon="👔" agentId="recruiter" score={recruiter.recruiterScore}>
                <div className="space-y-4">
                    <div className="bg-gray-800/60 p-4 rounded-lg border-l-4 border-pink-500">
                        <p className="text-xs text-pink-400 font-mono uppercase mb-1">6-Second First Impression</p>
                        <p className="text-sm text-gray-300">"{recruiter.firstImpression}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/40 p-3 rounded-lg">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Interview Probability</p>
                            <p className="text-sm text-white font-semibold">{recruiter.interviewProbability}</p>
                        </div>
                        <div className="bg-gray-800/40 p-3 rounded-lg">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Hiring Recommendation</p>
                            <p className="text-sm text-white font-semibold">{recruiter.hiringRecommendation}</p>
                        </div>
                    </div>
                    {recruiter.redFlags.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Red Flags</p>
                            <ul className="space-y-1">
                                {recruiter.redFlags.map((f, i) => (
                                    <li key={i} className="text-sm text-red-300 flex gap-2"><span>🚩</span>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* ── Orchestrator Final ── */}
            <div className="report-orchestrator-panel">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🧠</span>
                    <div>
                        <p className="text-white font-bold text-base">Orchestrator Final Analysis</p>
                        <AgentTag agentId="orchestrator" />
                    </div>
                </div>

                {/* Consensus */}
                <div className="mb-4">
                    <p className="text-xs text-emerald-400 font-mono uppercase tracking-wide mb-2">Agent Consensus</p>
                    <p className="text-sm text-gray-300">{orchestrator.consensusAnalysis}</p>
                </div>

                {/* Disagreements */}
                {orchestrator.agentDisagreements?.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-yellow-400 font-mono uppercase tracking-wide mb-2">Agent Disagreements</p>
                        <ul className="space-y-1">
                            {orchestrator.agentDisagreements.map((d, i) => (
                                <li key={i} className="text-sm text-yellow-300 flex gap-2"><span>⚡</span>{d}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Prioritized improvements */}
                <div className="mb-4">
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wide mb-3">Prioritized Improvement Plan</p>
                    <div className="space-y-2">
                        {orchestrator.prioritizedImprovements.map((imp, i) => (
                            <div key={i} className="flex items-start gap-3 bg-gray-800/60 p-3 rounded-lg">
                                <PriorityBadge priority={imp.priority} />
                                <p className="text-sm text-gray-300 flex-1">{imp.action}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final summary */}
                <div className="report-final-summary">
                    <p className="text-xs text-emerald-400 font-mono uppercase tracking-wide mb-2">Executive Summary</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{orchestrator.finalSummary}</p>
                </div>

                {/* Download */}
                <button
                    onClick={() => downloadRoadmap(feedback, jobTitle ?? "Role")}
                    className="download-roadmap-btn mt-6 w-full"
                >
                    ⬇ Download AI-Generated Improvement Roadmap
                </button>
            </div>
        </div>
    );
};

export default MultiAgentReport;
