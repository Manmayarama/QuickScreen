import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircle, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {

  const navigate = useNavigate();
  const { shows, axios, getToken, user, fetchFavoriteMovies, favoriteMovies, imageBaseUrl } = useAppContext();
  {/*state variables for getting movie id and show details */ }
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [trailerUrl, setTrailerUrl] = useState(null);

  {/*function to fetch show details */ }
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
        // fetch trailer
        const videoRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        const trailers = videoRes.data.results.filter(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        if (trailers.length > 0) {
          setTrailerUrl(`https://www.youtube.com/watch?v=${trailers[0].key}`);
        } else {
          // fallback: search on YouTube
          setTrailerUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.movie.title + " trailer")}`);
        }

      } else {
        navigate('/movies');
      }
    } catch (error) {
      console.error(error);
    }
  }



  {/*Function to handle the favorite movies */ }
  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("You need to be logged in to add favorites");
      const { data } = await axios.post(`/api/user/update-favorites`, { movieId: id }, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  {/*useEffect is used to run the above function autometically when the component is loaded */ }
  useEffect(() => { getShow() }, [id])
  {/*we are going to display this div only when we have show data hence ternary operator used */ }
  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img src={imageBaseUrl + show.movie.poster_path} className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />
        <div className='relative flex flex-col gap-3'>
          <BlurCircle top="-100px" left="-100px" />
          <p className='text-primary'>English</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-primary fil-primary' />
            {show.movie.vote_average.toFixed(1)} Rating
          </div>
          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
          <p>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map(genre => genre.name).join(", ")} • {show.movie.release_date.split("-")[0]}
          </p>
          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button onClick={() => window.open(trailerUrl, "_blank")}
              className='flex items-center gap-2 px-7 py-3 text-medium bg-gary-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
              <PlayCircle className='w-5 h-5' />
              Watch Trailer</button>
            <a href='#dateSelect' className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>Buy Tickets</a>
            <button onClick={handleFavorite} className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5 ${favoriteMovies.find(movie => movie._id === id) ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/*div for cast section */}
      <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
      <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
        <div className='flex items-center gap-4 w-max px-4'>
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className='flex flex-col items-center text-center'>
              <img src={imageBaseUrl + cast.profile_path} className='rounded-full h-20 md:h-20 aspect-square object-cover' />
              <p className='font-medium text-xs mt-3'>{cast.name}</p>
            </div>
          ))}
        </div>
      </div>
      <DateSelect dateTime={show.dateTime} id={id} />

      {/*You may like section */}
      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
      <div className='grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      {/* Show More Button */}
      <div className='flex justify-center mt-20'>
        <button
          className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'
          onClick={() => {
            navigate('/movies')
            scrollTo(0, 0)
          }}
        >
          Show more</button>
      </div>

    </div>
  ) : <div> <Loading /> </div>
}

export default MovieDetails