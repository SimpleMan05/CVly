import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Cell,
} from "recharts";

const CATEGORY_LABELS: Record<string, string> = {
    toneAndStyle: "Tone & Style",
    content: "Content",
    structure: "Structure",
    skills: "Skills",
};

function CategoryChart({ feedback }: { feedback: Feedback }) {
    const data = (["toneAndStyle", "content", "structure", "skills"] as const).map((key) => ({
        name: CATEGORY_LABELS[key],
        score: feedback[key].score,
    }));

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--ink-soft)", fontSize: 13 }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} maxBarSize={18} animationDuration={1200} animationEasing="ease-out">
                    {data.map((entry, index) => (
                        <Cell key={index} fill="var(--accent)" fillOpacity={0.55 + (entry.score / 100) * 0.45} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
            : score > 49
        ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-lg" style={{ color: "var(--ink)" }}>{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-xl" style={{ color: "var(--ink)" }}>
                    <span className={textColor}>{score}</span>
                    <span className="text-ink-faint">/100</span>
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="gradient-border w-full">
            <div className="rounded-2xl w-full" style={{ background: "var(--bg-raised)" }}>
                <div className="flex flex-row items-center p-4 gap-8 max-sm:flex-col max-sm:text-center">
                    <ScoreGauge score={feedback.overallScore} />

                    <div className="flex flex-col gap-2">
                        <p className="eyebrow">Overall</p>
                        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--ink)" }}>Your Resume Score</h2>
                        <p className="text-sm text-ink-faint">
                            Calculated from the five categories below.
                        </p>
                    </div>
                </div>

                <div className="px-4 pb-4">
                    <CategoryChart feedback={feedback} />
                </div>

                <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
                <Category title="Content" score={feedback.content.score} />
                <Category title="Structure" score={feedback.structure.score} />
                <Category title="Skills" score={feedback.skills.score} />
            </div>
        </div>
    )
}
export default Summary
