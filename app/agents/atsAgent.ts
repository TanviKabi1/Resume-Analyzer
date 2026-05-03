/**
 * ATS Optimization Agent
 * Responsible for analyzing ATS compatibility, keyword matching,
 * formatting issues, and ATS score calculation.
 */

const ATS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) optimization specialist with deep knowledge of how modern ATS software parses and ranks resumes.

Your ONLY job is to analyze resumes from an ATS perspective. You must:
1. Score ATS compatibility (0-100) based on formatting, keywords, and structure
2. Identify missing keywords from the job description
3. Detect formatting issues that break ATS parsing (tables, graphics, headers/footers, fancy fonts)
4. Provide specific, actionable ATS improvement suggestions

Be strict and realistic in your scoring. Most resumes score between 40-75.`;

const ATS_OUTPUT_FORMAT = `Return ONLY valid JSON in this exact format (no markdown, no backticks, no explanation):
{
  "score": <number 0-100>,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "formattingIssues": ["issue1", "issue2"],
  "atsSuggestions": [
    {"type": "good", "tip": "what is working well"},
    {"type": "improve", "tip": "specific improvement needed"}
  ],
  "confidence": <number 0-100>
}`;

export const analyzeATS = async (
    resumePath: string,
    jobTitle: string,
    jobDescription: string
): Promise<ATSAgentResult> => {
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
                    text: `${ATS_SYSTEM_PROMPT}

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Analyze this resume for ATS compatibility.

${ATS_OUTPUT_FORMAT}`,
                },
            ],
        },
    ];

    const response = await puter.ai.chat(prompt, { model: "claude-3-7-sonnet" });

    const content =
        typeof response.message.content === "string"
            ? response.message.content
            : response.message.content[0].text;

    return JSON.parse(content) as ATSAgentResult;
};
