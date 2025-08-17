import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import AboutUs from './pages/AboutUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import AdminProtectedRoute from './components/AdminProtectedRoute'

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')/*State variable to check user or admin */

  return (
    <>
      <Toaster /> {/*Toaster is used to show notification it is used before the all components so that notification can be displayed any component*/}
      {!isAdminRoute && <Navbar />} {/*Displaying the navbar only if it is user */}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/about-us' element={<AboutUs />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favorite' element={<Favorite />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path='/admin' element={<AdminProtectedRoute />}> {/*Admin protected route to protect the admin routes*/}
          <Route path='/admin/*' element={<Layout />}>
            {/*Placeholder for admin panel, can be replaced with actual admin component*/}
            <Route index element={<Dashboard />} />
            <Route path='add-shows' element={<AddShows />} />
            <Route path='list-shows' element={<ListShows />} />
            <Route path='list-bookings' element={<ListBookings />} />
          </Route>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />} {/*Displaying the footer only if it is user*/}
    </>
  )
}

export default App