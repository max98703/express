import React, { useEffect,useContext } from "react";
import { useParams, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import "../../App.css";
import { AppContext } from "../../context/AppContext"; 
function Detail() {
  const { state, fetchTrailerUrl } =
  useContext(AppContext);
  const { id } = useParams();
  useEffect(() => {
    fetchTrailerUrl(id);
  }, [id]);

  return (
    <>
      <div>
        <header
          className="detail-header"
          style={{ position: "relative", height: "200px", width: "100%" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <ReactPlayer
              url={state.trailerUrl}
              controls={true}
              width="100%"
              height="100%"
            />
          </div>
        </header>
      </div>

      {state.season && (
        <div>
          {state.season.map((episode, index) => (
            <div
              className="section"
              key={index}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                gap: "2px",
              }}
            >
              <Link
                to={`/details/${episode.imdbID}`}
                style={{ width: "100px" }}
              >
                <div className="p">Episode: {episode.Episode}</div>
                <div>{episode.Title}</div>
              </Link>
              <ReactPlayer
                url={state.trailerUrl}
                playing={false}
                controls={true}
                width="50%"
                height="100px"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Detail;
