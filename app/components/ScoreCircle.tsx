import { useEffect, useState } from "react";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;

    // Animate the arc drawing in from 0 on mount instead of snapping straight
    // to its final value.
    const [displayScore, setDisplayScore] = useState(0);
    useEffect(() => {
        const raf = requestAnimationFrame(() => setDisplayScore(score));
        return () => cancelAnimationFrame(raf);
    }, [score]);

    const progress = displayScore / 100;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="relative w-[100px] h-[100px]">
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
            >
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="var(--border)"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="var(--accent)"
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>{`${score}/100`}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
