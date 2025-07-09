import {API_BASE_URL as API_URL} from '../config/api';

const API_BASE_URL = API_URL;

export const getAllChannelsApi = async (orgId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Setting/GetAllChannel?organizationId=${orgId}`, {
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
    console.error("Error fetching channels:", error);
    throw error;
  }
};

export const createChannelApi = async (channelData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Setting/CreateChannel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating channel:", error);
    throw error;
  }
};

export const getChannelByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Setting/GetChannelById?id=${id}`, {
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
    console.error("Error fetching channel by ID:", error);
    throw error;
  }
};

export const updateChannelApi = async (channelData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/UpdateChannel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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

export const deleteChannelApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/DeleteChannel?id=${id}`, {
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
    return { success: true, message: data.data.message  };
  } catch (error) {
    console.error("Error deleting channel:", error);
    throw error;
  }
};
