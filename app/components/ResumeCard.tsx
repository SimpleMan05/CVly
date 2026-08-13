import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

interface ResumeCardProps {
    resume: Resume;
    onDelete?: (resume: Resume) => void;
}

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
    </svg>
);

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, createdAt }, onDelete, resume }: ResumeCardProps & { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let objectUrl = '';
        let cancelled = false;

        const loadResume = async () => {
            try {
                const blob = await fs.read(imagePath);
                if (cancelled) return;
                if (!blob) {
                    setImageLoadFailed(true);
                    return;
                }
                objectUrl = URL.createObjectURL(blob);
                setResumeUrl(objectUrl);
            } catch (err) {
                // Most commonly: the file no longer exists (subject_does_not_exist),
                // e.g. a resume whose files were removed but whose KV record
                // briefly survived. Show a clear placeholder instead of leaving
                // an unhandled rejection and a permanently pulsing skeleton.
                if (!cancelled) setImageLoadFailed(true);
            }
        }

        loadResume();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imagePath]);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirming) {
            setConfirming(true);
            return;
        }
        setDeleting(true);
        onDelete?.(resume);
    };

    const handleCancelClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirming(false);
    };

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000 relative">
            <button
                type="button"
                onClick={handleDeleteClick}
                disabled={deleting}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={{
                    background: confirming ? "var(--accent)" : "var(--bg-raised)",
                    color: confirming ? "var(--accent-ink)" : "var(--ink-faint)",
                    border: "1px solid var(--border-strong)",
                }}
                aria-label={confirming ? "Confirm delete" : "Delete resume"}
                title={confirming ? "Click again to permanently delete" : "Delete resume"}
            >
                <TrashIcon />
                {confirming && <span>{deleting ? "Deleting..." : "Confirm"}</span>}
            </button>
            {confirming && !deleting && (
                <button
                    type="button"
                    onClick={handleCancelClick}
                    className="absolute top-3 right-[104px] z-10 rounded-full px-2.5 py-1.5 text-xs font-medium"
                    style={{ background: "var(--bg-raised)", color: "var(--ink-faint)", border: "1px solid var(--border-strong)" }}
                >
                    Cancel
                </button>
            )}

            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="font-display font-bold text-xl break-words" style={{ color: "var(--ink)" }}>{companyName}</h2>}
                    {jobTitle && <h3 className="text-base break-words text-ink-faint">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="font-display font-bold text-xl" style={{ color: "var(--ink)" }}>Resume</h2>}
                    {createdAt && (
                        <p className="text-xs text-ink-faint">
                            Uploaded {new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback === "" ? 0 : feedback.overallScore} />
                </div>
            </div>
            {resumeUrl ? (
                <div className="gradient-border animate-in fade-in duration-1000 !p-0 overflow-hidden">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    </div>
                </div>
                ) : imageLoadFailed ? (
                <div
                    className="w-full h-[350px] max-sm:h-[200px] rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--border)" }}
                >
                    <p className="text-xs text-ink-faint px-4 text-center">Preview unavailable</p>
                </div>
                ) : (
                <div className="w-full h-[350px] max-sm:h-[200px] rounded-2xl animate-pulse" style={{ background: "var(--border)" }} />
            )}
            {feedback === "" && (
                <p className="text-xs text-ink-faint text-center">Analysis in progress or incomplete</p>
            )}
        </Link>
    )
}
export default ResumeCard