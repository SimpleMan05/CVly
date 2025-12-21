import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CVly" },
    { name: "description", content: "Smart Feedback for your dream job" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <section className = "main-section">
      <div className="page-heading">
        <h1>Track your Applications & Resume Ratings</h1>
        <h2>Review your Submissions and check AI-powered feedback</h2>

      </div>

    </section>

  </main>
}
