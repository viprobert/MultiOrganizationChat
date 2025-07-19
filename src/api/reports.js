import { API_BASE_URL } from '../config/api';

export const getChatReportAPI = async (reportRequest, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/GetChatReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(reportRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error chat report:", error);
    throw error;
  }
};

export const getAgentReportAPI = async (reportRequest, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/GetAgentReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(reportRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error getting agent report:", error);
    throw error;
  }
};

export const getTagReportAPI = async (reportRequest, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GroupMessages/GetTagReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(reportRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error getting Tag report:", error);
    throw error;
  }
};

export const getStatusReportAPI = async (reportRequest, token) => {
  try{
      const response = await fetch(`${API_BASE_URL}/GroupMessages/GetStatusReport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(reportRequest),
      });

      if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.data };
  }
  catch(error) {
    console.error('Error getting Status report:', error)
    throw error;
  }
}

export const getSuperAdminReportAPI = async (startDate, endDate, orgId, token) => {
  let url = `${API_BASE_URL}/Setting/SuperAdminReport?startDate=${startDate}&endDate=${endDate}`;
  const queryParams = new URLSearchParams();

  if (orgId !== undefined && orgId !== null && orgId !== ''){
     queryParams.append('orgId', orgId.toString());
  }
  if (queryParams.toString()) {
        url += `&${queryParams.toString()}`;
  }
  try{
    const response = await fetch(url,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      }
    });

    if (!response.ok){
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data: data.data };  
  }
  catch (error) {
    console.error('Error getting Super Admin report: ', error);
    throw error;
  }
}