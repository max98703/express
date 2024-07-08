import React, { createContext, useState, useEffect, useCallback } from "react";
import { apiurl, youtubeapi } from "../baseUrl";
import { fetchData } from "../utils/apiUtils";
import { AuthProvider } from "./AuthContext";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  // State variables
  const [state, setState] = useState({
    s: "",
    results: [],
    selectedCategory: "all",
  });
  const [movies, setMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [bollywoodMovies, setBollywoodMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [randomMovie, setRandomMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [season, setSeason] = useState([]);
  const [darkMode, setDarkMode] = useState(true); // State to track dark mode toggle
  const [details, setDetails] = useState([]);
  const [select, setSelect] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const fetchYouTubeVideoByIMDB = useCallback(async (imdbID) => {
    try {
      const data = await fetchData(`${youtubeapi}&i=${imdbID}`);
      const videoId = data?.items[0]?.id?.videoId;
      return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
    } catch (error) {
      console.error("Error fetching YouTube video:", error);
      return null;
    }
  }, []);

  const fetchSeason = async (id) => {
    try {
      const result = await fetchData(`${apiurl}&i=${id}&season=1`);
      const episodes = result?.Episodes || [];
      setSeason(episodes);
    } catch (error) {
      console.error("Error fetching season data:", error);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const result = await fetchData(`${apiurl}&i=${id}`);
      setDetails(result);
    } catch (error) {
      console.error("Error fetching details data:", error);
    }
  };

  const fetchTrailerUrl = async (id) => {
    try {
      if (id) {
        const trailer = await fetchYouTubeVideoByIMDB(id);
        if (trailer) {
          setTrailerUrl(trailer);
          fetchSeason(id);
          fetchDetails(id);
        } else {
          console.error("Trailer not found.");
        }
      } else {
        console.error("IMDB ID not found.");
      }
    } catch (error) {
      console.error("Error fetching trailer URL:", error);
    }
  };

  const fetchMoviesByCategory = async (value) => {
    setLoading(true);
    try {
      const data = await fetchData(`${apiurl}&s=${value}`);
      console.log(data);
      setMovies(data?.Search || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const horrorResponse = await fetchData(`${apiurl}&s=horror`);
        const actionResponse = await fetchData(`${apiurl}&s=action`);
        const bollywoodResponse = await fetchData(`${apiurl}&s=bollywood`);

        setHorrorMovies(horrorResponse?.Search || []);
        setActionMovies(actionResponse?.Search || []);
        setBollywoodMovies(bollywoodResponse?.Search || []);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      setLoading(false);
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const getRandomMovie = () => {
      const categories = [actionMovies];
      const randomCategoryIndex = Math.floor(Math.random() * categories.length);
      const randomCategory = categories[randomCategoryIndex];
      if (randomCategory) {
        const randomMovieIndex = Math.floor(
          Math.random() * randomCategory.length
        );
        return randomCategory[randomMovieIndex];
      }
      return null;
    };

    setRandomMovie(getRandomMovie());
  }, [horrorMovies, actionMovies, bollywoodMovies]);

  const searchInput = (e) => {
    const searchTerm = e.target.value.trim();
    
    setState((prevState) => ({ ...prevState, s: searchTerm }));
    
    setShowSearchResults(searchTerm.length > 0);
  
    if (searchTerm === "") {
      setShowSearchResults(false);
      return;
    }
  
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fetchMoviesByCategory(searchTerm);
    }, 300);
  };
  
  let timerId;
  
  useEffect(() => {
    return () => clearTimeout(timerId);
  },[]);
  
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setState((prevState) => ({ ...prevState, selectedCategory }));
    window.location.href = `/category/${selectedCategory}`;
  };

  const handleMovieClick = (movieName) => {
    window.location.href = `/movie/${movieName}`;
  };

  const handleSearchIconClick = () => {
    setShowSearch(!showSearch);
    setSelect(false);
  };

  const closeSearchIcon = () => {
    setShowSearch(false);
    setShowSearchResults(false);
    setSelect(true);
  };

  const handleDetailClick = (id) => {
    // Redirect to details route with the ID
    window.location.href = `/details/${id}`;
  };

  const themes = {
    light: {
      foreground: "#000000",
      background: "#222222",
    },
    dark: {
      foreground: "#ffffff",
      background: "",
    },
  };

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode); // Toggle between dark and light modes
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const storedValue = sessionStorage.getItem('session');

  return (
    <AuthProvider>
      <AppContext.Provider
        value={{
          state,
          horrorMovies,
          showSearch,
          actionMovies,
          bollywoodMovies,
          loading,
          showSearchResults,
          setLoading,
          randomMovie,
          searchInput,
          handleCategoryChange,
          handleMovieClick,
          handleSearchIconClick,
          closeSearchIcon,
          handleDetailClick,
          fetchMoviesByCategory,
          movies,
          season,
          fetchTrailerUrl,
          trailerUrl,
          fetchSeason,
          themes,
          toggleTheme,
          darkMode,
          storedValue,
          toggleSearch,
          searchOpen,

        }}
      >
        {children}
      </AppContext.Provider>
    </AuthProvider>
  );
};

export default AppContextProvider;
