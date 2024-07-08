import React, {  useContext } from "react";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import "../../App.css";
import { AppContext } from "../../context/AppContext"; // Adjust the path as per your project structure
const Home = () => {
  const {
    horrorMovies,
    actionMovies,
    loading,
    showSearchResults,
    bollywoodMovies,
    randomMovie,
    darkMode,
    themes,
  } = useContext(AppContext);

  return (
    <>
    <div
      className="App"
      style={{
        backgroundColor: darkMode
          ? themes.dark.background
          : themes.light.background,
      }}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {randomMovie && !showSearchResults && (
            <div className="op">
              <img
                src={randomMovie.Poster}
                alt={randomMovie.Title}
                style={{ width: "100%", height: "100%" ,marginTop:"50px"}}
              />
              <div
                className="button-container"
                style={{ position: "absolute", bottom: "10px", right: "10px" }}
              >
                <div className="left-content">
                  <div>
                    <div>
                      <i className="fa fa-list"></i>
                    </div>
                    <div>Add to List</div>
                  </div>
                </div>
                <Link
                  to={`/details/${randomMovie.imdbID}`}
                  className="play-button"
                >
                  <i className="fa fa-play-circle" />
                </Link>
                <div className="right-content">
                  <div>
                    <div>
                      <i className="fa fa-info-circle"></i>
                    </div>
                    <div>Info</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!showSearchResults.length && (
            <main>
              <h5 className="genre-heading">Horror Movies</h5>
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

              <h5 className="genre-heading">Action Movies</h5>
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
              <h5 className="genre-heading">Bollywood Movies</h5>
              <div
                className="container"
                style={{ overflowX: "auto", whiteSpace: "nowrap" }}
              >
                {bollywoodMovies.map((movie, index) => (
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
            </main>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default Home;
