// Shared KV key prefix - every resume record is stored as `resume:<uuid>`.
export const RESUME_KV_PREFIX = "resume:";

// A curated shortlist shown as quick-select chips in the upload form.
// Puter proxies 500+ models (puter.ai.listModels()); we fetch the live list
// at runtime for the searchable dropdown, but surface these well-known ones
// up front since scrolling a 500-item list isn't a good default experience.
export interface CuratedModel {
  id: string;
  label: string;
  provider: string;
}

export const CURATED_MODELS: CuratedModel[] = [
  { id: "claude-sonnet-5", label: "Claude Sonnet 5", provider: "Anthropic" },
  { id: "claude-opus-4-5", label: "Claude Opus 4.5", provider: "Anthropic" },
  { id: "gpt-5.4-chat", label: "GPT-5.4", provider: "OpenAI" },
  { id: "gpt-5.4-nano", label: "GPT-5.4 Nano", provider: "OpenAI" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "Google" },
  { id: "deepseek-chat", label: "DeepSeek Chat", provider: "DeepSeek" },
  { id: "grok-4", label: "Grok 4", provider: "xAI" },
  { id: "llama-3.3-70b", label: "Llama 3.3 70B", provider: "Meta" },
];

export const DEFAULT_MODEL = CURATED_MODELS[0].id;

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

// Placeholders a custom prompt can use - substituted before sending to the model.
export const PROMPT_PLACEHOLDERS = [
  { token: "{{jobTitle}}", description: "The job title the user typed in" },
  { token: "{{jobDescription}}", description: "The job description the user pasted in (may be empty)" },
  { token: "{{companyName}}", description: "The company name the user typed in" },
] as const;

interface PromptVars {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}

// The default, built-in analysis prompt.
function defaultPromptBody({ jobTitle, jobDescription }: PromptVars) {
  return `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}`;
}

function substitutePlaceholders(template: string, vars: PromptVars): string {
  return template
    .replaceAll("{{jobTitle}}", vars.jobTitle || "(not provided)")
    .replaceAll("{{jobDescription}}", vars.jobDescription || "(not provided)")
    .replaceAll("{{companyName}}", vars.companyName || "(not provided)");
}

// Builds the final prompt sent to the model. If a custom prompt is supplied,
// its placeholders are substituted, but the required JSON output schema is
// always appended afterward - this keeps the app's parsing reliable even if
// a custom prompt forgets to ask for structured JSON.
export function prepareInstructions({
  jobTitle,
  jobDescription,
  companyName = "",
  customPrompt,
}: {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  customPrompt?: string;
}) {
  const vars: PromptVars = { jobTitle, jobDescription, companyName };

  const body = customPrompt?.trim()
    ? substitutePlaceholders(customPrompt, vars)
    : defaultPromptBody(vars);

  return `${body}
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;
}
