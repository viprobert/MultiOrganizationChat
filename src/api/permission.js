import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getAllPermissionsApi = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Permission`, {
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
    console.error("Error fetching all permissions:", error);
    throw error;
  }
};

export const getPermissionToAssignApi = async () => {
  try{
    const response = await fetchWithAuth(`${API_BASE_URL}/Permission/PermsToAssign`, {
      method: 'Get',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }
  catch (error){
    console.error("Error fetching all permissions to assign:", error);
    throw error;
  }
};

export const createPermissionApi = async (permData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Permission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(permData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating permission:", error);
    throw error;
  }
};

export const getPermissionByIdApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Permission/GetById?id=${id}`, {
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
    console.error("Error fetching permission by ID:", error);
    throw error;
  }
};

export const updatePermissionApi = async (permData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Permission`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(permData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating permission:", error);
    throw error;
  }
};

export const deletePermissionApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Permission?id=${id}`, {
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
    return { success: true, message: data.data.message};
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
};