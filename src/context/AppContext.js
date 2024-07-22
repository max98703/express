import React, { createContext, useState, useEffect, useContext } from "react";
import { apiurl } from "../baseUrl";
import { fetchData } from "../utils/apiUtils";
import useAlertHook from '../hooks/useAlertHook';
import Alert from "../components/Alert/Alert";
import useMovieApi from "../hooks/useMovieApi";
import { AuthProvider } from "./AuthContext";

export const AppContext = createContext();

const initialState = {
  s: "",
  results: [],
  selectedCategory: "all",
  movies: [],
  horrorMovies: [],
  actionMovies: [],
  bollywoodMovies: [],
  loading: false,
  showSearch: false,
  showSearchResults: false,
  randomMovie: null,
  trailerUrl: "",
  season: [],
  darkMode: true,
  details: [],
  select: true,
  searchOpen: false,
};

const AppContextProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [alert, showAlert, hideAlert] = useAlertHook();
  const { fetchMoviesByCategory, fetchSeason, fetchDetails, fetchYouTubeVideoByIMDB } = useMovieApi();
  let timerId;

  const fetchTrailerUrl = async (id) => {
    if (id) {
      try {
        const trailer = await fetchYouTubeVideoByIMDB(id);
        if (trailer) {
          setState(prev => ({ ...prev, trailerUrl: trailer }));
          fetchSeason(id);
          fetchDetails(id);
        }
      } catch (error) {
        console.error("Error fetching trailer URL:", error);
      }
    }
  };

  useEffect(() => {
    const fetchInitialMovies = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const [horrorResponse, actionResponse, bollywoodResponse] = await Promise.all([
          fetchData(`${apiurl}&s=horror`),
          fetchData(`${apiurl}&s=action`),
          fetchData(`${apiurl}&s=bollywood`)
        ]);

        setState(prev => ({
          ...prev,
          horrorMovies: horrorResponse?.Search || [],
          actionMovies: actionResponse?.Search || [],
          bollywoodMovies: bollywoodResponse?.Search || [],
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching movies:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchInitialMovies();
  }, []);

  useEffect(() => {
    const getRandomMovie = () => {
      const categories = [state.actionMovies];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      return randomCategory ? randomCategory[Math.floor(Math.random() * randomCategory.length)] : null;
    };

    setState(prev => ({ ...prev, randomMovie: getRandomMovie() }));
  }, [state.horrorMovies, state.actionMovies, state.bollywoodMovies]);

  const searchInput = (e) => {
    const searchTerm = e.target.value.trim();
    setState(prev => ({ ...prev, s: searchTerm, showSearchResults: searchTerm !== "" }));

    if (searchTerm === "") {
      setState(prev => ({ ...prev, showSearchResults: false }));
      return;
    }

    clearTimeout(timerId);
    timerId = setTimeout(() => fetchMoviesByCategory(searchTerm), 300);
  };

  useEffect(() => () => clearTimeout(timerId), []);

  const handleCategoryChange = (e) => {
    setState(prev => ({ ...prev, selectedCategory: e.target.value }));
    window.location.href = `/category/${e.target.value}`;
  };

  const handleMovieClick = (movieName) => window.location.href = `/movie/${movieName}`;
  const handleSearchIconClick = () => setState(prev => ({ ...prev, showSearch: !prev.showSearch, select: false }));
  const closeSearchIcon = () => setState(prev => ({ ...prev, showSearch: false, showSearchResults: false, select: true }));
  const handleDetailClick = (id) => window.location.href = `/details/${id}`;
  const toggleTheme = () => setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  const toggleSearch = () => setState(prev => ({ ...prev, searchOpen: !prev.searchOpen }));

  const contextValue = {
    state,
    searchInput,
    handleCategoryChange,
    handleMovieClick,
    handleSearchIconClick,
    closeSearchIcon,
    handleDetailClick,
    fetchMoviesByCategory,
    fetchTrailerUrl,
    toggleTheme,
    toggleSearch,
    showAlert,
    hideAlert,
  };

  return (
    <AuthProvider>
      <AppContext.Provider value={contextValue}>
        {children}
        <Alert message={alert.message} type={alert.type} onClose={hideAlert} />
      </AppContext.Provider>
    </AuthProvider>
  );
};

export default AppContextProvider;
