import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter'
export const meta = ()=>{
    [
        {title: "CVly | Auth"},
        {name: 'description' , content : 'Log into your Account'},
    ]

}
function auth() {

    const {isLoading,auth} = usePuterStore(); //can directly access loading state from PuterStore
    
    const location = useLocation();
    const next = location.search.split("next=")[1];

    const navigate = useNavigate();


    useEffect( ()=>{   //new callback fn 
        if(auth.isAuthenticated)  navigate(next);
    }, [auth.isAuthenticated,next] //dependency array
    )

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover flex items-center justify-center">
        <div className='gradient-border shadow-lg'>
            <section className='flex flex-col gap-8 bg-white rounded-2xl p-10'>
                <div className='flex flex-col items-center gap-2 text-center'>
                    <h1>WELCOME</h1>
                    <h2>Log in to continue your Job Journey</h2>

                </div>

                <div>
                    {isLoading? (  
                        //If its loading
                            <button className='auth-button animate-pulse'>
                                <p>Signing you in ...</p>
                            </button>
                                ):
                        (  //else 
                            <>
                                {/* //if already authenticated */}
                                {auth.isAuthenticated? 
                                (<button className='auth-button' onClick={auth.signOut}> <p>Logout</p> </button>) //ask to logout
                            :(<button className='auth-button' onClick = {auth.signIn}><p>Login</p></button>)   } {/*//else, say to Login*/}
                            </>
                        )}
                </div>
                

            </section>

        </div>


    </main>
  )
}

export default auth