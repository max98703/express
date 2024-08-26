// hooks/useAuth.js
import { useState, useEffect } from 'react';

const useAuth = (key = 'id_token') => {
  const [token, setToken] = useState(() => localStorage.getItem(key) || '');

  useEffect(() => {
    token ? localStorage.setItem(key, token) : localStorage.removeItem(key);
  }, [token, key]);

  const setAuthToken = (value) => setToken(value);
  const deleteAuthToken = () => setToken('');

  return [token, setAuthToken, deleteAuthToken];
};

export default useAuth;
