import {API_BASE_URL as API_URL} from '../config/api';

const API_BASE_URL = API_URL;


export const getChatsByTagApi = async (orgId, userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/GetChatsByTag?orgId=${orgId}&agentId=${userId}`, {
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
    return data.data;
  } catch (error) {
    console.error("Error fetching chats by tag:", error);
    throw error;
  }
};

export const getAllTagsApi = async (orgId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Tagging?orgId=${orgId}`, {
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
    return data.data;
  } catch (error) {
    console.error("Error fetching all tags:", error);
    throw error;
  }
};

export const setUserTaggingApi = async (orgId, chatId, tagId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/SetUserTagging`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
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

export const removeTagFromUserApi = async (orgId, chatId, tagId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/RemoveTagFromUser`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': '69420',
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

export const createTagApi = async (tagData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Tagging`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
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

export const getTagByIdApi = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Tagging/GetById?id=${id}`, {
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
    return data.data;
  } catch (error) {
    console.error("Error fetching tag by ID:", error);
    throw error;
  }
};

export const updateTagApi = async (tagData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Tagging`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
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

export const deleteTagApi = async (id, orgId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Tagging?id=${id}&orgId=${orgId}`, {
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
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
};
