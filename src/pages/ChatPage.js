import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { changeAgentStatusApi } from '../api/auth';
import { getAllChannelsApi } from '../api/channels';
import { getAssignedChatsByAgentStatusApi, getFilteredChatsApi, seenMessageApi, getChatMessageHistoryApi, assignChatToAgentApi, changeChatStatusApi, sendMessageApi, AcceptMessageApi } from '../api/chats';
import { getChatsByTagApi, getAllTagsApi, setUserTaggingApi, removeTagFromUserApi } from '../api/tags';
import { getTeamsAndAgentsApi } from '../api/teams';
import { setUserNoteApi } from '../api/notes';
import { useSignalR } from '../hooks/useSignalR';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  FaFacebookMessenger,
  FaLine,
  FaTelegramPlane,
  FaWhatsapp,
} from 'react-icons/fa';
import ChatSideBar from '../components/ChatSideBar';
import ChatList from '../components/ChatList';
import ChatConversation from '../components/ChatConversation';

const platformIcons = {
  LINE: <FaLine size={20} style={{ color: '#00B900' }} />, 
  TELEGRAM: <FaTelegramPlane size={20} style={{ color: '#0088CC', paddingRight: '5px' }} />, 
  WhatsApp: <FaWhatsapp size={20} style={{ color: '#25D366' }} />, 
  Messenger: <FaFacebookMessenger size={20} style={{ color: '#0078FF' }} />, 
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
    const [selectedChatStatusFilter, setSelectedChatStatusFilter] = useState('All'); // 'All', 'Unread', 'Pending', 'Assigned', 'InProgress', 'Closed'
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

    const fetchChatList = useCallback(async (pageToFetch = currentPage, resetList = false) => {
        if (!user?.token) {
            console.warn("Missing user token for fetching chat list.");
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
            const chats = await getFilteredChatsApi(params, user.token);

            let finalFilteredChats = chats;
            if (selectedChatStatusFilter === 'Unread') {
                finalFilteredChats = chats.filter(chat => chat.unreadCount > 0);
            }
            else if (selectedChatStatusFilter === 'Unassigned'){
                finalFilteredChats = chats.filter(chat =>
                chat.assignedAgentId === null && chat.assignedTeamId === null
            );
            }

            if (resetList) {
                setChatList(finalFilteredChats);
            } else {
                setChatList(prevChats => [...prevChats, ...finalFilteredChats]);
            }
            setHasMoreChats(finalFilteredChats.length === CHATS_PER_PAGE);

            if (selectedChat && !finalFilteredChats.some(chat => chat.chatId === selectedChat.chatId)) {
                setSelectedChat(null);
                setCurrentChatHistory(null);
            }
        } catch (err) {
            console.error("Error fetching chat list:", err);
            setChatListError("Failed to load chat list. " + (err.message || "Please try again."));
        } finally {
            setChatListLoading(false);
        }
    }, [user, selectedChannelId, selectedChatStatusFilter, selectedTagIdFilter, searchTerm, selectedChat, currentPage]);

    const fetchAgentCounts = useCallback(async () => {
        if (!user?.orgId || !user?.token || !user?.userId) {
            console.warn("Missing user info for fetching agent counts.");
            return;
        }
        try {
            const assignedChats = await getAssignedChatsByAgentStatusApi(user.userId, user.orgId, user.token);
            const allAssignedCount = assignedChats.filter(chat => chat.assignedAgentId !== null).length;
            const unAssignedCount = assignedChats.filter(chat => chat.assignedAgentId === null).length;
            const unreadAssignedCount = assignedChats.filter(chat => chat.unreadCount > 0).length;
            setAgentAssignedChatsCounts({ all: allAssignedCount, unread: unreadAssignedCount, unassigned: unAssignedCount });
        } catch (err) {
            console.error("Error fetching agent counts:", err);
        }
    }, [user?.orgId, user?.token, user?.userId]);

  
    useEffect(() => {
        const fetchchatPageData = async () => {
            if (!user?.orgId || !user?.token || !user?.userId) {
                setDashboardError("User organization, ID, or token not found. Please re-login.");
                setLoadingDashboard(false);
                return;
            }

            try {
                setLoadingDashboard(true);
                setDashboardError(null);

                const [channelsData, assignedChats, tagsData, allTags, teamsAgentsData] = await Promise.all([
                    getAllChannelsApi(user.orgId, user.token),
                    getAssignedChatsByAgentStatusApi(user.userId, user.orgId, user.token),
                    getChatsByTagApi(user.orgId, user.token),
                    getAllTagsApi(user.orgId, user.token),
                    getTeamsAndAgentsApi(user.orgId, user.token)
                ]);
                setChannels(channelsData);
                setTagsWithCounts(tagsData);
                setAllAvailableTags(allTags);
                setTeamsAndAgents(teamsAgentsData);
                await fetchAgentCounts();
            } catch (err) {
                console.error("Error fetching dashboard initial data:", err);
                setDashboardError("Failed to load dashboard data. " + (err.message || "Please try again."));
            } finally {
                setLoadingDashboard(false);
            }
        };
        fetchchatPageData();
    }, [user, user?.orgId, user?.userId, user?.token, fetchAgentCounts]);
    
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

                if (selectedChat?.chatId != message.chatId){
                    chatToUpdate.unreadCount = message.unreadCount;
                }else {
                    chatToUpdate.unreadCount = 0;
                }
                
                updatedChats.splice(chatToUpdateIndex, 1);
                updatedChats.unshift(chatToUpdate);
                return updatedChats;
            } else {
                setCurrentPage(1);
                console.log("from hanel receivce message");
                fetchChatList(1, true);
                return prevChats; 
            }
        });

        fetchAgentCounts();
    }, [selectedChat, user?.userId, fetchChatList]);

    const handleAcceptChat = useCallback(async (chatId) => {
        if (!user?.userId || !user?.orgId || !user?.token) {
            console.error("User not authenticated for chat acceptance.");
            return;
        }

        try {
            await AcceptMessageApi(user.orgId, chatId, user.userId, true, user.token);
            await fetchAgentCounts();
                       
            const acceptedChat = chatList.find(chat => chat.chatId === chatId);
            if (acceptedChat) {
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
            }

        } catch (error) {
            console.error("Error accepting chat:", error);
            alert("Failed to accept chat. Please try again.");
        }
    }, [user, chatList, fetchAgentCounts, setSelectedChat]);

    const handleRejectChat = useCallback(async (chatId) => {
        if (!user?.userId || !user?.orgId || !user?.token) {
            console.error("User not authenticated for chat rejection.");
           return;
        }
        try {
            await AcceptMessageApi(user.orgId, chatId, user.userId, false, user.token);
            setChatList(prevChatList => prevChatList.filter(chat => chat.chatId !== chatId));
            console.log("From handle Reject chat");
            await fetchChatList(1, true);
        } catch (error) {
            console.error("Error rejecting chat:", error);
            alert("Failed to reject chat. Please try again.");
        }
    }, [user, fetchChatList]);

    const handleChatUpdated = useCallback((chatUpdate) => {
        console.log('Chat updated via SignalR:', chatUpdate);

        setChatList(prevChats => prevChats.map(chat => {
            if (chat.chatId === chatUpdate.chatId) {
                return {
                    ...chat,
                    ...chatUpdate
                };
            }
            return chat;
        }));

        setCurrentChatHistory(prevHistory => {
            if (prevHistory && prevHistory.chatId === chatUpdate.chatId) {
                return {
                    ...prevHistory,
                    note: chatUpdate.note ?? prevHistory.note,
                    tagId: chatUpdate.tagId ?? prevHistory.tagId,
                    ChatStatus: chatUpdate.status ?? prevHistory.ChatStatus,
                    assignedAgentId: chatUpdate.assignedAgentId ?? prevHistory.assignedAgentId
                };
            }
            return prevHistory;
        });
        setSelectedChat(prevSelectedChat => {
            if (prevSelectedChat && prevSelectedChat.chatId === chatUpdate.chatId) {
                return {
                    ...prevSelectedChat,
                    ...chatUpdate
                };
            }
            return prevSelectedChat;
        });

        const updateAgentCounts = async () => {
            if (user?.userId && user?.token && user?.orgId) {
                const assignedChats = await getAssignedChatsByAgentStatusApi(user.userId, user.orgId, user.token);
                const allAssignedCount = assignedChats.filter(chat => chat.assignedAgentId !== null).length;
                const unAssignedCount = assignedChats.filter(chat => chat.assignedAgentId === null).length;
                const unreadAssignedCount = assignedChats.filter(chat => chat.unreadCount > 0).length;
                setAgentAssignedChatsCounts({ all: allAssignedCount,  unread: unreadAssignedCount, unassigned: unAssignedCount });
            }
        };
        updateAgentCounts();
        console.log("From handle chat update");
        fetchChatList();
    }, [user, fetchChatList]);

    const { isConnected: isSignalRConnected, error: signalRError } = useSignalR(
        user?.userId,
        user?.token,
        handleReceiveMessage,
        handleChatUpdated
    );


    useEffect(() => {
        if (!loadingDashboard && !dashboardError) {
            console.log("fromuseeffect - Line 323");
            fetchChatList(1, true);
            setCurrentPage(1);
        }
    }, [loadingDashboard, dashboardError, selectedChannelId, selectedChatStatusFilter, selectedTagIdFilter, searchTerm, fetchChatList]);

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

    const handleChatSelect = useCallback(async (chat) => {
        setSelectedChat(chat);
        try {
            setActionPanelError(null);
            setIsActionPanelLoading(true);

            const history = await getChatMessageHistoryApi(chat.chatId,user.orgId, user.token);
            setCurrentChatHistory(history);

            const noteContent = history?.note || '';
            setCurrentChatNote(noteContent);
            setCurrentChatTags(history?.tagId ? [history.tagId] : []);

            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                note: history.note,
                TagId: history.tagId,
                ChatStatus: history.ChatStatus,
                assignedAgentId: history.assignedAgentId
            }));

            await seenMessageApi(user.orgId, chat.chatId, user.userId, history.chatMessage?.[0]?.id || null, user.token);
            
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === chat.chatId ? { ...c, unreadCount: 0} : c
            ));
        } catch (err) {
            console.error("Error fetching chat history or marking seen:", err);
            setActionPanelError("Failed to load chat conversation: " + (err.message || "Unknown error."));
            setCurrentChatHistory(null);
        } finally {
            setIsActionPanelLoading(false);
        }
    }, [user, user?.userId, user?.token]);

    const handleSetNote = async () => {
        if (!selectedChat?.chatId || !user?.token || currentChatNote === currentChatHistory?.note) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await setUserNoteApi(user.orgId, selectedChat.chatId, currentChatNote, user.token);
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
        if (!selectedChat?.chatId || !user?.token || !tagId || tagId === currentChatTags?.[0]) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await setUserTaggingApi(user.orgId, selectedChat.chatId, tagId, user.token);
            setCurrentChatTags([tagId]);
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, TagId: tagId } : c
            ));
            const updatedHistory = await getChatMessageHistoryApi(selectedChat.chatId,user.orgId, user.token);
            setCurrentChatHistory(updatedHistory);
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                TagId: tagId
            }));
            console.log("from handle set tag");
            fetchChatList();
        } catch (err) {
            console.error("Error setting tag:", err);
            setActionPanelError("Failed to set tag: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleRemoveTag = async () => {
        if (!selectedChat?.chatId || !user?.token || !currentChatTags?.length) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await removeTagFromUserApi(user.orgId, selectedChat.chatId, currentChatTags[0], user.token);
            setCurrentChatTags([]);
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, TagId: null } : c
            ));
            const updatedHistory = await getChatMessageHistoryApi(selectedChat.chatId,user.orgId, user.token);
            setCurrentChatHistory(updatedHistory);
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                TagId: null
            })); 
            console.log("from handle remove tag");
            fetchChatList();
        } catch (err) {
            console.error("Error removing tag:", err);
            setActionPanelError("Failed to remove tag: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleAssignAgent = async (agentId) => {
        if (!selectedChat?.chatId || !user?.token || !agentId || selectedChat.assignedAgentId === agentId) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await assignChatToAgentApi(user.orgId, selectedChat.chatId, agentId, user.token);
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, assignedAgentId: agentId } : c
            ));
            setSelectedChat(prev => ({ ...prev, assignedAgentId: agentId }));
            console.log("from handle assign agent");
            fetchChatList();
        } catch (err) {
            console.error("Error assigning chat:", err);
            setActionPanelError("Failed to assign chat: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleChangeChatStatus = async (status) => {
        if (!selectedChat?.chatId || !user?.token || !status || status === selectedChat.ChatStatus) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            await changeChatStatusApi(user.orgId, selectedChat.chatId, status, user.token);
            setChatList(prevChats => prevChats.map(c =>
                c.chatId === selectedChat.chatId ? { ...c, ChatStatus: status } : c
            ));
            setSelectedChat(prevSelectedChat => ({
                ...prevSelectedChat,
                ChatStatus: status
            }));
            console.log("from handle change status");
            fetchChatList();
        } catch (err) {
            console.error("Error changing chat status:", err);
            setActionPanelError("Failed to change chat status: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const handleSendMessage = async (content, messageType = 'text', fileName, fileType) => {
        if (!selectedChat?.chatId || !user?.token || (!content && messageType === 'text')) return;

        const messageData = {
            orgId: user.orgId,
            channelId: selectedChat.channelConfig,
            chatId: selectedChat.chatId,
            externalSenderId: user.userId,
            platform: selectedChat.platfrom,
            type: messageType,
            text: content,
            fileName: fileName,
            fileExt: fileType,
            audioDuration: messageType === 'audio' ? 0 : 0
        };

        try {
//             setCurrentChatHistory(prevHistory => {
//                 const newChatMessage = {
//                     id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//                     chatId: selectedChat.chatId,
//                     senderType: 'Agent',
//                     senderUserId: user.userId,
//                     externalSenderId: user.userId,
//                     content: content,
//                     messageType: messageType,
//                     timeStamp: new Date().toISOString(),
//                     externalMessageId: null
//                 };
//                 return {
//                     ...prevHistory,
//                     chatMessage: [...(prevHistory?.chatMessage || []), newChatMessage]
//                 };
//             });
            await sendMessageApi(messageData, user.token);
        } catch (err) {
            console.error("Error sending message:", err);
            setActionPanelError("Failed to send message: " + (err.message || "Unknown error.")); 
        }
    };

    const handleLoadMoreChats = () => {
        setCurrentPage(prevPage => prevPage + 1);
        console.log("currentpage", currentPage);
    };

    const handleChannelFilterChange = (channelId) => {
        setSelectedChannelId(channelId === 'All' ? null : channelId);
        setSelectedTagIdFilter(null);
        setSelectedChatStatusFilter('All');
        setSelectedChat(null);
        setSearchTerm('');
        setCurrentPage(1);
        setHasMoreChats(true);
    };

    const handleStatusFilterChange = (status) => {
        setSelectedChatStatusFilter(status);
        setSelectedChannelId(null);
        setSelectedTagIdFilter(null);
        setSelectedChat(null);
        setSearchTerm('');
        setCurrentPage(1);
        setHasMoreChats(true);
    };

    const handleTagFilterChange = (tagId) => {
        setSelectedTagIdFilter(tagId === 'All' ? null : tagId);
        setSelectedChannelId(null);
        setSelectedChatStatusFilter('All');
        setSelectedChat(null);
        setSearchTerm('');
        setCurrentPage(1);
        setHasMoreChats(true);
    };

    useEffect(() => {
        console.log("from useeffect - line 573");
        if (currentPage > 1) {
            fetchChatList(currentPage, false);
        }
    }, [currentPage, fetchChatList]);

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
                isNavigSectionVisible = {isNavigSectionVisible}
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
                />
            </main>
        </div>
    );
};

export default ChatPage;
