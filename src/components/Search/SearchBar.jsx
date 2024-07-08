import React, { useContext } from "react";
import "./SearchBar.css"; // Import your CSS file for styling
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const SearchBar = () => {
  const {
    horrorMovies,
    actionMovies,
    state,
    searchInput,
    showSearchResults,
    movies,
    searchOpen,
    toggleSearch,
  } = useContext(AppContext);

  return (
    <>
      
      <div className={`search-bar-container w-full ${searchOpen ? 'active' : ''}`}>
        <div className=" nav fixed w-full">
          <i
           onClick={toggleSearch}
            class="fa fa-arrow-left"
            style={{ fontSize: "24px" }}
            aria-hidden="true"
          ></i>
          <input
            type="search"
            id="location-search"
            value={state.s}
            onChange={searchInput}
            class="block p-2.5 w-full h-16 mt-4 z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
            placeholder="Search Movie , Series , Tv shows"
            autoComplete="off"
          />
        </div>
        {showSearchResults && (
          <div>
            {movies.length > 0 ? (
              <>
                <div className="contain">
                  <h5 className="genre-heading">Searched Movies</h5>
                  <hr className="line-below"></hr>
                  <div
                    className="grid"
                    style={{ overflowX: "auto", whiteSpace: "nowrap" }}
                  >
                    {movies.map((movie, index) => (
                      <Link
                        key={movie.imdbID}
                        className="item"
                        to={`/details/${movie.imdbID}`}
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
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="contain">
                  <h3 className="text-center font-bold">Search not found</h3>
                </div>
              </>
            )}
          </div>
        )}
        {!showSearchResults && (
          <div className="contain">
            <h5 className="genre-heading">trending Action Movie</h5>
            <div
              className="container"
              style={{ overflowX: "auto", whiteSpace: "nowrap" }}
            >
              {actionMovies.map((movie, index) => (
                <Link
                  key={movie.imdbID}
                  className="item"
                  to={`/details/${movie.imdbID}`}
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
                </Link>
              ))}
            </div>

            <h5 className="genre-heading">trending Horror Movie</h5>
            <div
              className="container"
              style={{ overflowX: "auto", whiteSpace: "nowrap" }}
            >
              {horrorMovies.map((movie, index) => (
                <Link
                  key={movie.imdbID}
                  className="item"
                  to={`/details/${movie.imdbID}`}
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
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
