import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getAllChannelsApi = async (orgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Setting/GetAllChannel?organizationId=${orgId}`, {
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
    console.error("Error fetching channels:", error);
    throw error;
  }
};

export const createChannelApi = async (channelData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Setting/CreateChannel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(channelData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating channel:", error);
    throw error;
  }
};

export const getChannelByIdApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Setting/GetChannelById?id=${id}`, {
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
    console.error("Error fetching channel by ID:", error);
    throw error;
  }
};

export const updateChannelApi = async (channelData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Setting/UpdateChannel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(channelData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating channel:", error);
    throw error;
  }
};

export const deleteChannelApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Setting/DeleteChannel?id=${id}`, {
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
    return { success: true, message: data.data.message  };
  } catch (error) {
    console.error("Error deleting channel:", error);
    throw error;
  }
};
