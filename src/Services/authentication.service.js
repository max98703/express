import {jwtDecode} from "jwt-decode";
import api from "../api/api";

export const userService = {
    loggedIn,
    setToken,
    getToken,
    logout,
    isTokenExpired,
    authenticateToken,
    setUserData,
    getUserData,
};

// Check if the user is logged in
function loggedIn() {
    const token = getToken();
    return !!token && isTokenExpired(token);
}

// Save the token to localStorage
function setToken(idToken) {
    localStorage.setItem("id_token", idToken);
}

// Retrieve the token from localStorage
function getToken() {
    return localStorage.getItem("id_token");
}

// Logout the user
async function logout() {
    try {
        const response = await api.post("/logout");
        if (response.data.success) {
            localStorage.removeItem("id_token");
            console.log("Logout successful");
            window.location.reload();
        } else {
            console.log("Logout failed");
        }
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

// Verify token with backend API
async function authenticateToken(token) {
    if (!token) {
        return false;
    }

    try {
        const response = await api.post("/authenticateToken", { token });
        console.log(response);
        return response.data.valid; // Assume backend returns `{ valid: true/false }`
    } catch (error) {
        console.error("Error verifying token:", error);
        return false;
    }
}

// Check if the token is expired
async function isTokenExpired(token) {
    try {
        const isValid = await authenticateToken(token); // Call the backend API
        if(isValid){
       return true
        }
        return false;
    } catch (err) {
        console.log("Token expiration check failed:", err);
        return true; // Treat as expired in case of error
    }
}

// Save user data to localStorage
function setUserData(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

// Retrieve user data from the token
function getUserData() {
    const token = getToken();
    if (!token) return null;
    const decodedToken = jwtDecode(token);
    return decodedToken;
}
