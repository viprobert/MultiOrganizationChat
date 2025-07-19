import { API_BASE_URL } from '../config/api';

export const getAllOrganizationsApi = async (orgId,token) => {
   let url = `${API_BASE_URL}/Organization`;
  const queryParams = new URLSearchParams();

  if (orgId !== undefined && orgId !== null){
    queryParams.append('orgId', orgId.toString());
  }
  if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
  }

  try {
    const response = await fetch(`${url}`, {
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
    console.error("Error fetching all organizations:", error);
    throw error;
  }
};

export const createOrganizationApi = async (orgData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Organization`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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

export const getOrganizationByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Organization/GetById?id=${id}`, { 
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
    console.error("Error fetching organization by ID:", error);
    throw error;
  }
};

export const updateOrganizationApi = async (orgData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Organization`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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

export const deleteOrganizationApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Organization?id=${id}`, {
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
    console.error("Error deleting organization:", error);
    throw error;
  }
};
