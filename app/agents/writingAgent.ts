/**
 * Resume Writing & Impact Agent
 * Responsible for evaluating writing quality, grammar, bullet points,
 * achievement statements and overall professionalism.
 */

const WRITING_SYSTEM_PROMPT = `You are a professional resume writer and career coach who has reviewed over 10,000 resumes. You specialize in transforming weak, vague resumes into powerful, achievement-driven documents.

Your ONLY job is to analyze the writing quality of this resume. You must:
1. Score overall writing quality (0-100)
2. Identify the 3 weakest bullet points that lack impact or are too vague
3. Find grammar, spelling, or punctuation issues
4. Provide rewritten examples of weak bullets that are stronger (quantified, action-oriented)
5. Assess the professional tone and voice

Focus on: passive vs active voice, quantifiable achievements, strong action verbs, clarity.`;

const WRITING_OUTPUT_FORMAT = `Return ONLY valid JSON in this exact format (no markdown, no backticks, no explanation):
{
  "writingScore": <number 0-100>,
  "weakBullets": ["original weak bullet 1", "original weak bullet 2", "original weak bullet 3"],
  "grammarIssues": ["issue description 1", "issue description 2"],
  "rewrittenExamples": [
    {"original": "weak bullet text", "improved": "stronger rewritten version"},
    {"original": "weak bullet text", "improved": "stronger rewritten version"}
  ],
  "toneFeedback": "<2-3 sentence evaluation of tone and professionalism>",
  "confidence": <number 0-100>
}`;

export const analyzeWriting = async (
    resumePath: string,
    jobTitle: string,
    jobDescription: string
): Promise<WritingAgentResult> => {
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
                    text: `${WRITING_SYSTEM_PROMPT}

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Analyze the writing quality of this resume.

${WRITING_OUTPUT_FORMAT}`,
                },
            ],
        },
    ];

    const response = await puter.ai.chat(prompt, { model: "claude-3-7-sonnet" });

    const content =
        typeof response.message.content === "string"
            ? response.message.content
            : response.message.content[0].text;

    return JSON.parse(content) as WritingAgentResult;
};
