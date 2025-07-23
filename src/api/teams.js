import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getTeamsAndAgentsApi = async (orgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/GetUsersByTeam?orgId=${orgId}`, {
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
    console.error("Error fetching teams and agents:", error);
    throw error;
  }
};

export const getAllTeamsApi = async (orgId) => {
  let url = `${API_BASE_URL}/Team`;
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
    console.error("Error fetching all teams:", error);
    throw error;
  }
};

export const createTeamApi = async (teamData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(teamData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const getTeamByIdApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Team/GetById?id=${id}`, {
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
    console.error("Error fetching team by ID:", error);
    throw error;
  }
};

export const updateTeamApi = async (teamData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Team`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(teamData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
};

export const deleteTeamApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Team?id=${id}`, {
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
    console.error("Error deleting team:", error);
    throw error;
  }
};
