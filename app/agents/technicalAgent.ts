/**
 * Technical Skills Evaluation Agent
 * Responsible for evaluating technical skills, comparing against JD,
 * identifying gaps and rating project relevance.
 */

const TECHNICAL_SYSTEM_PROMPT = `You are a senior technical recruiter and software engineering manager with 15+ years of experience evaluating technical candidates.

Your ONLY job is to analyze the technical skills and projects on a resume. You must:
1. Score technical skill relevance to the job (0-100)
2. Identify which skills from the job description are present in the resume
3. Identify critical skills from the JD that are missing
4. Evaluate the quality and relevance of listed projects
5. Give actionable technical improvement recommendations

Be specific about technologies, frameworks, and tools. Use the exact terms from the job description.`;

const TECHNICAL_OUTPUT_FORMAT = `Return ONLY valid JSON in this exact format (no markdown, no backticks, no explanation):
{
  "skillScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["skill1", "skill2"],
  "projectEvaluation": "<2-3 sentence evaluation of projects>",
  "recommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],
  "confidence": <number 0-100>
}`;

export const analyzeTechnicalSkills = async (
    resumePath: string,
    jobTitle: string,
    jobDescription: string
): Promise<TechnicalAgentResult> => {
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
                    text: `${TECHNICAL_SYSTEM_PROMPT}

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Analyze the technical skills and projects on this resume.

${TECHNICAL_OUTPUT_FORMAT}`,
                },
            ],
        },
    ];

    const response = await puter.ai.chat(prompt, { model: "claude-3-7-sonnet" });

    const content =
        typeof response.message.content === "string"
            ? response.message.content
            : response.message.content[0].text;

    return JSON.parse(content) as TechnicalAgentResult;
};
