import { jwtDecode } from "jwt-decode";

export const userService = {
    loggedIn: loggedIn,
    setToken: setToken,
    getToken: getToken,
    logout: logout,
    isTokenExpired: isTokenExpired,
    jwtDecode:jwtDecode,
    setUserData:setUserData,
    getUserData:getUserData,
};

function loggedIn() {
    const token = getToken();
    // token exists && is not expired
    return !!token && !isTokenExpired(token);
}

function setToken(idToken) {
    localStorage.setItem('id_token', idToken);
}

function getToken() {
    return localStorage.getItem('id_token');
}

function logout() {
    console.log("logout");
    localStorage.removeItem('id_token');
    window.location.reload();
}

function setUserData(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  function getUserData() {
    const token = getToken();
    if(!token) return;
    const decodedToken = jwtDecode(token);
    return decodedToken;
  }

function isTokenExpired(token) {
    try {
        const decoded = jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) { 
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log("expired check failed! AuthService.js", err);
        return false;
    }
}
