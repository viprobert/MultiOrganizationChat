import { API_BASE_URL } from '../config/api';

export const loginApi = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'ngrok-skip-browser-warning': '69420',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ username, password}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("error data",errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error during login API call:", error);
    throw error;
  }
};

export const generateTwoFactorSetupApi = async (userId) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/generate-setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        // 'ngrok-skip-browser-warning': '69420',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ userId }),
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
        // 'ngrok-skip-browser-warning': '69420',
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
        // 'ngrok-skip-browser-warning': '69420',
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

export const disableTwoFactorApi = async (userId, code, token) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/disable`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        // 'ngrok-skip-browser-warning': '69420',
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
    console.error("Error disable Two Factor API call:", error);
    throw error;
  }
}

export const recoverTwoFactorApi = async (userId, recoveryCode) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/twofactor/recover2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'ngrok-skip-browser-warning': '69420',
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

export const changePasswordAPI = async (passData, token) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Authentication/ChangePassword`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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
        //'Authorization': `Bearer ${token}`,
        // 'ngrok-skip-browser-warning': '69420',
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
