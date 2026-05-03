import { type FormEvent, useState, useCallback } from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { runMultiAgentAnalysis, getInitialAgentStatuses } from "~/services/aiOrchestrator";
import AgentStatusCard from "~/components/AgentStatusCard";
import AgentPipeline from "~/components/AgentPipeline";
import AgentLog from "~/components/AgentLog";

export const meta = () => ([
    { title: 'AI Resume Analyzer | Upload' },
    { name: 'description', content: 'Upload your resume for a deep multi-agent AI analysis' },
]);

const Upload = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Multi-agent state
    const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(getInitialAgentStatuses());
    const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);

    const handleFileSelect = (f: File | null) => setFile(f);

    const updateAgent = useCallback((
        agentId: string,
        status: AgentStatusState,
        result: Partial<AgentStatus> = {},
        logEntry?: AgentLogEntry
    ) => {
        setAgentStatuses(prev =>
            prev.map(a => a.id === agentId ? { ...a, status, ...result } : a)
        );
        if (logEntry) {
            setAgentLogs(prev => [...prev, logEntry]);
        }
    }, []);

    const handleAnalyze = async ({
        companyName, jobTitle, jobDescription, file,
    }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
        setIsProcessing(true);
        setAgentStatuses(getInitialAgentStatuses());
        setAgentLogs([]);

        // ── Step 1: Upload PDF
        setUploadStatus('Uploading resume...');
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) { setUploadStatus('Error: Failed to upload file'); setIsProcessing(false); return; }

        // ── Step 2: Convert PDF → image
        setUploadStatus('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) { setUploadStatus('Error: Failed to convert PDF'); setIsProcessing(false); return; }

        setUploadStatus('Uploading image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) { setUploadStatus('Error: Failed to upload image'); setIsProcessing(false); return; }

        // ── Step 3: Prepare KV entry
        const uuid = generateUUID();
        const data: any = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: null,
        };
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setUploadStatus('');

        // ── Step 4: Run Multi-Agent Pipeline
        try {
            const multiAgentFeedback = await runMultiAgentAnalysis(
                uploadedFile.path,
                jobTitle,
                jobDescription,
                updateAgent
            );

            data.feedback = multiAgentFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            navigate(`/resume/${uuid}`);
        } catch (err) {
            setUploadStatus('Error: Multi-agent analysis failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;
        if (!file) return;
        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-10">
                    <h1>Smart feedback for your dream job</h1>

                    {!isProcessing && (
                        <h2>Drop your resume for a multi-agent AI evaluation</h2>
                    )}
                </div>

                {/* ── Form ── */}
                {!isProcessing && (
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 w-full max-w-2xl">
                        <div className="form-div">
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder="e.g. Google" id="company-name" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder="e.g. Software Engineer" id="job-title" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name="job-description" placeholder="Paste the full job description here..." id="job-description" />
                        </div>
                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume (PDF)</label>
                            <FileUploader onFileSelect={handleFileSelect} />
                        </div>
                        <button className="primary-button" type="submit" id="analyze-btn">
                            🚀 Launch Multi-Agent Analysis
                        </button>
                    </form>
                )}

                {/* ── Multi-Agent Processing Dashboard ── */}
                {isProcessing && (
                    <div className="processing-overlay w-full max-w-4xl">
                        <div className="processing-header">
                            <p className="processing-title">🧠 Multi-Agent AI Pipeline</p>
                            <p className="processing-subtitle">
                                {uploadStatus || '5 specialized AI agents are analyzing your resume...'}
                            </p>
                        </div>

                        {/* Pipeline diagram + log side by side */}
                        <div className="flex flex-col lg:flex-row gap-4 w-full">
                            <div className="lg:w-1/3">
                                <AgentPipeline agentStatuses={agentStatuses} />
                            </div>
                            <div className="lg:w-2/3">
                                <AgentLog logs={agentLogs} />
                            </div>
                        </div>

                        {/* Agent status cards */}
                        <div className="agent-cards-grid">
                            {agentStatuses.map(agent => (
                                <AgentStatusCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
};

export default Upload;
