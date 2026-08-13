import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import {CURATED_MODELS} from "../../constants";

export const meta = () => ([
    { title: 'CVly | Review' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [model, setModel] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const [resumeBlob, imageBlob] = await Promise.all([
                fs.read(data.resumePath),
                fs.read(data.imagePath),
            ]);

            if(!resumeBlob || !imageBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            setModel(data.model);
        }

        loadResume();
    }, [id]);

    const modelLabel = CURATED_MODELS.find((m) => m.id === model)?.label || model;

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Back to homepage</span>
                </Link>
                {modelLabel && (
                    <span className="eyebrow">Analyzed with {modelLabel}</span>
                )}
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section h-[100vh] sticky top-0 items-center justify-center" style={{ background: "var(--bg)" }}>
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <p className="eyebrow">Review</p>
                    <h2 className="text-4xl font-display font-bold" style={{ color: "var(--ink)" }}>Resume review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 pt-8">
                            <img src="/images/resume-scan-2.gif" className="w-full max-w-sm" alt="Analyzing" />
                            <p className="text-ink-faint">Waiting for the analysis to finish...</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
