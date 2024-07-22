import React, { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../Spinner/Spinner";
import { AppContext } from "../../context/AppContext";

const Category = () => {
  const {state, fetchMoviesByCategory, movies, handleDetailClick} = useContext(
    AppContext
  );

  const { value } = useParams();

  useEffect(() => {
    fetchMoviesByCategory(value);
  }, [value]);

  return (
    <div className="App">
      {state.loading ? (
        <Spinner />
      ) : state.movies.length > 0 ? (
        <>
          <h3>{value.charAt(0).toUpperCase() + value.slice(1)}</h3>
          <hr className="line-below" />
          <div className="containers pt-10 overflow-y-auto pb-4">
            {state.movies.map((movie) => (
              <div
                key={movie.imdbID}
                className="item"
                onClick={() => handleDetailClick(movie.imdbID)}
              >
                <div className="card">
                  <div className="card-content">
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      className="movie-poster"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="not-found">
          <h1>404</h1>
          <p>No movies found.</p>
        </div>
      )}
    </div>
  );
};

export default Category;
