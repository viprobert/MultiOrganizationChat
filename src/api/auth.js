import {API_BASE_URL as API_URL} from '../config/api';

const API_BASE_URL = API_URL;


export const loginApi = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify({ username, password}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Data after login", data);
    return data;
  } catch (error) {
    console.error("Error during login API call:", error);
    throw error;
  }
};

export const changeAgentStatusApi = async (agentId, isOnline, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication/ChangeStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify({ agentId, isOnline }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };

  } catch (error) {
    console.error("Error changing agent status API call:", error);
    throw error;
  }
};

export const generateTwoFactorSetupApi = async (token) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/generate-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      }
    });
    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return { success: true };
  } catch (error){
    console.error("Error Generate Two Factor Setup API call:", error);
    throw error;
  }
};

export const verifyTwoFactorSetupApi = async (userId, code, token ) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/verify-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify({ userId, code }),
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  } catch (error){
    console.error("Error Verify Two Factor Setup API call:", error);
    throw error;
  }
};

export const completeTwoFactorSetupApi = async (userId, code) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/complete-2fa-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify({ userId, code }),
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error){
    console.error("Error Verify Two Factor Setup API call:", error);
    throw error;
  }
};

export const disableTwoFactorApi = async (code, token) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/disable`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify({ code }),
    });
    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  } catch (error){
    console.error("Error disable Two Factor API call:", error);
    throw error;
  }
}

export const checkUserApi = async (email) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/CheckUserByEmail?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      }
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  } catch (error){
    console.error("Error checking User By Email API call:", error);
    throw error;
  }
};

export const forgetPasswordApi = async (email, otp, password) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/Forget`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify({ email, otp, password }),
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error){
    console.error("Error forget password API call:", error);
    throw error;
  }
};
