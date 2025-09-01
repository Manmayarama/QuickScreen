import React, { useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Loading from '../../components/Loading'

const Layout = () => {

  const { isAdmin, fetchIsAdmin } = useAppContext();

  useEffect(() => {
    fetchIsAdmin();
  }, []);

  return isAdmin ? (
    <>
      <AdminNavbar /> {/* Admin Navbar for admin panel */}
      <div className='flex'>
        <AdminSidebar /> {/* Admin Sidebar for admin panel */}
        <div className='flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto'>
          <Outlet /> {/* Outlet to render nested routes for admin panel */}
        </div>
      </div>

    </>
  ) : <Loading />
}

export default Layout