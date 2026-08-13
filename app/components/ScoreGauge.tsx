import { useEffect, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
    const [pathLength, setPathLength] = useState(0);
    const [animatedScore, setAnimatedScore] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);

    const percentage = animatedScore / 100;

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setAnimatedScore(score));
        return () => cancelAnimationFrame(raf);
    }, [score]);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-20">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - percentage)}
                        style={{ transition: "stroke-dashoffset 1.1s ease-out" }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <div className="text-xl font-semibold pt-4" style={{ color: "var(--ink)" }}>{score}/100</div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;
