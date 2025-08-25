import React from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'

const Movies = () => {

  const { shows } = useAppContext();
  {/*we are going to return movie list if the showdata length>0 hence we are using ternary operator to display another div */}
  return shows.length>0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />
      <h1 className='text-lg font-medium my-4'>Now Showing</h1>
      <div className='grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'>
        {shows.map((movie)=>(<MovieCard movie={movie} key={movie._id} />))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-3xl font-bold text-center'>No Movies Available</h1>
    </div>
  )
}

export default Movies