import React from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
      <AdminNavbar /> {/* Admin Navbar for admin panel */}
      <div className='flex'>
        <AdminSidebar /> {/* Admin Sidebar for admin panel */}
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
          <Outlet /> {/* Outlet to render nested routes for admin panel */}
        </div>
      </div>
      
    </>
  )
}

export default Layout