import { API_BASE_URL } from '../config/api';

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom =>{
    if (error){
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

export const setAccessToken = (token) => {
  accessToken = token;
}

export const getAccessToken = () => {
  return accessToken;
}

export const clearAuthTokens = () => {
  accessToken = null;
}

export const getRefreshToken = () => {
    return refreshToken;
}

export const setRefreshToken = (refToken) => {
  refreshToken = refToken;
}

export const fetchWithAuth = async (url, options = {}) => {
  const originalRequest = { url, options };
  let headers = options.headers || {};
  if (accessToken){
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  options.headers = headers;
  try{
    let response = await fetch(url, options);
    if (response.status === 401 &&  !options._retry){
      options._retry = true;

      if (isRefreshing){
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newAccessToken => {
          originalRequest.options.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return fetch(originalRequest.url, originalRequest.options);
        }).catch(err => {
          throw err;
        });
      }

      isRefreshing = true;
      try{
        const currentRefreshToken = getRefreshToken();
        if (!currentRefreshToken) {
            throw new Error("No refresh token found in memory. Please log in again.");
        }
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser){
          throw new Error("No User found");
        }
        const parsedUser = JSON.parse(storedUser);
        const refreshResponseData = await internalRefreshTokenApi(currentRefreshToken, parsedUser.userId);
        const newAccessToken = refreshResponseData.token;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
        originalRequest.options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(originalRequest.url, originalRequest.options);
      } catch(refreshError){
        console.err("Refresh token failed, logging out:", refreshError);
        processQueue(refreshError);
        clearAuthTokens();
        throw new Error("Session expired. Please log in again.");
      }
      finally{
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Http error! status: ${response.status}`)
    }
    return response;
  } catch (error){
    console.error("Fetch with Auth error:", error);
    throw error;
  }
}

export const loginApi = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ username, password}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("error data",errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error during login API call:", error);
    throw error;
  }
};

export const completeTwoFactorSetupApi = async (userId, code) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/complete-2fa-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ userId, code }),
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error){
    console.error("Error Complete Two Factor Setup API call:", error);
    throw error;
  }
};

export const recoverTwoFactorApi = async (userId, recoveryCode) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/recover2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ userId, recoveryCode }),
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error){
    console.error("Error Recovery Two Factor Setup API call:", error);
    throw error;
  }
}

const internalRefreshTokenApi  = async (refreshToken, userId) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/RefreshToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refreshToken, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("error data",errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error){
    console.errpr("Error during Refresh Token API call:", error)
    throw error;
  }
}
export const refreshTokenApi = internalRefreshTokenApi;

export const changePasswordAPI = async (passData) => {
  try{
    const response = await fetchWithAuth(`${API_BASE_URL}/Authentication/ChangePassword`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(passData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
  catch(error){
    console.error("Error Password Change for user:", error);
    throw error;
  }
}

export const forgetPasswordApi = async (email, otp, password) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/Forget`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email, otp, password }),
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error){
    console.error("Error forget password API call:", error);
    throw error;
  }
};
