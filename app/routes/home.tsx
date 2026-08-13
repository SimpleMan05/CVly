import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import Toast from "~/components/Toast";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import { RESUME_KV_PREFIX } from "../../constants";
import { getPuterErrorMessage } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CVly" },
    { name: "description", content: "AI-powered resume feedback, instantly." },
  ];
}

const TICKER_ITEMS = [
  "AI-POWERED ATS SCORING",
  "PICK YOUR OWN MODEL",
  "BRING YOUR OWN PROMPT",
  "PRIVATE STORAGE VIA PUTER",
  "INSTANT, DETAILED FEEDBACK",
];

const FEATURES = [
  {
    title: "ATS-aware scoring",
    description: "See exactly how applicant tracking systems will read your resume before a recruiter ever does.",
  },
  {
    title: "Choose your model",
    description: "Run your analysis through Claude, GPT, Gemini, or one of hundreds of other models available through Puter.",
  },
  {
    title: "Bring your own prompt",
    description: "Swap in a custom analysis prompt when the default rubric doesn't fit what you're optimizing for.",
  },
  {
    title: "Private by design",
    description: "Your resumes live in your own Puter storage - never on a server we control.",
  },
];

export default function Home() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const items = (await kv.list(`${RESUME_KV_PREFIX}*`, true)) as KVItem[];

      const parsed = (items || [])
        .map((item) => JSON.parse(item.value) as Resume)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setResumes(parsed);
      setLoadingResumes(false);
    }

    loadResumes()
  }, []);

  const handleDelete = async (resume: Resume) => {
    // Optimistic removal for instant feedback, but keep a copy so we can
    // restore it if the actual delete fails - previously a failure here
    // (like the kv.del bug, or a network blip) left the card gone from view
    // while the underlying record silently survived, so it would reappear
    // on the next refresh with no explanation.
    setResumes((prev) => prev.filter((r) => r.id !== resume.id));

    try {
      await Promise.all([
        fs.delete(resume.resumePath),
        fs.delete(resume.imagePath),
        kv.delete(`${RESUME_KV_PREFIX}${resume.id}`),
      ]);
    } catch (err) {
      setResumes((prev) =>
        [...prev, resume].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      );
      setDeleteError(getPuterErrorMessage(err, `Couldn't delete "${resume.companyName || 'this resume'}". Please try again.`));
    }
  };

  return <main className="bg-cover">
    {deleteError && (
      <Toast message={deleteError} onClose={() => setDeleteError(null)} durationMs={5000} />
    )}

    <div className="ticker">
      <div className="ticker-track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="text-xs font-semibold tracking-wider">{item}</span>
        ))}
      </div>
    </div>

    <Navbar />

    <section className="main-section !gap-16">
      <div className="page-heading !gap-6 pt-8">
        <p className="eyebrow">AI resume review</p>
        <h1>
          Resume feedback,<br />
          <span className="font-serif italic text-accent">instantly</span> yours.
        </h1>
        <p className="text-lg max-w-xl text-ink-soft">
          Upload your resume, tell it what job you're chasing, and get a detailed,
          ATS-aware breakdown - scored, explained, and ready to act on.
        </p>
        <div className="flex flex-row gap-4 max-sm:flex-col max-sm:w-full">
          <Link to="/upload" className="accent-button w-fit max-sm:w-full text-base px-8">
            Upload your resume
          </Link>
          <a href="#your-resumes" className="ghost-button w-fit max-sm:w-full text-base px-8">
            View past reviews
          </a>
        </div>
      </div>

      <div className="w-full grid grid-cols-3 max-sm:grid-cols-1 gap-6 max-w-4xl hairline pt-12">
        <div className="flex flex-col gap-1 pt-8">
          <p className="font-display text-4xl font-black text-accent">5</p>
          <p className="text-sm text-ink-faint">scoring categories per review</p>
        </div>
        <div className="flex flex-col gap-1 pt-8">
          <p className="font-display text-4xl font-black text-accent">500+</p>
          <p className="text-sm text-ink-faint">AI models to choose from</p>
        </div>
        <div className="flex flex-col gap-1 pt-8">
          <p className="font-display text-4xl font-black text-accent">0</p>
          <p className="text-sm text-ink-faint">resumes stored on our servers</p>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-2 max-sm:grid-cols-1 gap-6 hairline pt-12">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-2 pt-8">
            <h3 className="font-display text-xl font-bold" style={{ color: "var(--ink)" }}>{feature.title}</h3>
            <p className="text-ink-soft">{feature.description}</p>
          </div>
        ))}
      </div>

      <div id="your-resumes" className="w-full flex flex-col items-center gap-8 hairline pt-12 scroll-mt-10">
        <div className="page-heading !gap-2">
          <h2 className="font-display text-3xl font-bold" style={{ color: "var(--ink)" }}>Your resumes</h2>
          {!loadingResumes && resumes?.length === 0 ? (
              <p className="text-ink-faint">No resumes found. Upload your first resume to get feedback.</p>
          ): (
            <p className="text-ink-faint">Review your submissions and check AI-powered feedback.</p>
          )}
        </div>

        {loadingResumes && (
            <div className="flex flex-col items-center justify-center">
              <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="Loading" />
            </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes?.length === 0 && (
            <Link to="/upload" className="accent-button w-fit text-base px-8">
              Upload resume
            </Link>
        )}
      </div>
    </section>
  </main>
}