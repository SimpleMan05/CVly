import React, { type FormEvent } from 'react'
import { Navbar } from '~/components/Navbar'
import { useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from 'constants/index';
import { AIResponseFormat } from 'constants/index';

function upload() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file,setFile] = useState<File|null>(null);
    const navigate = useNavigate();

    const {auth, isLoading, fs, ai , kv} = usePuterStore();
    //fs-> file storage
    //kv-> key-value storage

    const handleFileSelect = (file:File|null)=> {
        setFile(file)
    }

    const handleAnalyze = async({companyName, jobTitle, jobDescription, file}:{companyName:string, jobTitle:string, jobDescription:string, file:File|null})=>{
        setIsProcessing(true);

        try {
            if(!file) {
                setStatusText('ERROR: No file selected');
                return;
            }

            setStatusText('Uploading File ...')

            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setStatusText('ERROR: Failed to Upload');
                return;
            }

            setStatusText('Converting to Image')

            const imageFile = await convertPdfToImage(file);
            if (imageFile.error) {
                console.error('convertPdfToImage error:', imageFile.error);
            }

            if(!imageFile.file) {
                setStatusText(imageFile.error || 'ERROR: No image file generated');
                return;
            }

            const uploadedImg = await fs.upload([imageFile.file])
            if(!uploadedImg) {
                setStatusText('ERROR: Failed to Upload Image');
                return;
            }

            setStatusText('Preparing Data ...')

            const uuid = generateUUID();

            const data = {
                id:uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImg.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback:''
            }
            console.log(data);

            await kv.set(`resume${uuid}` , JSON.stringify(data))
            
            setStatusText('Analyzing...')

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({jobTitle,jobDescription, AIResponseFormat})
            )

            if(!feedback) {
                setStatusText('Error: Failed to analyze resume');
                return;
            }

            const rawContent = feedback.message?.content;
            const feedbackText = typeof rawContent === 'string'
                ? rawContent
                : Array.isArray(rawContent)
                    ? rawContent.join('')
                    : JSON.stringify(rawContent);

            console.log('AI feedback raw content:', rawContent);

            try {
                data.feedback = JSON.parse(feedbackText);
            } catch (parseError) {
                console.error('Failed to parse AI feedback JSON:', parseError, feedbackText);
                setStatusText('ERROR: AI response was not valid JSON');
                return;
            }

            await kv.set(`resume${uuid}` , JSON.stringify(data))

            setStatusText('Analyze complete, redirecting...')
            navigate('/');
        } catch (error) {
            console.error('handleAnalyze failed:', error);
            setStatusText(error instanceof Error ? error.message : 'ERROR: Resume analysis failed');
        } finally {
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const form = e.currentTarget.closest('form')
        if(!form)return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        handleAnalyze({companyName, jobTitle, jobDescription, file });
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
                            <FileUploader file={file} onFileSelect={handleFileSelect}/>
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
