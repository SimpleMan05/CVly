import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import {Navbar} from "../components/Navbar"
import {resumes} from "../../constants/index"
import {ResumeCard} from "../components/ResumeCard"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CVly" },
    { name: "description", content: "Smart Feedback for your dream job" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    <section className = "main-section">
      <div className="page-heading py-16">
        <h1>Track your Applications & Resume Ratings</h1>
        <h2>Review your Submissions and check AI-powered feedback</h2>

      </div>

    

      {resumes.length>0 && 
      (
        <div className="resumes-section">
          {resumes.map((resume)=>(
            <div>
              <ResumeCard key = {resume.id} resume = {resume}/>
            </div>
          ))}
        </div>) }
    </section>
    

  


  </main>
}
