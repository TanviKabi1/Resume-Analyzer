/**
 * Orchestrator Agent
 * Synthesizes outputs from all 4 specialist agents,
 * detects conflicts, and generates a unified final analysis.
 */

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Master Orchestrator Agent in a multi-agent AI resume analysis system. You receive structured JSON outputs from 4 specialist AI agents that have independently analyzed the same resume:

1. ATS Agent — focused on ATS compatibility and keyword matching
2. Technical Agent — focused on technical skills and projects
3. Writing Agent — focused on writing quality and impact
4. Recruiter Agent — focused on recruiter first impression and interview probability

Your job is to:
1. Synthesize all 4 analyses into a single unified evaluation
2. Detect any scoring disagreements between agents (e.g., ATS scores 80 but Recruiter scores 40 — analyze why)
3. Calculate a weighted overall score: ATS (25%) + Technical (30%) + Writing (20%) + Recruiter (25%)
4. Generate a clear priority-ordered list of improvements
5. Write a final executive summary that a candidate can act on immediately

Be analytical, balanced, and brutally honest. Prioritize improvements by impact.`;

const ORCHESTRATOR_OUTPUT_FORMAT = `Return ONLY valid JSON in this exact format (no markdown, no backticks, no explanation):
{
  "overallScore": <weighted number 0-100>,
  "finalVerdict": "<one powerful sentence verdict>",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "prioritizedImprovements": [
    {"priority": "high", "action": "specific immediate action"},
    {"priority": "high", "action": "specific immediate action"},
    {"priority": "medium", "action": "medium priority action"},
    {"priority": "medium", "action": "medium priority action"},
    {"priority": "low", "action": "nice-to-have improvement"}
  ],
  "finalSummary": "<3-4 sentence executive summary for the candidate>",
  "consensusAnalysis": "<2-3 sentences on where all agents agree>",
  "agentDisagreements": ["disagreement 1 with explanation", "disagreement 2 if any"]
}`;

export const runOrchestrator = async (
    atsResult: ATSAgentResult,
    technicalResult: TechnicalAgentResult,
    writingResult: WritingAgentResult,
    recruiterResult: RecruiterAgentResult,
    jobTitle: string
): Promise<OrchestratorResult> => {
    const puter = (window as any).puter;
    if (!puter) throw new Error("Puter not available");

    const agentSummary = `
=== ATS AGENT OUTPUT ===
Score: ${atsResult.score}/100
Missing Keywords: ${atsResult.missingKeywords.join(", ")}
Formatting Issues: ${atsResult.formattingIssues.join(", ") || "None detected"}
Confidence: ${atsResult.confidence}%

=== TECHNICAL SKILLS AGENT OUTPUT ===
Score: ${technicalResult.skillScore}/100
Matched Skills: ${technicalResult.matchedSkills.join(", ")}
Missing Skills: ${technicalResult.missingSkills.join(", ")}
Project Evaluation: ${technicalResult.projectEvaluation}
Confidence: ${technicalResult.confidence}%

=== WRITING & IMPACT AGENT OUTPUT ===
Score: ${writingResult.writingScore}/100
Weak Bullets: ${writingResult.weakBullets.join(" | ")}
Grammar Issues: ${writingResult.grammarIssues.join(", ") || "None found"}
Tone Feedback: ${writingResult.toneFeedback}
Confidence: ${writingResult.confidence}%

=== RECRUITER PERSPECTIVE AGENT OUTPUT ===
Score: ${recruiterResult.recruiterScore}/100
First Impression: ${recruiterResult.firstImpression}
Red Flags: ${recruiterResult.redFlags.join(", ") || "None"}
Interview Probability: ${recruiterResult.interviewProbability}
Hiring Recommendation: ${recruiterResult.hiringRecommendation}
Confidence: ${recruiterResult.confidence}%
`;

    const prompt = `${ORCHESTRATOR_SYSTEM_PROMPT}

Job Title Being Applied For: ${jobTitle}

Here are the 4 agent outputs:
${agentSummary}

Now synthesize these into a final unified analysis.

${ORCHESTRATOR_OUTPUT_FORMAT}`;

    const response = await puter.ai.chat(prompt, { model: "claude-3-7-sonnet" });

    const content =
        typeof response.message.content === "string"
            ? response.message.content
            : response.message.content[0].text;

    return JSON.parse(content) as OrchestratorResult;
};
