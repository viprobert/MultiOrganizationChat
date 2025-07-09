import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import { Link } from 'react-router-dom';
import { changeAgentStatusApi } from '../api/auth';
import Sidebar from '../components/Sidebar';
import ChatReport from '../components/ChatReport';
import AgentReport from '../components/AgentReport';
import TagReport from '../components/TagReport';
import StatusReport from '../components/StatusReport';
import { getChatReportAPI, getAgentReportAPI, getTagReportAPI, getStatusReportAPI } from '../api/reports';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return thirtyDaysAgo.toISOString().split('T')[0]; 
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [chatVolumeData, setChatVolumeData] = useState([]);
    const [agentPerformanceData, setAgentPerformanceData] = useState([]);
    const [tagAnalysisData, setTagAnalysisData] = useState([]);
    const [statusAnalysisData, setStatusAnalysisData] = useState([]);

    const [loadingReports, setLoadingReports] = useState(false);
    const [reportError, setReportError] = useState(null);

    const fetchReports = useCallback(async () => {
        if (!user?.token) {
            setReportError("User not authenticated.");
            return;
        }

        setLoadingReports(true);
        setReportError(null);

        const reportRequest = {
            orgId: user.orgId,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
        };

        try {
            const chatVolumeResponse = await getChatReportAPI(reportRequest, user.token);
            if (chatVolumeResponse.success) {
                setChatVolumeData(chatVolumeResponse.data || []);
            } else {
                throw new Error("Failed to fetch chat volume data.");
            }

            const agentReportResponse = await getAgentReportAPI(reportRequest, user.token);
            if (agentReportResponse.success) {
                setAgentPerformanceData(agentReportResponse.data || []);
            } else {
                throw new Error("Failed to fetch agent performance data.");
            }

            const tagReportResponse = await getTagReportAPI(reportRequest, user.token);
            if (tagReportResponse.success) {
                setTagAnalysisData(tagReportResponse.data || []);
            } else {
                throw new Error("Failed to fetch tag analysis data.");
            }

            const statusReportResponse = await getStatusReportAPI(reportRequest, user.token);
            if (statusReportResponse.success){
                setStatusAnalysisData(statusReportResponse.data || []);
            } else {
                throw new Error("Failed to fetch status analysis data.")
            }

        } catch (err) {
            console.error("Error fetching reports:", err);
            setReportError(`Failed to load reports: ${err.message || "Unknown error."}`);
        } finally {
            setLoadingReports(false);
        }
    }, [user, startDate, endDate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);
   
    const handleAgentStatusToggle = async () => {
        if (!user?.userId || !user?.token) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            const newStatus = !agentOnlineStatus;
            await changeAgentStatusApi(user.userId, newStatus, user.token);
            setAgentOnlineStatus(newStatus);
        } catch (err) {
            console.error("Failed to change agent status:", err);
            setActionPanelError("Failed to change status: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };


        
    return (
        <div className="container-full-height">
            <Sidebar
                user={user}
                logout={logout}
                agentOnlineStatus={agentOnlineStatus}
                isActionPanelLoading={isActionPanelLoading}
                handleAgentStatusToggle={handleAgentStatusToggle}
                isSidebarOpen={isSidebarOpen}
                />

            <div className="main-content" style={{ marginLeft: isSidebarOpen ? '250px' : '0' }}>
                <h1>Dashboard: Chat Analytics</h1>

                {/* Date Range Selector */}
                <div className="dashboard-date-range-selector">
                    <label htmlFor="startDate">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-field"
                    />
                    <label htmlFor="endDate">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-field"
                    />
                    <button
                        onClick={fetchReports}
                        className="primary-button"
                        disabled={loadingReports}
                    >
                        {loadingReports ? 'Loading...' : 'Apply Date Range'}
                    </button>
                </div>

                {reportError && (
                    <div className="alert-error" role="alert">
                        <strong>Error!</strong>
                        <span> {reportError}</span>
                    </div>
                )}

                {loadingReports && <p className="dashboard-loading-message">Loading report data...</p>}

                {/* --- Chat Volume Reports --- */}
                <h2>Chat Volume Overview</h2>
                <ChatReport data={chatVolumeData} />

                <div className="report-grid">
                {/* --- Tag Analysis Report --- */}
                {/* <h2>Top Tags</h2> */}
                <TagReport data={tagAnalysisData} />
                
                {/* <h2>Top Status </h2> */}
                <StatusReport data={statusAnalysisData} />
                </div>
                
                {/* --- Agent Performance Report --- */}
                <h2>Agent Performance</h2>
                <AgentReport data={agentPerformanceData} />
            </div>
        </div>
    );
};

export default DashboardPage;
