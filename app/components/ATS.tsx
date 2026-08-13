

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const accentBorder = score > 69
    ? 'var(--color-badge-green-text, #35562c)'
    : score > 49
      ? 'var(--color-badge-yellow-text, #7a4a10)'
      : 'var(--color-badge-red-text, #7a2e20)';

  const iconSrc = score > 69
    ? '/icons/ats-good.svg'
    : score > 49
      ? '/icons/ats-warning.svg'
      : '/icons/ats-bad.svg';

  const subtitle = score > 69
    ? 'Great job!'
    : score > 49
      ? 'Good start'
      : 'Needs improvement';

  return (
    <div
      className="rounded-2xl w-full p-6"
      style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderLeft: `3px solid ${accentBorder}` }}
    >
      <div className="flex items-center gap-4 mb-6">
        <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
        <div>
          <p className="eyebrow">ATS compatibility</p>
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>Score - {score}/100</h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--ink)" }}>{subtitle}</h3>
        <p className="text-ink-soft mb-4">
          This score represents how well your resume is likely to perform in the applicant tracking systems employers use.
        </p>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5 mt-1"
              />
              <p className="text-ink-soft">
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-ink-faint italic">
        Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
      </p>
    </div>
  )
}

export default ATS
