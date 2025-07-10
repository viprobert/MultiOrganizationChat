import {API_BASE_URL as API_URL} from '../config/api';
const API_BASE_URL = API_URL;

export const getAllUserRolesApi = async (orgId, token) => {
  let url = `${API_BASE_URL}/UserRole`;
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
    console.error("Error fetching all user roles:", error);
    throw error;
  }
};

export const createUserRoleApi = async (roleData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/UserRole`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating user role:", error);
    throw error;
  }
};

export const getUserRoleByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/UserRole/GetById?id=${id}`, { 
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
    console.error("Error fetching user role by ID:", error);
    throw error;
  }
};

export const updateUserRoleApi = async (roleData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/UserRole`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const deleteUserRoleApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/UserRole?id=${id}`, {
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
    return { success: true, message: data.data.message};
  } catch (error) {
    console.error("Error deleting user role:", error);
    throw error;
  }
};
