import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import MultiAgentReport from "~/components/MultiAgentReport";

export const meta = () => ([
    { title: 'AI Resume Analyzer | Report' },
    { name: 'description', content: 'Multi-agent AI analysis of your resume' },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | MultiAgentFeedback | null>(null);
    const [resumeData, setResumeData] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading]);

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            const data = JSON.parse(resume);
            setResumeData(data);

            const resumeBlob = await fs.read(data.resumePath);
            if (!resumeBlob) return;
            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            setResumeUrl(URL.createObjectURL(pdfBlob));

            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;
            setImageUrl(URL.createObjectURL(imageBlob));

            setFeedback(data.feedback);
        };
        loadResume();
    }, [id]);

    const isMultiAgent = feedback && (feedback as MultiAgentFeedback)._isMultiAgent === true;

    return (
        <main className="!pt-0" style={{ background: isMultiAgent ? 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #1e293b 100%)' : undefined, minHeight: '100vh' }}>
            <nav className="resume-nav" style={isMultiAgent ? { background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' } : {}}>
                <Link to="/" className="back-button" style={isMultiAgent ? { color: '#fff', borderColor: 'rgba(255,255,255,0.15)' } : {}}>
                    <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" style={isMultiAgent ? { filter: 'invert(1)' } : {}} />
                    <span className={isMultiAgent ? "text-gray-300 text-sm font-semibold" : "text-gray-800 text-sm font-semibold"}>
                        Back to Home
                    </span>
                </Link>

                {isMultiAgent && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                            ✅ Multi-Agent Analysis
                        </span>
                        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                            5 AI Agents
                        </span>
                    </div>
                )}
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* ── Left: Resume Preview ── */}
                <section className={`feedback-section ${isMultiAgent ? 'bg-transparent' : "bg-[url('/images/bg-small.svg')] bg-cover"} h-[100vh] sticky top-0 items-center justify-center`}>
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                    alt="Resume Preview"
                                />
                            </a>
                        </div>
                    )}
                    {!imageUrl && (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                                <p className={`text-sm font-mono ${isMultiAgent ? 'text-gray-400' : 'text-gray-600'}`}>Loading resume...</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── Right: Report ── */}
                <section className="feedback-section">
                    {isMultiAgent ? (
                        // ── Multi-Agent Report ──
                        feedback ? (
                            <MultiAgentReport
                                feedback={feedback as MultiAgentFeedback}
                                companyName={resumeData?.companyName}
                                jobTitle={resumeData?.jobTitle}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                                    <p className="text-gray-400 text-sm font-mono">Loading agent report...</p>
                                </div>
                            </div>
                        )
                    ) : (
                        // ── Legacy Single-Agent Report ──
                        <>
                            <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                            {feedback ? (
                                <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                    <Summary feedback={feedback as Feedback} />
                                    <ATS score={(feedback as Feedback).ATS.score || 0} suggestions={(feedback as Feedback).ATS.tips || []} />
                                    <Details feedback={feedback as Feedback} />
                                </div>
                            ) : (
                                <img src="/images/resume-scan-2.gif" className="w-full" alt="Scanning resume..." />
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
