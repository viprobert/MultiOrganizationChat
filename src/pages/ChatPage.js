import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { changeAgentStatusApi } from '../api/user';
import { getAllChannelsApi } from '../api/channels';
import { getAssignedChatsByAgentStatusApi, getFilteredChatsApi, seenMessageApi, getMessagesApi, 
        getMessagesHistoryApi, assignChatToAgentApi, changeChatStatusApi, sendMessageApi, AcceptMessageApi } from '../api/chats';
import { getChatsByTagApi, getAllTagsApi, setUserTaggingApi, removeTagFromUserApi } from '../api/tags';
import { getTeamsAndAgentsApi } from '../api/teams';
import { setUserNoteApi } from '../api/notes';
import { useSignalR } from '../hooks/useSignalR'; 
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaFacebookMessenger, FaLine, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import ChatSideBar from '../components/ChatSideBar';
import ChatList from '../components/ChatList';
import ChatConversation from '../components/ChatConversation';

const platformIcons = {
    LINE: <FaLine size={20} style={{ color: '#00B900' }} />,
    TELEGRAM: <FaTelegramPlane size={20} style={{ color: '#0088CC', paddingRight: '5px' }} />,
    WHATSAPP: <FaWhatsapp size={20} style={{ color: '#25D366' }} />,
    MESSENGER: <FaFacebookMessenger size={20} style={{ color: '#0078FF' }} />,
};

const ChatPage = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);

    const [channels, setChannels] = useState([]);
    const [tagsWithCounts, setTagsWithCounts] = useState([]);
    const [agentAssignedChatsCounts, setAgentAssignedChatsCounts] = useState({ all: 0, unread: 0, unassigned: 0, pending: 0, inProgress: 0, closed: 0, assigned: 0 });

    const [chatList, setChatList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [currentChatHistory, setCurrentChatHistory] = useState(null);
    const [chatListLoading, setChatListLoading] = useState(false);
    const [chatListError, setChatListError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreChats, setHasMoreChats] = useState(true);
    const CHATS_PER_PAGE = 10;

    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [selectedChatStatusFilter, setSelectedChatStatusFilter] = useState('All');
    const [selectedTagIdFilter, setSelectedTagIdFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [allAvailableTags, setAllAvailableTags] = useState([]);
    const [teamsAndAgents, setTeamsAndAgents] = useState([]);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);
    const [actionPanelError, setActionPanelError] = useState(null);

    const [currentChatNote, setCurrentChatNote] = useState('');
    const [currentChatTags, setCurrentChatTags] = useState([]);

    const [isChannelsSectionVisible, setIsChannelsSectionVisible] = useState(true);
    const [isNavigSectionVisible, setIsNavigSectionVisible] = useState(true);

    const isInitialMount = useRef(true);
    const chatListRef = useRef(chatList);

    useEffect(() => {
        chatListRef.current = chatList;
    }, [chatList]);

    const fetchAgentCounts = useCallback(async () => {
        if (!user?.orgId || !user?.userId) {
            console.warn("Missing user info for fetching agent counts.");
            return;
        }
        try {
            const assignedChats = await getAssignedChatsByAgentStatusApi(user.userId, user.orgId);
            const allAssignedCount = assignedChats.filter(chat => chat.assignedAgentId !== null).length;
            const unAssignedCount = assignedChats.filter(chat => chat.assignedAgentId === null).length;
            const unreadAssignedCount = assignedChats.filter(chat => chat.unreadCount > 0).length;
            setAgentAssignedChatsCounts({ all: allAssignedCount, unread: unreadAssignedCount, unassigned: unAssignedCount });
        } catch (err) {
            console.error("Error fetching agent counts:", err);
            if (err.message === "Session expired. Please log in again.") {
                logout();
            }
        }
    }, [user?.orgId, user?.userId, logout]);

    const fetchChatList = useCallback(async (pageToFetch, resetList) => {
        if (!user) {
            return;
        }

        setChatListLoading(true);
        setChatListError(null);
        try {
            const params = {
                orgId: user.orgId,
                configId: selectedChannelId,
                tagId: selectedTagIdFilter,
                sortBy: 'latestMsgTime',
                sortOrder: 'desc',
                page: pageToFetch,
                pageSize: CHATS_PER_PAGE
            };

            if (selectedChatStatusFilter === 'All' || selectedChatStatusFilter === 'Unread') {
                params.agentId = user.userId;
            } else {
                params.status = selectedChatStatusFilter;
                params.agentId = null;
            }

            if (searchTerm) {
                params.searchTerm = searchTerm;
            }

            const chats = await getFilteredChatsApi(params);

            let finalFilteredChats = chats;
            if (selectedChatStatusFilter === 'Unread') {
                finalFilteredChats = chats.filter(chat => chat.unreadCount > 0);
            } else if (selectedChatStatusFilter === 'Unassigned') {
                finalFilteredChats = chats.filter(chat =>
                    chat.assignedAgentId === null && chat.assignedTeamId === null
                );
            }

            if (resetList) {
                setChatList(finalFilteredChats);
            } else {
                setChatList(prevChats => {
                    const existingChatIds = new Set(prevChats.map(chat => chat.chatId));
                    const newUniqueChats = finalFilteredChats.filter(chat => !existingChatIds.has(chat.chatId));
                    return [...prevChats, ...newUniqueChats];
                });
            }
            setHasMoreChats(finalFilteredChats.length === CHATS_PER_PAGE);

            if (selectedChat && pageToFetch === 1 && !finalFilteredChats.some(chat => chat.chatId === selectedChat.chatId)) {
                setSelectedChat(null);
                setCurrentChatHistory(null);
                if (user?.userId) {
                }
            }
        } catch (err) {
            console.error("Error fetching chat list:", err);
            setChatListError("Failed to load chat list. " + (err.message || "Please try again."));
            if (err.message === "Session expired. Please log in again.") {
                logout();
            }
        } finally {
            setChatListLoading(false);
        }
    }, [user, selectedChannelId, selectedChatStatusFilter, selectedTagIdFilter, searchTerm, selectedChat, logout]); 

    const handleReceiveMessage = useCallback((message) => {
        setCurrentChatHistory(prevHistory => {
            if (prevHistory && prevHistory.chatId === message.chatId) {
                if (!prevHistory.chatMessage?.some(msg => msg.id === message.id)) {
                    return {
                        ...prevHistory,
                        chatMessage: [...(prevHistory.chatMessage || []), message]
                    };
                }
            }
            return prevHistory;
        });

        setChatList(prevChats => {
            const chatToUpdateIndex = prevChats.findIndex(chat => chat.chatId === message.chatId);
            if (chatToUpdateIndex > -1) {
                const updatedChats = [...prevChats];
                const chatToUpdate = { ...updatedChats[chatToUpdateIndex] };
                chatToUpdate.chatMessage = message;
                chatToUpdate.latestMsgTime = message.timeStamp;

                if (selectedChat?.chatId !== message.chatId) {
                    chatToUpdate.unreadCount = (chatToUpdate.unreadCount || 0) + 1;
                } else {
                    chatToUpdate.unreadCount = 0;
                }

                updatedChats.splice(chatToUpdateIndex, 1);
                updatedChats.unshift(chatToUpdate);
                return updatedChats;
            } else {
                setCurrentPage(1);
                fetchChatList(1, true);
                return prevChats;
            }
        });
        fetchAgentCounts();
    }, [selectedChat, user?.userId, fetchChatList, fetchAgentCounts]); 

    const handleChatUpdated = useCallback((chatUpdate) => {
        const currentChatList = chatListRef.current;
        const chatExistsInList = currentChatList.some(chat => chat.chatId === chatUpdate.chatId);

        if (!chatExistsInList) {
            setCurrentPage(1);
            fetchChatList(1, true);
        } else {
            setChatList(prevChats => {
                return prevChats.map(chat => {
                    if (chat.chatId === chatUpdate.chatId) {
                        return {
                            ...chat,
                            ...chatUpdate,
                            unreadCount: chatUpdate.unreadCount !== undefined ? chatUpdate.unreadCount : chat.unreadCount
                        };
                    }
                    return chat;
                });
            });
        }

        setCurrentChatHistory(prevHistory => {
            if (prevHistory && prevHistory.chatId === chatUpdate.chatId) {
                return {
                    ...prevHistory,
                    note: chatUpdate.note ?? prevHistory.note,
                    tagId: chatUpdate.tagId ?? prevHistory.tagId,
                    ChatStatus: chatUpdate.status ?? prevHistory.ChatStatus,
                    assignedAgentId: chatUpdate.assignedAgentId ?? prevHistory.assignedAgentId,
                    acceptAssigned: chatUpdate.acceptAssigned
                };
            }
            return prevHistory;
        });

        setSelectedChat(prevSelectedChat => {
            if (prevSelectedChat && prevSelectedChat.chatId === chatUpdate.chatId) {
                return {
                    ...prevSelectedChat,
                    ...chatUpdate,
                    acceptAssigned: chatUpdate.acceptAssigned !== undefined
                                ? chatUpdate.acceptAssigned
                                : prevSelectedChat.acceptAssigned,
                    assignedAgentId: chatUpdate.assignedAgentId !== undefined
                                        ? chatUpdate.assignedAgentId
                                        : prevSelectedChat.assignedAgentId,
                    chatStatus: chatUpdate.chatStatus !== undefined
                                        ? chatUpdate.chatStatus
                                        : prevSelectedChat.chatStatus
                };
            }
            return prevSelectedChat;
        });

        fetchAgentCounts();
    }, [fetchChatList, fetchAgentCounts, selectedChat]);


    const { isConnected: isSignalRConnected, error: signalRError, agentOpenedChat, agentClosedChat } = useSignalR(
        user?.userId,
        user?.token,
        handleReceiveMessage,
        handleChatUpdated
    );

    const resetFiltersAndFetch = useCallback(() => {
        setCurrentPage(1);
        setSelectedChat(null);
        setCurrentChatHistory(null);
        setHasMoreChats(true);
        fetchChatList(1, true);

    }, [fetchChatList, user?.userId]);

    const handleRejectChat = useCallback(async (chatId) => {
        if (!user?.userId || !user?.orgId) {
            console.error("User not authenticated for chat rejection.");
            return;
        }
        try {
            await AcceptMessageApi(user.orgId, chatId, user.userId, false);
            setChatList(prevChatList => prevChatList.filter(chat => chat.chatId !== chatId));
            if (selectedChat?.chatId === chatId) {
                setSelectedChat(null);
                setCurrentChatHistory(null);
                if (user?.userId) {
                    agentClosedChat(user.userId, selectedChat?.chatId);
                }
            }
            
            fetchChatList(currentPage, true);
            fetchAgentCounts();
        } catch (error) {
            console.error("Error rejecting chat:", error);
            setActionPanelError("Failed to reject chat. Please try again.");
            if (error.message === "Session expired. Please log in again.") {
                logout();
            }
        }
    }, [user, fetchChatList, selectedChat, currentPage, fetchAgentCounts, agentClosedChat, logout]);

    const handleChatSelect = useCallback(async (chat) => {
        if (!selectedChat || selectedChat.chatId !== chat.chatId) {

            if (selectedChat?.chatId && user?.userId) {
                agentClosedChat(user.userId, selectedChat?.chatId);
            }

            setSelectedChat(chat);
            setCurrentChatHistory(null);
            setCurrentChatNote('');
            setCurrentChatTags([]);

            try {
                setIsActionPanelLoading(true);
                setActionPanelError(null);

                if (user?.userId) {
                    agentOpenedChat(chat.chatId, user.userId);
                }

                const history = await getMessagesApi(chat.chatId, user.orgId);
                setCurrentChatHistory(history);
                setCurrentChatNote(history?.note || '');
                setCurrentChatTags(history?.tagId ? [history.tagId] : []);
                setSelectedChat(prevSelectedChat => ({
                    ...prevSelectedChat,
                    note: history.note,
                    TagId: history.tagId,
                    ChatStatus: history.ChatStatus,
                    assignedAgentId: history.assignedAgentId
                }));

                const chatInList = chatListRef.current.find(c => c.chatId === chat.chatId);
                if (chatInList?.unreadCount > 0) {
                    await seenMessageApi(user.orgId, chat.chatId, user.userId, history.chatMessage?.id || null);

                    setChatList(prevChats => prevChats.map(c =>
                        c.chatId === chat.chatId ? { ...c, unreadCount: 0 } : c
                    ));

                    fetchAgentCounts();
                }

            } catch (err) {
                console.error("Error fetching chat history or marking seen:", err);
                setActionPanelError("Failed to load chat conversation: " + (err.message || "Unknown error."));
                setCurrentChatHistory(null);
                setSelectedChat(null);
                if (user?.userId) {
                    agentClosedChat(user.userId, selectedChat?.chatId);
                }
                if (err.message === "Session expired. Please log in again.") {
                logout();
            }
            } finally {
                setIsActionPanelLoading(false);
            }
        }
    }, [user, fetchAgentCounts, selectedChat, agentOpenedChat, agentClosedChat, logout]);

    useEffect(() => {
        const fetchchatPageData = async () => {
            if (!user?.orgId || !user?.userId) {
                setDashboardError("User organization, Id not found. Please re-login.");
                setLoadingDashboard(false);
                return;
            }

            try {
                setLoadingDashboard(true);
                setDashboardError(null);

                const [channelsData, tagsData, allTags, teamsAgentsData] = await Promise.all([
                    getAllChannelsApi(user.orgId),
                    getChatsByTagApi(user.orgId, user.userId),
                    getAllTagsApi(user.orgId),
                    getTeamsAndAgentsApi(user.orgId)
                ]);
                setChannels(channelsData);
                setTagsWithCounts(tagsData);
                setAllAvailableTags(allTags);
                setTeamsAndAgents(teamsAgentsData);
                await fetchAgentCounts();
            } catch (err) {
                console.error("Error fetching dashboard initial data:", err);
                setDashboardError("Failed to load dashboard data. " + (err.message || "Please try again."));
                if (err.message === "Session expired. Please log in again.") {
                logout();
            }
            } finally {
                setLoadingDashboard(false);
            }
        };
        fetchchatPageData();
    }, [user, user?.orgId, user?.userId, fetchAgentCounts, logout]);

    useEffect(() => {
        if (!loadingDashboard && !dashboardError) {
            if (isInitialMount.current) {
                isInitialMount.current = false;
                setCurrentPage(1);
                fetchChatList(1, true);
            } else {
                if (currentPage === 1) {
                    fetchChatList(1, true);
                }
            }
        }
    }, [loadingDashboard, dashboardError, selectedChannelId, selectedChatStatusFilter, selectedTagIdFilter, searchTerm, fetchChatList]);

    useEffect(() => {
        if (currentPage > 1) {
            fetchChatList(currentPage, false);
        }
    }, [currentPage, fetchChatList]);

    const handleAgentStatusToggle = async () => {
        if (!user) {
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

    const handleAcceptChat = useCallback(async (chatId) => {
        if (!user?.userId || !user?.orgId) {
            console.error("User not authenticated for chat acceptance.");
            return;
        }

        try {
            await AcceptMessageApi(user.orgId, chatId, user.userId, true);
            await fetchAgentCounts();

            setSelectedChat(prevSelectedChat => {
                if (prevSelectedChat && prevSelectedChat.chatId === chatId) {
                    return {
                        ...prevSelectedChat,
                        assignedAgentId: user.userId,
                        acceptAssigned: true,
                        chatStatus: 'Assigned'
                    };
                }
                return prevSelectedChat;
            });
            setChatList(prevChats => prevChats.map(chat =>
                chat.chatId === chatId
                    ? { ...chat, assignedAgentId: user.userId, chatStatus: 'Assigned' }
                    : chat
            ));

        } catch (error) {
            console.error("Error accepting chat:", error);
            setActionPanelError("Failed to accept chat. Please try again.");
        }
    }, [user, fetchAgentCounts, setSelectedChat]);

    const handleViewChatHistory = useCallback(async (chatId, orgId) => {
        if (!chatId || !orgId) {
            console.error("Missing chat details for fetching full history.");
            setActionPanelError("Cannot fetch full history: Missing chat details.");
            return;
        }

        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            const fullHistory = await getMessagesHistoryApi(chatId, orgId);
            setCurrentChatHistory(fullHistory);
        } catch (err) {
            console.error("Error fetching full chat history:", err);
            setActionPanelError("Failed to load full chat history: " + (err.message || "Unknown error."));
            if (err.message === "Session expired. Please log in again.") {
                logout();
            }
        } finally {
            setIsActionPanelLoading(false);
        }
    }, [logout]);

    const handleSetNote = async () => {
        if (!selectedChat?.chatId || currentChatNote === currentChatHistory?.note) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await setUserNoteApi(user.orgId, selectedChat.chatId, currentChatNote);
            setCurrentChatHistory(prev => ({ ...prev, note: currentChatNote }));
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                note: currentChatNote
            }));
        } catch (err) {
            console.error("Error setting note:", err);
            setActionPanelError("Failed to set note: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleSetTag = async (tagId) => {
        if (!selectedChat?.chatId || !tagId || tagId === selectedChat.TagId) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await setUserTaggingApi(user.orgId, selectedChat.chatId, tagId);
            setCurrentChatTags([tagId]);
            setCurrentChatHistory(prev => ({ ...prev, tagId: tagId }));
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                TagId: tagId
            }));
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, TagId: tagId } : c
            ));
        } catch (err) {
            console.error("Error setting tag:", err);
            setActionPanelError("Failed to set tag: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleRemoveTag = async () => {
        if (!selectedChat?.chatId || !selectedChat.TagId) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await removeTagFromUserApi(user.orgId, selectedChat.chatId, selectedChat.TagId);
            setCurrentChatTags([]);
            setCurrentChatHistory(prev => ({ ...prev, tagId: null }));
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                TagId: null
            }));
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, TagId: null } : c
            ));
        } catch (err) {
            console.error("Error removing tag:", err);
            setActionPanelError("Failed to remove tag: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleAssignAgent = async (agentId) => {
        if (!selectedChat?.chatId || !agentId || selectedChat.assignedAgentId === agentId) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await assignChatToAgentApi(user.orgId, selectedChat.chatId, agentId);
            setSelectedChat(prev => ({ ...prev, assignedAgentId: agentId }));
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, assignedAgentId: agentId } : c
            ));
            fetchAgentCounts();
        } catch (err) {
            console.error("Error assigning chat:", err);
            setActionPanelError("Failed to assign chat: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleChangeChatStatus = async (chatStatus) => {
        if (!selectedChat?.chatId || !chatStatus || chatStatus === selectedChat.chatStatus) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await changeChatStatusApi(user.orgId, selectedChat.chatId, chatStatus);

            setCurrentChatHistory(prev => ({ ...prev, ChatStatus: chatStatus }));
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                chatStatus: chatStatus
            }));
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, chatStatus: chatStatus } : c
            ));
            fetchAgentCounts();
            fetchChatList(currentPage, true);

        } catch (err) {
            console.error("Error changing chat status:", err);
            setActionPanelError("Failed to change chat status: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleSendMessage = async (content, messageType = 'text', fileName, fileType, audioDuration, fileSize) => {
        if (!selectedChat?.chatId || (!content && messageType === 'text')) return;

        const messageData = {
            orgId: user.orgId,
            channelId: selectedChat.channelConfig,
            chatId: selectedChat.chatId,
            externalSenderId: selectedChat.customerExternalId,
            platform: selectedChat.platfrom,
            type: messageType,
            text: content,
            fileName: fileName,
            fileExt: fileType,
            audioDuration: messageType === 'audio' ? audioDuration : 0,
            fileSize: messageType === 'document' ? fileSize : 0
        };

        try {
            await sendMessageApi(messageData);
            fetchAgentCounts();
        } catch (err) {
            console.error("Error sending message:", err);
            setActionPanelError("Failed to send message: " + (err.message || "Unknown error."));
            setCurrentChatHistory(prevHistory => {
                if (prevHistory) {
                    return {
                        ...prevHistory,
                        chatMessage: prevHistory.chatMessage?.filter(msg => !msg.id.startsWith('temp-'))
                    };
                }
                return prevHistory;
            });
        }
    };

    const handleLoadMoreChats = () => {
        if (hasMoreChats && !chatListLoading) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handleChannelFilterChange = (channelId) => {
        setSelectedChannelId(channelId === 'All' ? null : channelId);
        setSelectedTagIdFilter(null);
        setSelectedChatStatusFilter('All');
        setSearchTerm('');
        resetFiltersAndFetch();
    };

    const handleStatusFilterChange = (status) => {
        setSelectedChatStatusFilter(status);
        setSelectedChannelId(null);
        setSelectedTagIdFilter(null);
        setSearchTerm('');
        resetFiltersAndFetch();
    };

    const handleTagFilterChange = (tagId) => {
        setSelectedTagIdFilter(tagId === 'All' ? null : tagId);
        setSelectedChannelId(null);
        setSelectedChatStatusFilter('All');
        setSearchTerm('');
        resetFiltersAndFetch();
    };

    const handleSearchTermChange = (term) => {
        setSearchTerm(term);
        resetFiltersAndFetch();
    };

    useEffect(() => {
        return () => {
            if (user?.userId && selectedChat?.chatId) {
                agentClosedChat(user.userId, selectedChat?.chatId);
            }
        };
    }, [agentClosedChat, user?.userId, selectedChat?.chatId]);


    return (
        <div className="container-full-height">
            {/* Mobile Sidebar */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'fixed', top: '1rem', left: '1rem', zIndex: 50,
                    padding: '0.5rem', borderRadius: '50%', backgroundColor: '#007bff', color: 'white',
                    border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer',
                    display: window.innerWidth <= 768 ? 'block' : 'none'
                }}
                aria-label="Toggle sidebar"
            >
                <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
            </button>

            {/* Left Sidebar */}
            <ChatSideBar
                user={user}
                logout={logout}
                agentOnlineStatus={agentOnlineStatus}
                isActionPanelLoading={isActionPanelLoading}
                handleAgentStatusToggle={handleAgentStatusToggle}
                signalRError={signalRError}
                isSignalRConnected={isSignalRConnected}
                channels={channels}
                handleChannelFilterChange={handleChannelFilterChange}
                selectedChannelId={selectedChannelId}
                agentAssignedChatsCounts={agentAssignedChatsCounts}
                handleStatusFilterChange={handleStatusFilterChange}
                selectedChatStatusFilter={selectedChatStatusFilter}
                tagsWithCounts={tagsWithCounts}
                handleTagFilterChange={handleTagFilterChange}
                selectedTagIdFilter={selectedTagIdFilter}
                isChannelsSectionVisible={isChannelsSectionVisible}
                setIsChannelsSectionVisible={setIsChannelsSectionVisible}
                isNavigSectionVisible={isNavigSectionVisible}
                setIsNavigSectionVisible={setIsNavigSectionVisible}
                isSidebarOpen={isSidebarOpen}
                platformIcons={platformIcons}
            />

            {/* Main Content Area */}
            <main className="main-chat-content" style={{ boxShadow: '-2px 0 10px rgba(0,0,0,0.1)' }}>
                {/* Chat List */}
                <ChatList
                    chatList={chatList}
                    selectedChat={selectedChat}
                    handleChatSelect={handleChatSelect}
                    chatListLoading={chatListLoading}
                    chatListError={chatListError}
                    allAvailableTags={allAvailableTags}
                    platformIcons={platformIcons}
                    handleLoadMoreChats={handleLoadMoreChats}
                    hasMoreChats={hasMoreChats}
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearchTermChange}
                />

                {/* Chat Conversation */}
                <ChatConversation
                    selectedChat={selectedChat}
                    currentChatHistory={currentChatHistory}
                    isActionPanelLoading={isActionPanelLoading}
                    actionPanelError={actionPanelError}
                    currentChatNote={currentChatNote}
                    setCurrentChatNote={setCurrentChatNote}
                    handleSetNote={handleSetNote}
                    handleAssignAgent={handleAssignAgent}
                    teamsAndAgents={teamsAndAgents}
                    currentChatTags={currentChatTags}
                    handleSetTag={handleSetTag}
                    handleRemoveTag={handleRemoveTag}
                    allAvailableTags={allAvailableTags}
                    handleChangeChatStatus={handleChangeChatStatus}
                    handleSendMessage={handleSendMessage}
                    platformIcons={platformIcons}
                    onAcceptChat={handleAcceptChat}
                    onRejectChat={handleRejectChat}
                    onViewChatHistory={handleViewChatHistory}
                />
            </main>
        </div>
    );
};

export default ChatPage;