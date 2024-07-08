
import axios from 'axios';

export const checkTokenValidity = async () => {
    const storedUser = localStorage.getItem('user');
    const user= storedUser ? JSON.parse(storedUser) : null;

    const token = user.token;
  if (!token) {
    return false;
  }

  try {
    const response = await axios.post('http://localhost:5000/checkTokenValidity', { token });
    return response.data.valid; 
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};
