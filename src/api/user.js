import {API_BASE_URL as API_URL} from '../config/api';

const API_BASE_URL = API_URL;

export const getAllUsersApi = async (orgId, token) => {
  let url = `${API_BASE_URL}/Authentication`;
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
        'ngrok-skip-browser-warning': '69420',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const createUserApi = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication/Register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    // const data = await response.json();
    // return data;
    return { success: true, message: "User created successfully." };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUserByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication/GetUserById?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user by Id:", error);
    throw error;
  }
};

export const updateUserApi = async (userData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication/Update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, message: "User updated successfully." };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUserApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Authentication?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};