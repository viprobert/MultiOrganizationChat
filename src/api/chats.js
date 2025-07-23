import { API_BASE_URL } from '../config/api';
import { fetchWithAuth } from './auth';

export const getAssignedChatsByAgentStatusApi = async (agentId, orgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/GetMessageByStatus?agentId=${agentId}&orgId=${orgId}`, {
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
    console.error("Error fetching assigned chats by status:", error);
    throw error;
  }
};

//Get Latest 20 Messages
export const getMessagesApi = async (chatId, orgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/GetChatMessages?chatId=${chatId}&orgId=${orgId}&count=20`, {
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
    console.error("Error fetching chat messages:", error);
    throw error;
  }
};

//Get All Messages
export const getMessagesHistoryApi = async (chatId, orgId) => {
  try{
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/GetMessagesHistory?chatId=${chatId}&orgId=${orgId}`, {
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
  }
  catch (error) {
    console.error("Error fetching chat messages history: ", error);
    throw error;
  }
}

export const seenMessageApi = async (orgId ,chatId, agentId, msgId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/Seen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, agentId, msgId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking message as seen:", error);
    throw error;
  }
};

export const AssignMessageApi = async (orgId ,chatId, agentId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/AssignChatToAgent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, agentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error assign message:", error);
    throw error;
  }
};

export const AcceptMessageApi = async (orgId ,chatId, agentId, isAccept) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/AcceptRejectChatAssign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, agentId, isAccept }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error accept/reject message:", error);
    throw error;
  }
};

export const sendMessageApi = async (messageData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/line/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const assignChatToAgentApi = async (orgId, chatId, agentId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/AssignChatToAgent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, agentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error assigning chat to agent:", error);
    throw error;
  }
};

export const changeChatStatusApi = async (orgId, chatId, status) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/ChangeChatStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ orgId, chatId, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error changing chat status:", error);
    throw error;
  }
};

export const getFilteredChatsApi = async (params) => {
  try {
    const queryString = new URLSearchParams({
      orgId: params.orgId,
      ...(params.configId && { configId: params.configId }),
      ...(params.status && { status: params.status }),
      ...(params.tagId && { tagId: params.tagId }),
      ...(params.agentId && { agentId: params.agentId }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
      ...(params.page && { page: params.page }),
      ...(params.pageSize && { pageSize: params.pageSize }),
    }).toString();

    const response = await fetchWithAuth(`${API_BASE_URL}/GroupMessages/GetAllChatsByOrgId?${queryString}`, {
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
    console.error("Error fetching filtered chats:", error);
    throw error;
  }
};

export const customerRatingApi = async (rateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/GiveRating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(rateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, message: data.data.message };
  } catch (error) {
    console.error("Error giving rating:", error);
    throw error;
  }
};
