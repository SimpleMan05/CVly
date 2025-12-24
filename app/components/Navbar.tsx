import React from 'react'
import { Link } from 'react-router'


export function Navbar() {
  return (
    <nav className='navbar'>
        {/* to HomePage */}
        <Link to='/'>  
            <p>CVly</p>
        </Link>

        <Link to="/upload" className='primary-button w-fit font-serif'>Upload Resume</Link>

    </nav>
  )
}

