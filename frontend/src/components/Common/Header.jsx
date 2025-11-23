import React from 'react'
import Topbar from '../Layout/Topbar.jsx'
import Navbar from './Navbar.jsx'


const Header = () => {
  return (
    <header className='border-b border-gray-200'>

    <Topbar/>

    <Navbar/>

    </header>
  )
}

export default Header