import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
// Initialize Pusher with your credentials
const pusher = new Pusher('4fb84dc6973c6325fe09', {
  cluster: 'ap1'
});
const channel = pusher.subscribe('my-channel');

const Feed = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    channel.bind('new-movies', function (data) {
      console.log('Received data:', data);
      setMovies((prevMovies) => [...data, ...prevMovies]);
      setLoading(false);
    });
    channel.bind('deleted-movies', function (data) {
      setMovies((prevMovies) =>
        prevMovies.filter((movie) => !data.includes(movie.id))
      );
      setLoading(false);
    });

    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/movies');
        setMovies(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();


    // Clean up Pusher bindings on component unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-900 min-h-screen overflow-y-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">Movie Feed</h1>
      {loading && <p className="text-white text-center">Loading...</p>}
      <div className="relative flex flex-col gap-6">
        {movies.map((movie, index) => (
          <div key={index} className="relative flex items-start gap-2">
            {/* Connecting Line */}
            <div className="absolute left-5 transform -translate-x-1/2 top-0 h-full w-px bg-white" style={{ height: 'calc(100% - 1rem)' }}></div>
            {/* Circular Poster Image */}
            <div
              className="relative z-10 w-12 h-12 rounded-full overflow-hidden border-4 border-gray-900"
              style={{
                backgroundImage: `url(${movie.Poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
            </div>
            {/* Movie Card with Dark Blue Background */}
            <div
              className="flex-1 bg-blue-900  p-4 border border-gray-700 relative shadow-md rounded-2xl"
              style={{
                backgroundImage: `url(${movie.Poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '300px',
              }}
            >
              <div className=" bg-opacity-10 p-4 h-full flex flex-col  justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{movie.Title}</h2>
                  <p className="text-gray-300 mb-2">{movie.Year}</p>
                  <p className="text-sm text-gray-300 mb-4">{movie.Plot}</p>
                </div>
                {/* Circular Images in a Row */}
                <div className="flex gap-1 absolute right-4 bottom-4">
                  {movie.Images.slice(0, 3).map((image, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded-full overflow-hidden border border-gray-300"
                      style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <img
                        src={image}
                        alt={`Image ${idx}`}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image'; // Placeholder if image fails to load
                          e.target.alt = 'No Image Available';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
