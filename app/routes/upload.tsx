import {type FormEvent, useEffect, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import Toast from "~/components/Toast";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID, extractResponseText, parseFeedbackJson, getPuterErrorMessage} from "~/lib/utils";
import {prepareInstructions, RESUME_KV_PREFIX, CURATED_MODELS, DEFAULT_MODEL, PROMPT_PLACEHOLDERS} from "../../constants";

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const [model, setModel] = useState(DEFAULT_MODEL);
    const [availableModels, setAvailableModels] = useState(CURATED_MODELS);
    const [useCustomPrompt, setUseCustomPrompt] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');

    useEffect(() => {
        ai.listModels().then((models) => {
            if (!models?.length) return;
            const curatedIds = new Set(CURATED_MODELS.map((m) => m.id));
            const rest = models
                .filter((m) => !curatedIds.has(m.id))
                .map((m) => ({ id: m.id, label: m.name || m.id, provider: m.provider }));
            setAvailableModels([...CURATED_MODELS, ...rest]);
        });
    }, []);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const fail = (message: string) => {
        console.error('Resume analysis failed:', message);
        setIsProcessing(false);
        setStatusText('');
        setErrorMessage(message);
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            setStatusText('Uploading and preparing your resume...');
            const [uploadedFile, imageFile] = await Promise.all([
                fs.upload([file]),
                convertPdfToImage(file),
            ]);

            if(!uploadedFile) return fail('Failed to upload your resume file. Check your connection and try again.');
            if(!imageFile.file) return fail(imageFile.error || 'Failed to convert the PDF to a preview image.');

            setStatusText('Uploading the preview image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) return fail('Failed to upload the preview image. Check your connection and try again.');

            const uuid = generateUUID();
            const data: Resume = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                createdAt: Date.now(),
                model,
                feedback: '',
            }

            setStatusText('Analyzing...');

            const instructions = prepareInstructions({
                jobTitle,
                jobDescription,
                companyName,
                customPrompt: useCustomPrompt ? customPrompt : undefined,
            });

            // Only write to KV once analysis has actually succeeded. Writing
            // an empty-feedback placeholder before the AI call meant a failed
            // analysis (bad model, network drop, invalid JSON) left a
            // half-finished "ghost" resume behind that would keep showing up
            // on Home with no way to complete or cleanly remove it.
            const feedback = await ai.feedback(uploadedFile.path, instructions, model);

            if (!feedback) {
                return fail('The AI model did not return a response. This is usually temporary - try again in a moment, or pick a different model.');
            }

            if (feedback.finish_reason === 'length') {
                return fail('The model\'s response was cut off before it finished. Try again, or pick a different model - some models write more concisely than others.');
            }

            const feedbackText = extractResponseText(feedback.message.content);

            if (!feedbackText.trim()) {
                return fail('The model returned an empty response. Try again, or pick a different model.');
            }

            try {
                data.feedback = parseFeedbackJson(feedbackText);
            } catch (parseErr) {
                console.error('Failed to parse AI feedback JSON:', parseErr, feedbackText);
                return fail('The model did not return valid JSON. Try again, or pick a different model - some follow formatting instructions more reliably than others.');
            }

            await kv.set(`${RESUME_KV_PREFIX}${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (err) {
            fail(getPuterErrorMessage(err, 'Something unexpected went wrong. Please try again.'));
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return fail('Please select a resume PDF before submitting.');

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main>
            <Navbar />

            {errorMessage && (
                <Toast message={errorMessage} onClose={() => setErrorMessage(null)} durationMs={5000} />
            )}

            <section className="main-section">
                <div className="page-heading">
                    <p className="eyebrow">New review</p>
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full max-w-md" alt="Analyzing" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    <fieldset disabled={isProcessing} className={`contents ${isProcessing ? 'opacity-60' : ''}`}>
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 max-w-xl">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="model">AI Model</label>
                                <select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
                                    {availableModels.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.label} ({m.provider})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-div">
                                <label className="flex flex-row items-center gap-2 cursor-pointer normal-case tracking-normal text-sm font-normal" style={{ color: "var(--ink)" }}>
                                    <input
                                        type="checkbox"
                                        checked={useCustomPrompt}
                                        onChange={(e) => setUseCustomPrompt(e.target.checked)}
                                        className="w-auto p-0"
                                        style={{ width: "auto" }}
                                    />
                                    Use a custom analysis prompt instead of the default
                                </label>
                                {useCustomPrompt && (
                                    <div className="flex flex-col gap-2 w-full mt-2">
                                        <textarea
                                            rows={6}
                                            value={customPrompt}
                                            onChange={(e) => setCustomPrompt(e.target.value)}
                                            placeholder="Write your own instructions for the model. Use the placeholders below to insert form values."
                                        />
                                        <div className="text-xs text-ink-faint flex flex-col gap-1">
                                            <p>Available placeholders (case-sensitive):</p>
                                            <ul className="flex flex-col gap-0.5">
                                                {PROMPT_PLACEHOLDERS.map((p) => (
                                                    <li key={p.token}>
                                                        <code className="text-accent">{p.token}</code> - {p.description}
                                                    </li>
                                                ))}
                                            </ul>
                                            <p>The required JSON output format is appended automatically - you don't need to include it.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="accent-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    </fieldset>
                </div>
            </section>
        </main>
    )
}
export default Upload