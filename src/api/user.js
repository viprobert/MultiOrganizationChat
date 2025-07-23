import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getAllUsersApi = async (orgId) => {
  let url = `${API_BASE_URL}/User`;
  const queryParams = new URLSearchParams();

  if (orgId !== undefined && orgId !== null){
    queryParams.append('orgId', orgId.toString());
  }
  if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
  }
  try {
    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: {
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

export const createUserApi = async (userData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/User/Register`, {
      method: 'POST',
      headers: {
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

export const getUserByIdApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/User/GetUserById?id=${id}`, {
      method: 'GET',
      headers: {
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

export const updateUserApi = async (userData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/User/Update`, {
      method: 'PUT',
      headers: {
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

export const updateProfileApi = async (userData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/User/UpdateProfile`, {
      method: 'PUT',
      headers: {
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

export const deleteUserApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/User?id=${id}`, {
      method: 'DELETE',
      headers: {
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

export const changeAgentStatusApi = async (agentId, isOnline) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/User/ChangeStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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