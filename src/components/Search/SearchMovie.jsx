import React, { useEffect, useState, useCallback,useContext } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import { AppContext } from '../../context/AppContext'; // Adjust the path as per your project structure

const SearchMovie = () => {
   const {
   movies,
   loading,
   fetchMoviesByCategory,
   handleDetailClick
  } = useContext(AppContext); 

  const { movieName } = useParams();
  useEffect(() => {
    fetchMoviesByCategory(movieName);
  }, [movieName]); 

  return (
    <div className="App">
     
      {loading ? (
        <Spinner />
      ) : (
        <>
         <div className="containers">
        {movies.length > 0 ? (
         <>
            {movies.map((movie, index) => (
              <div
                key={movie.imdbID}
                className="item"
                onClick={() => handleDetailClick(movie.imdbID)}
              >
                <div className="card">
                  <div className="card-content">
                  {movie.Poster !== "N/A" ? (
                      <img
                        src={movie.Poster}
                        alt={movie.Title}
                        className="movie-poster"
                      />
                    ) : (
                      <img
                        src="https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=" 
                        alt={movie.Title}
                        className="movie-poster"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          
          
          </>
          
        ) : (
          <>
            <div >
              <div className="not">
              <h1>404</h1>
              <p>No movie found.</p>
            </div>
            </div>
          </>
        )}
        </div>
        </>
        )}
      
    </div>
  );
};

export default SearchMovie;
