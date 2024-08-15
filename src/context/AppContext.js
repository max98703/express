import React, { createContext, useState, useEffect } from "react";
import { apiurl} from "../baseUrl";
import { fetchData } from "../utils/apiUtils";
import { AuthProvider } from "./AuthContext";
import useAlertHook from '../hooks/useAlertHook';
import useDebounce from "../hooks/useDebounce";
import Alert from "../components/Alert/Alert";
import useMovieApi from "../hooks/useMovieApi";
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [id, setId] = useState(null);
  const [state, setState] = useState(initialState);
  const [alert, showAlert, hideAlert] = useAlertHook();
  const {  season, loading } = useMovieApi({ type: 'season', id });
  const {  details } = useMovieApi({ type: 'details', id });
  const {  trailerUrl } = useMovieApi({ type: 'trailer', id });

  // Effect to update state when new data is fetched
  useEffect(() => {
    if (!loading) {
      setState(prevState => ({
        ...prevState,
        season: season || [],
        details: details || null,
        trailerUrl: trailerUrl || '',
        loading: loading,
      }));
    }
  }, [season, details, trailerUrl, loading]);


  const fetchTrailerUrl = async (id) => {
    console.log(id);
    if (!id) {
      console.error("IMDB ID not found.");
      return;
    }
      setId(id)
      console.log(id);
  };


  useEffect(() => {
    const fetchInitialMovies = () => {
      setState(prev => ({ ...prev, loading: true }));
  
      Promise.all([
        fetchData(`${apiurl}&s=horror`),
        fetchData(`${apiurl}&s=action`),
        fetchData(`${apiurl}&s=bollywood`)
      ])
        .then(([horrorResponse, actionResponse, bollywoodResponse]) => {
          setState(prev => ({
            ...prev,
            horrorMovies: horrorResponse?.Search || [],
            actionMovies: actionResponse?.Search || [],
            bollywoodMovies: bollywoodResponse?.Search || [],
            loading: false,
          }));
        })
        .catch((error) => {
          console.error("Error fetching movies:", error);
          setState(prev => ({ ...prev, loading: false }));
        });
    };
  
    fetchInitialMovies();
  }, []);

  useEffect(() => {
    const getRandomMovie = () => {
      const categories = [state.actionMovies];
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

    setState((prevState) => ({
      ...prevState,
      randomMovie: getRandomMovie(),
    }));
  }, [state.horrorMovies, state.actionMovies, state.bollywoodMovies]);
  
  const fetchMoviesByCategory = async (value) => {
    try {
      const data = await fetchData(`${apiurl}&s=${value}`);
      setState(prev => ({
        ...prev,
        movies: data?.Search || [],
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  };
  const debouncedSearchValue = useDebounce(state.s, 500);
  
  const searchInput = (e) => {
    const searchTerm = e.target.value.trim();
    setState((prevState) => ({ ...prevState, s: searchTerm, showSearchResults: true }));

    if (searchTerm === "") {
      setState((prevState) => ({ ...prevState, showSearchResults: false }));
      return;
    }

    if (debouncedSearchValue){
      fetchMoviesByCategory(debouncedSearchValue);
    }
    
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setState((prevState) => ({ ...prevState, selectedCategory }));
    navigate(`/category/${selectedCategory}`);
    
  };

  const handleMovieClick = (movieName) => {
    navigate(`/movie/${movieName}`);
  };

  const handleSearchIconClick = () => {
    setState((prevState) => ({ ...prevState, showSearch: !state.showSearch, select: false }));
  };

  const closeSearchIcon = () => {
    setState((prevState) => ({
      ...prevState,
      showSearch: false,
      showSearchResults: false,
      select: true,
    }));
  };

  const handleDetailClick = (id) => {
    navigate(`/details/${id}`);
  };

  const toggleTheme = () => {
    setState((prevState) => ({ ...prevState, darkMode: !state.darkMode }));
  };

  const toggleSearch = () => {
    setState((prevState) => ({ ...prevState, searchOpen: !state.searchOpen,showSearchResults :false }));
  };

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
        <Alert
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
      </AppContext.Provider>
    </AuthProvider>
  );
};

export default AppContextProvider;
