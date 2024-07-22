import { useCallback } from 'react';
import { fetchData } from '../utils/apiUtils';
import { apiurl, youtubeapi } from '../baseUrl';


const useMovieApi = () => {
  
  const fetchDataMemoized = useCallback(fetchData, []);

  const fetchMoviesByCategory = useCallback(async (value) => {
    try {
      const data = await fetchDataMemoized(`${apiurl}&s=${value}`);
      return data?.Search || [];
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  }, []);

  const fetchSeason = useCallback(async (id) => {
    try {
      const result = await fetchDataMemoized(`${apiurl}&i=${id}&season=1`);
      return result?.Episodes || [];
    } catch (error) {
      console.error('Error fetching season data:', error);
      return [];
    }
  }, []);

  const fetchDetails = useCallback(async (id) => {
    try {
      const result = await fetchDataMemoized(`${apiurl}&i=${id}`);
      return result || null;
    } catch (error) {
      console.error('Error fetching details data:', error);
      return null;
    }
  }, []);

  const fetchYouTubeVideoByIMDB = useCallback(async (imdbID) => {
    try {
      const data = await fetchDataMemoized(`${youtubeapi}&i=${imdbID}`);
      const videoId = data?.items[0]?.id?.videoId;
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
    } catch (error) {
      console.error('Error fetching YouTube video:', error);
      return null;
    }
  }, []);

  return {
    fetchMoviesByCategory,
    fetchSeason,
    fetchDetails,
    fetchYouTubeVideoByIMDB,
  };
};

export default useMovieApi;
