import { API_BASE_URL } from '../config/api';

export const getAllPermissionsApi = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Permission`, {
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
    console.error("Error fetching all permissions:", error);
    throw error;
  }
};

export const getPermissionToAssignApi = async (token) => {
  try{
    const response = await fetch(`${API_BASE_URL}/Permission/PermsToAssign`, {
      method: 'Get',
      headers: {
         'Authorization': `Bearer ${token}`, 
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

export const createPermissionApi = async (permData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Permission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

export const getPermissionByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Permission/GetById?id=${id}`, {
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
    console.error("Error fetching permission by ID:", error);
    throw error;
  }
};

export const updatePermissionApi = async (permData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Permission`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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

export const deletePermissionApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Permission?id=${id}`, {
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
    console.error("Error deleting team:", error);
    throw error;
  }
};