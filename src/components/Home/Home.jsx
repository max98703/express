import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import { AppContext } from "../../context/AppContext";

const Home = () => {
  const { state } = useContext(AppContext);

  // Determine loading state based on whether movies data is present
  const isLoading = !state.horrorMovies.length || !state.actionMovies.length || !state.bollywoodMovies.length || !state.randomMovie;

  // Function to render movie cards or loading animation
  const renderMovies = (movies) => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <Link key={index} className="item" to="#">
          <div className="card animate-pulse bg-gray-300" style={{ width: "120px", height: "170px", borderRadius: "10px" }}>
            <div className="card-content">
              <div className="animate-pulse bg-gray-300" style={{ width: "100%", height: "100%", borderRadius: "10px" }}></div>
            </div>
          </div>
        </Link>
      ));
    }

    return movies.map((movie) => (
      <Link key={movie.imdbID} className="item" to={`/details/${movie.imdbID}`}>
        <div className="card m-1" style={{ width: "120px", height: "170px", borderRadius: "10px" }}>
          <div className="card-content">
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="movie-poster"
              style={{ width: "100%", height: "100%", borderRadius: "10px" }}
            />
          </div>
        </div>
      </Link>
    ));
  };

  // Function to render loading animation for random movie
  const renderRandomMoviePlaceholder = () => (
    <div className="card animate-pulse bg-gray-300 mx-auto" style={{ width: "75%", height: "400px", borderRadius: "10px",marginTop:"50px" }}>
      <div className="card-content">
        <div className="animate-pulse bg-gray-300" style={{ width: "100%", height: "100%", borderRadius: "10px" }}></div>
      </div>
    </div>
  );

  return (
    <div className="App">
      {isLoading ? (
        renderRandomMoviePlaceholder()
      ) : (
        state.randomMovie && !state.showSearchResults && (
          <div className="op">
            <img
              src={state.randomMovie.Poster}
              alt={state.randomMovie.Title}
              style={{ width: "100%", height: "100%", marginTop: "50px" }}
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
                to={`/details/${state.randomMovie.imdbID}`}
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
        )
      )}
      {!state.showSearchResults && (
        <main>
          <h5 className="genre-heading">Horror Movies</h5>
          <div className="container" style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            {renderMovies(state.horrorMovies)}
          </div>

          <h5 className="genre-heading">Action Movies</h5>
          <div className="container" style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            {renderMovies(state.actionMovies)}
          </div>

          <h5 className="genre-heading">Bollywood Movies</h5>
          <div className="container" style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
            {renderMovies(state.bollywoodMovies)}
          </div>
        </main>
      )}
    </div>
  );
};

export default Home;
