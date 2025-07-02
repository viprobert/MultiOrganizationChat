// File: src/pages/AssignChatsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAssignedChatsByAgentStatusApi, AssignMessageApi } from '../api/chats' 
import { getTeamsAndAgentsApi } from '../api/teams';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import ChatList from '../components/ChatList';
import { changeAgentStatusApi } from '../api/auth';
import Sidebar from '../components/Sidebar';
import {
  FaFacebookMessenger,
  FaLine,
  FaTelegramPlane,
  FaWhatsapp,
} from 'react-icons/fa';

const CHATS_PER_PAGE = 20;

const platformIcons = {
  LINE: <FaLine size={20} style={{ color: '#00B900' }} />, 
  TELEGRAM: <FaTelegramPlane size={20} style={{ color: '#0088CC', paddingRight: '5px' }} />, 
  WhatsApp: <FaWhatsapp size={20} style={{ color: '#25D366' }} />, 
  Messenger: <FaFacebookMessenger size={20} style={{ color: '#0078FF' }} />, 
};

const AssignChatsPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();

    const [unassignedChats, setUnassignedChats] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [chatError, setChatError] = useState(null);
    const [selectedUnassignedChat, setSelectedUnassignedChat] = useState(null);
    const [hasMoreUnassignedChats, setHasMoreUnassignedChats] = useState(true);
    const [currentUnassignedPage, setCurrentUnassignedPage] = useState(1);
    const [selectedChat, setSelectedChat] = useState(null); 
    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [teamsError, setTeamsError] = useState(null);
    const [selectedAgentId, setSelectedAgentId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignSuccess, setAssignSuccess] = useState(false);
    const [assignError, setAssignError] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);


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

    const fetchUnassignedChats = useCallback(async (pageToFetch = 1, resetList = false) => {
        if (!user?.token) {
            console.warn("Missing user orgId or token for fetching unassigned chat list.");
            return;
        }

        setLoadingChats(true);
        setChatError(null);

        try {
            const chats = await getAssignedChatsByAgentStatusApi(user.userId, user.orgId,  user.token);

            const strictlyUnassignedChats = chats.filter(chat =>
                chat.assignedAgentId === null || chat.acceptAssigned == false
            );

            if (resetList) {
                setUnassignedChats(strictlyUnassignedChats);
                setCurrentUnassignedPage(1);
            } else {
                setUnassignedChats(prevChats => [...prevChats, ...strictlyUnassignedChats]);
                setCurrentUnassignedPage(pageToFetch);
            }
            setHasMoreUnassignedChats(strictlyUnassignedChats.length === CHATS_PER_PAGE);

            if (selectedUnassignedChat && !strictlyUnassignedChats.some(chat => chat.chatId === selectedUnassignedChat.chatId)) {
                setSelectedUnassignedChat(null);
            }

        } catch (err) {
            console.error("Error fetching unassigned chat list:", err);
            setChatError("Failed to load unassigned chats. " + (err.message || "Please try again."));
        } finally {
            setLoadingChats(false);
        }
    }, [user, selectedUnassignedChat]);

    const fetchTeamsAndAgents = useCallback(async () => {
        if (!user?.orgId || !user?.token) {
            console.warn("Missing user orgId or token for fetching teams and agents.");
            return;
        }

        setLoadingTeams(true);
        setTeamsError(null);

        try {
            const data = await getTeamsAndAgentsApi(user.orgId, user.token);
            setTeams(data || []); // Data is directly the array of teams
        } catch (err) {
            console.error("Error fetching teams and agents:", err);
            setTeamsError("Failed to load teams and agents. " + (err.message || "Please try again."));
        } finally {
            setLoadingTeams(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUnassignedChats(1, true);
        fetchTeamsAndAgents();
    }, [fetchUnassignedChats, fetchTeamsAndAgents]);

    const getAgentsForSelectedTeam = useCallback(() => {
        if (selectedTeamId) {
            const team = teams.find(t => t.id === selectedTeamId);
            return team ? (team.usersList || []) : [];
        }
        return teams.flatMap(team => team.usersList || []);
    }, [selectedTeamId, teams]);

    const handleSelectUnassignedChat = (chat) => {
        setSelectedUnassignedChat(chat);
        setAssignSuccess(false); 
        setAssignError(null);
    };

    const handleAssignChat = async () => {
        if (!selectedUnassignedChat || !selectedAgentId || !user?.orgId || !user?.token) {
            setAssignError("Please select a chat and an agent to assign.");
            return;
        }

        setAssigning(true);
        setAssignSuccess(false);
        setAssignError(null);

        try {
            await AssignMessageApi(user.orgId, selectedUnassignedChat.chatId, selectedAgentId, user.token);
            setAssignSuccess(true);
            setSelectedUnassignedChat(null);
            setSelectedAgentId('');
            setSelectedTeamId('');
            fetchUnassignedChats(1, true);
        } catch (err) {
            console.error("Error assigning chat:", err);
            setAssignError("Failed to assign chat: " + (err.message || "Unknown error."));
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f5f7fa' }}>
            <Sidebar
            user={user}
            logout={logout}
            agentOnlineStatus={agentOnlineStatus}
            isActionPanelLoading={isActionPanelLoading}
            handleAgentStatusToggle={handleAgentStatusToggle}
            isSidebarOpen={isSidebarOpen}
            />

            {/* Left Panel: Unassigned Chat List */}
                <ChatList
                    chatList={unassignedChats}
                    selectedChat={selectedUnassignedChat}
                    handleChatSelect={handleSelectUnassignedChat} 
                    chatListLoading={loadingChats}
                    chatListError={chatError}
                    allAvailableTags={[]} 
                    platformIcons={platformIcons} 
                    handleLoadMoreChats={() => fetchUnassignedChats(currentUnassignedPage + 1, false)}
                    hasMoreChats={hasMoreUnassignedChats}
                />
            {/* Right Panel: Assignment Form */}
            <section style={{ flex: 1, padding: '1rem', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Assign Chat</h2>

                {!selectedUnassignedChat ? (
                    <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                        Please select an unassigned chat from the left panel to assign it.
                    </div>
                ) : (
                    <div>
                        <div style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                                Chat User: <span style={{ color: '#007bff' }}>{selectedUnassignedChat.displayname}</span>
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#555', wordBreak: 'break-word' }}>
                                Latest Message: "{selectedUnassignedChat.chatMessage?.content || 'N/A'}"
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.25rem' }}>
                                Platform: {selectedUnassignedChat.platfrom} | Last activity: {selectedUnassignedChat.latestMsgTime ? new Date(selectedUnassignedChat.latestMsgTime).toLocaleString() : 'N/A'}
                            </p>
                        </div>


                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', color: '#333', marginBottom: '1rem' }}>Assign To:</h4>
                            {loadingTeams ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555' }}>
                                    <FontAwesomeIcon icon={faSpinner} spin /> Loading teams...
                                </div>
                            ) : teamsError ? (
                                <div style={{ color: '#dc3545' }}>{teamsError}</div>
                            ) : (
                                <>
                                    {/* Team Filter Dropdown */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label htmlFor="team-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Select Team:</label>
                                        <select
                                            id="team-select"
                                            value={selectedTeamId}
                                            onChange={(e) => {
                                                setSelectedTeamId(e.target.value);
                                                setSelectedAgentId(''); 
                                            }}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', appearance: 'none', background: 'white url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.9a17.6%2017.6%200%200%200-13%205.1L146.2%20208.5%2018.5%2075.1A17.6%2017.6%200%200%200%205.1%2062%2017.6%2017.6%200%200%200%200%2075.1l141.2%20140.7c6.7%206.7%2015.6%2010.5%2025.1%2010.5s18.4-3.8%2025.1-10.5L292.4%2075.1a17.6%2017.6%200%200%200-5.1-12.9z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 0.75rem center', backgroundSize: '0.6em auto' }}
                                        >
                                            <option value="">-- Select Team (Optional) --</option>
                                            {teams.map(team => (
                                                <option key={team.id} value={team.id}>{team.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Agent Dropdown */}
                                    <div>
                                        <label htmlFor="agent-select" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#444' }}>Select Agent:</label>
                                        <select
                                            id="agent-select"
                                            value={selectedAgentId}
                                            onChange={(e) => setSelectedAgentId(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', appearance: 'none', background: 'white url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.9a17.6%2017.6%200%200%200-13%205.1L146.2%20208.5%2018.5%2075.1A17.6%2017.6%200%200%200%205.1%2062%2017.6%2017.6%200%200%200%200%2075.1l141.2%20140.7c6.7%206.7%2015.6%2010.5%2025.1%2010.5s18.4-3.8%2025.1-10.5L292.4%2075.1a17.6%2017.6%200%200%200-5.1-12.9z%22%2F%3E%3C%2Fsvg%3E") no-repeat right 0.75rem center', backgroundSize: '0.6em auto' }}
                                        >
                                            <option value="">-- Select Agent --</option>
                                            {getAgentsForSelectedTeam().map(agent => (
                                                <option key={agent.userId} value={agent.userId}>{agent.userName}  (Current Chats - {agent.chatCounts})</option>
                                            ))}
                                        </select>
                                        {selectedTeamId !== '' && getAgentsForSelectedTeam().length === 0 && (
                                            <p style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.5rem' }}>No agents in this team.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleAssignChat}
                            disabled={assigning || !selectedAgentId}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: assigning || !selectedAgentId ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: assigning || !selectedAgentId ? 0.7 : 1,
                            }}
                        >
                            {assigning && <FontAwesomeIcon icon={faSpinner} spin />}
                            {assigning ? 'Assigning...' : 'Assign Chat'}
                        </button>

                        {assignSuccess && (
                            <p style={{ color: '#28a745', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                <FontAwesomeIcon icon={faCheckCircle} /> Chat assigned successfully!
                            </p>
                        )}
                        {assignError && (
                            <p style={{ color: '#dc3545', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                <FontAwesomeIcon icon={faTimesCircle} /> {assignError}
                            </p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AssignChatsPage;