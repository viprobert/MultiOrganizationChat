import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSuperAdminReportAPI } from '../api/reports';
import { changeAgentStatusApi } from '../api/user';
import { getAllOrganizationsApi } from '../api/organization';
import ChatVolumeChart from '../components/SuperAdminChatVolume';
import ResolvedCountChart from '../components/SuperAdminResolve';
import CSATScoreChart from '../components/SuperAdminCSAT';
import Sidebar from '../components/Sidebar';

const getDatesInRange = (startDateStr, endDateStr) => {
    const dates = [];
    let currentDate = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const SuperAdminDashboardPage = () => {
    const { user, logout } = useAuth();
    const [orgsData, setOrgsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const [allOrganizations, setAllOrganizations] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(true);

    const [startDate, setStartDate] = useState(() => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        return sevenDaysAgo.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [orgId, setOrgId] = useState('');

    const handleAgentStatusToggle = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            const newStatus = !agentOnlineStatus;
            await changeAgentStatusApi(user.userId, newStatus);
            setAgentOnlineStatus(newStatus);
        } catch (err) {
            console.error("Failed to change agent status:", err);
            setActionPanelError("Failed to change status: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const orgs = await getAllOrganizationsApi(null);
            setAllOrganizations(orgs);
        } catch (err) {
            console.error("Error fetching organizations:", err);
        }
        finally{
            setOrganizationsLoading(false);
        }
    };

    const fetchSuperAdminReports = useCallback(async (currentStartDate, currentEndDate, currentOrgId) => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await getSuperAdminReportAPI(currentStartDate, currentEndDate, currentOrgId);

            if (response.success && response.data && response.data.orgsData) {
                const processedOrgsData = response.data.orgsData.map(org => {
                    const dailyMetricsMap = new Map();
                    org.dailyMetrics.forEach(metric => {
                        const dateKey = new Date(metric.date).toISOString().split('T')[0];
                        dailyMetricsMap.set(dateKey, metric);
                    });

                    const allDatesInRange = getDatesInRange(currentStartDate, currentEndDate);

                    const filledMetrics = allDatesInRange.map(dateStr => {
                        const existingMetric = dailyMetricsMap.get(dateStr);
                        if (existingMetric) {
                            return existingMetric;
                        } else {
                            return {
                                date: `${dateStr}T00:00:00.000Z`,
                                totalChatVolume: 0,
                                resolvedCount: 0,
                                csat: 0
                            };
                        }
                    });

                    filledMetrics.sort((a, b) => new Date(a.date) - new Date(b.date));

                    return {
                        ...org,
                        dailyMetrics: filledMetrics
                    };
                });
                setOrgsData(processedOrgsData);
            } else {
                throw new Error(response.error || "Failed to fetch super admin report data.");
            }
        } catch (err) {
            console.error("Error fetching super admin reports:", err);
            setError(`Failed to load reports: ${err.message || "Unknown error."}`);
            if (err.message === "Session expired. Please log in again.") {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [user, logout]); 

    useEffect(() => {
        if (user){
            fetchDropdownData();
            fetchSuperAdminReports(startDate, endDate, orgId);
        }
    }, [fetchSuperAdminReports, startDate, endDate, orgId]);

    const mainContentStyle = {
        marginLeft: isSidebarOpen ? '250px' : '0',
        padding: '40px',
        transition: 'margin-left 0.3s ease',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 0px 15px rgba(0,0,0,0.1)',
        flex: 1,
        paddingTop: '20px',
        paddingBottom: '20px',
        overflowY: 'auto',
        maxHeight: '100vh',
        maxWidth: `calc(100% - ${isSidebarOpen ? '250px' : '0px'})`,
        boxSizing: 'border-box',
    };

    return (
        <div className="container-full-height" style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
            backgroundColor: '#f0f2f5'
            }}>
            <Sidebar
                user={user}
                logout={logout}
                agentOnlineStatus={agentOnlineStatus}
                isActionPanelLoading={isActionPanelLoading}
                handleAgentStatusToggle={handleAgentStatusToggle}
                isSidebarOpen={isSidebarOpen}
            />

            <div style={mainContentStyle}>
                <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>SuperAdmin Dashboard: Organization Analytics</h1>

                {/* Date Range Selector Section */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    padding: '15px 20px',
                    marginBottom: '30px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                    <label htmlFor="startDate" style={{ color: '#555', fontWeight: 'bold' }}>From:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1em',
                            outline: 'none'
                        }}
                    />
                    <label htmlFor="endDate" style={{ color: '#555', fontWeight: 'bold' }}>To:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1em',
                            outline: 'none'
                        }}
                    />
                    <label htmlFor="orgId" style={{ color: '#555', fontWeight: 'bold' }}>Organization:</label>
                    <select
                        id="orgId"
                        name="orgId"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            fontSize: '1em',
                            outline: 'none'
                        }}
                    >
                        <option value="">Select Organization</option>
                        {allOrganizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => fetchSuperAdminReports(startDate, endDate, orgId)}
                        disabled={loading}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'background-color 0.2s ease',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#218838')}
                        onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#28a745')}
                    >
                        {loading ? 'Loading...' : 'Apply'}
                    </button>
                </div>

                {/* Loading and Error Messages */}
                {loading && <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#555' }}>Loading organization data...</p>}
                {error && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #d32f2f',
                        marginBottom: '20px'
                    }} role="alert">
                        <strong>Error!</strong> {error}
                    </div>
                )}

                {/* Message if no data is available */}
                {!loading && orgsData.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '1.1em', color: '#777' }}>No organization data available for the selected date range.</p>
                )}

                {/* Render reports for each organization */}
                {orgsData.map(org => (
                    <div key={org.orgId} style={{
                        backgroundColor: '#e0f2f7',
                        borderRadius: '10px',
                        padding: '25px',
                        marginBottom: '40px',
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                    }}>
                        <h2 style={{ color: '#2980b9', marginBottom: '25px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
                            {org.organizationName}
                        </h2>
                        {org.dailyMetrics && org.dailyMetrics.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                                <ChatVolumeChart data={org.dailyMetrics} />
                                <ResolvedCountChart data={org.dailyMetrics} />
                                <CSATScoreChart data={org.dailyMetrics} />
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: '#777', fontSize: '1.1em' }}>No daily metrics available for this organization in the selected range.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuperAdminDashboardPage;