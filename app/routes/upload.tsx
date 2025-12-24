import React from 'react'
import { Navbar } from '~/components/Navbar'
import { useState } from 'react'
import { stat } from 'fs';

function upload() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>)=>{

    }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className = "main-section">
            <div className='page-heading py-16'>
                <h1>Smart Feedback for your Dream Job</h1>
                { isProcessing?
                (
                    <>
                    <h2>{statusText}</h2>
                    <img src="../public/images/resume-scan.gif" className = "w-full" alt="Scanning"/>
                    </>
                ):
                (
                    <>
                    <h2>Drop your resume for an ATS Score and improvement list</h2>
                    </>
                )
                }

                { !isProcessing?
                (
                    <>
                    <form id="upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                        <div className='form-div'>
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder='Company Name' id="company-name" />
                        </div>

                        <div className='form-div'>
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder='Job Title' id="job-title" />
                        </div>

                        <div className='form-div'>
                            <label htmlFor="job-description">Job Description</label>
                            <textarea  rows = {5} name="job-description" id="job-description" placeholder='job description'></textarea>
                        </div>

                        <div className='form-div'>
                            <label htmlFor="uploader">Upload resume</label>
                            <div>Uploader</div>
                        </div>

                        <button className='primary-button' type = 'submit'>ANALYZE RESUME</button>

                        
                    </form>
                    </>
                ):
                ( <>
                    </>

                )

                }

            </div>
        </section>
    </main>
  )
}

export default upload