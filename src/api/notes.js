import { API_BASE_URL } from '../config/api';

export const setUserNoteApi = async (orgId, chatId, note, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/SetUserNote`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, note }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting user note:", error);
    throw error;
  }
};
