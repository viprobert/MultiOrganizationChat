import {API_BASE_URL as API_URL} from '../config/api';
const API_BASE_URL = API_URL;

export const getAllUsersApi = async (orgId, token) => {
  let url = `${API_BASE_URL}/User`;
  const queryParams = new URLSearchParams();

  if (orgId !== undefined && orgId !== null){
    queryParams.append('orgId', orgId.toString());
  }
  if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const createUserApi = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/Register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/GetUserById?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user by Id:", error);
    throw error;
  }
};

export const updateUserApi = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/Update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const updateProfileApi = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/UpdateProfile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUserApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const checkUserApi = async (email) => {
  try{
    const response = await fetch(`${API_BASE_URL}/User/CheckUserByEmail?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`,
        // 'ngrok-skip-browser-warning': '69420',
        'ngrok-skip-browser-warning': 'true',
      }
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error){
    console.error("Error checking User By Email API call:", error);
    throw error;
  }
};

export const changeAgentStatusApi = async (agentId, isOnline, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/User/ChangeStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // 'ngrok-skip-browser-warning': '69420',
        'ngrok-skip-browser-warning': 'true',
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