import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getChatsByTagApi = async (orgId, userId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/GetChatsByTag?orgId=${orgId}&agentId=${userId}`, {
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
    console.error("Error fetching chats by tag:", error);
    throw error;
  }
};

export const getAllTagsApi = async (orgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Tagging?orgId=${orgId}`, {
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
    console.error("Error fetching all tags:", error);
    throw error;
  }
};

export const setUserTaggingApi = async (orgId, chatId, tagId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/SetUserTagging`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, tagId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true }; 
  } catch (error) {
    console.error("Error setting user tagging:", error);
    throw error;
  }
};

export const removeTagFromUserApi = async (orgId, chatId, tagId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/RemoveTagFromUser`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, tagId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing tag from user:", error);
    throw error;
  }
};

export const createTagApi = async (tagData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Tagging`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(tagData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
     const data = await response.json();
    // return data;
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};

export const getTagByIdApi = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Tagging/GetById?id=${id}`, {
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
    console.error("Error fetching tag by ID:", error);
    throw error;
  }
};

export const updateTagApi = async (tagData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Tagging`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(tagData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error updating tag:", error);
    throw error;
  }
};

export const deleteTagApi = async (id, orgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Tagging?id=${id}&orgId=${orgId}`, {
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
    console.error("Error deleting tag:", error);
    throw error;
  }
};
