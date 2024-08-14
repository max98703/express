import { useState, useEffect } from "react";
import { fetchData } from "../utils/apiUtils";
import { apiurl, youtubeapi } from "../baseUrl";

const useMovieApi = (configObj) => {
  const { type, id } = configObj;
  const [data, setData] = useState({
    season: [],
    details: null,
    trailerUrl: null,
    loading: false,
  });

 
  const fetchDataFromApi = async () => {
    if (!id) return; 
    setData((prevState) => ({ ...prevState, loading: true }));
    try {
      let result;
      switch (type) {
        case "season":
          result = await fetchData(`${apiurl}&i=${id}&season=1`);
          setData((prevState) => ({
            ...prevState,
            season: result?.Episodes || [],
            loading: false,
          }));
          break;
        case "details":
          result = await fetchData(`${apiurl}&i=${id}`);
          console.log(result);
          setData((prevState) => ({
            ...prevState,
            details: result || null,
            loading: false,
          }));
          break;
        case "trailer":
          console.log(id);
          const videoData = await fetchData(`${youtubeapi}&i=${id}`);
          const videoId = videoData?.items[0]?.id?.videoId;
          const trailerUrl = videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : null;
          console.log(trailerUrl);
          setData((prevState) => ({
            ...prevState,
            trailerUrl,
            loading: false,
          }));
          break;
        default:
          console.error("Invalid type");
          setData((prevState) => ({ ...prevState, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData((prevState) => ({ ...prevState, loading: false }));
    }
  };

  useEffect(() => {
    if (type && id) {
      fetchDataFromApi();
    }
  }, [type, id]); 

  return data;
};

export default useMovieApi;
