/**
 * Recruiter Perspective Agent
 * Simulates recruiter first impression, estimates interview likelihood,
 * identifies red flags and overall competitiveness.
 */

const RECRUITER_SYSTEM_PROMPT = `You are a senior technical recruiter at a top-tier company (FAANG-level) who reviews hundreds of resumes per week. You have 12 years of experience making snap hiring decisions.

Your ONLY job is to simulate a recruiter's perspective on this resume. Think like a real recruiter:
- You spend about 6 seconds on first pass
- You're looking for reasons to reject OR advance the candidate
- You compare against the ideal candidate profile for this role
- You consider culture fit, trajectory, and potential red flags

Be honest, direct, and realistic. Don't sugarcoat red flags.`;

const RECRUITER_OUTPUT_FORMAT = `Return ONLY valid JSON in this exact format (no markdown, no backticks, no explanation):
{
  "recruiterScore": <number 0-100>,
  "firstImpression": "<2-3 sentence honest recruiter first impression in 6 seconds>",
  "redFlags": ["red flag 1", "red flag 2"],
  "interviewProbability": "<Low|Medium|High> - <one sentence explanation>",
  "hiringRecommendation": "<Reject|Phone Screen|Technical Interview|Strong Yes> - <brief reason>",
  "confidence": <number 0-100>
}`;

export const analyzeRecruiterPerspective = async (
    resumePath: string,
    jobTitle: string,
    jobDescription: string
): Promise<RecruiterAgentResult> => {
    const puter = (window as any).puter;
    if (!puter) throw new Error("Puter not available");

    const prompt = [
        {
            role: "user",
            content: [
                {
                    type: "file",
                    puter_path: resumePath,
                },
                {
                    type: "text",
                    text: `${RECRUITER_SYSTEM_PROMPT}

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Evaluate this resume from a recruiter's perspective.

${RECRUITER_OUTPUT_FORMAT}`,
                },
            ],
        },
    ];

    const response = await puter.ai.chat(prompt, { model: "claude-3-7-sonnet" });

    const content =
        typeof response.message.content === "string"
            ? response.message.content
            : response.message.content[0].text;

    return JSON.parse(content) as RecruiterAgentResult;
};
