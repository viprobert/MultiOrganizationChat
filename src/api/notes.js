import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const setUserNoteApi = async (orgId, chatId, note) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/SetUserNote`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
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
