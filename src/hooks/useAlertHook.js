import { useState, useCallback } from 'react';

const useAlertHook = (initialState = { message: '', type: '' }) => {
  const [alert, setAlert] = useState(initialState);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ message, type });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert({ message: '', type: '' });
  }, []);

  return [alert, showAlert, hideAlert];
};

export default useAlertHook;
 