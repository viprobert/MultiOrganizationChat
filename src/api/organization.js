import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getAllOrganizationsApi = async (orgId) => {
   let url = `${API_BASE_URL}/Organization`;
  const queryParams = new URLSearchParams();

  if (orgId !== undefined && orgId !== null){
    queryParams.append('orgId', orgId.toString());
  }
  if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
  }

  try {
    const response = await fetchWithAuth(`${url}`, {
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
    console.error("Error fetching all organizations:", error);
    throw error;
  }
};

export const createOrganizationApi = async (orgData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(orgData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
};

export const getOrganizationByIdApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Organization/GetById?id=${id}`, { 
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
    console.error("Error fetching organization by ID:", error);
    throw error;
  }
};

export const updateOrganizationApi = async (orgData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Organization`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(orgData),
    });

    if (!response.ok) {
      throw new Error(response );
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating organization:", error);
    throw error;
  }
};

export const deleteOrganizationApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Organization?id=${id}`, {
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
    console.error("Error deleting organization:", error);
    throw error;
  }
};
