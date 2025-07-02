import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sendMessageApi } from '../api/chats';
import { faEllipsisV, faNoteSticky, faArrowRightArrowLeft, faTag, faCommentDots, faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons';
import ChatMessageArea from './ChatMessageArea'; 
import MessageInput from './MessageInput';

const ChatConversation = ({
    selectedChat,
    currentChatHistory,
    isActionPanelLoading,
    actionPanelError,
    currentChatNote,
    setCurrentChatNote,
    handleSetNote,
    handleAssignAgent,
    teamsAndAgents,
    currentChatTags,
    handleSetTag,
    handleRemoveTag,
    allAvailableTags,
    handleChangeChatStatus,
    handleSendMessage,
    platformIcons,
    onAcceptChat,
    onRejectChat 
}) => {
    const { user } = useAuth();
    const [isActionPanelVisible, setIsActionPanelVisible] = useState(false);
    const currentTagName = selectedChat?.TagId
        ? allAvailableTags.find(tag => tag.id === selectedChat.TagId)?.name
        : null;

    const isAcceptableByCurrentUser = currentChatHistory && currentChatHistory.acceptAssigned === false

    const handleRateAgent = async () => {
        if (!selectedChat || !user) {
            alert('Please select a chat and ensure user is logged in to rate.');
            return;
        }

        const orgId = selectedChat.orgId || user.orgId; 
        const chatId = selectedChat.chatId;
        const agentId = user.userId; 
        const customerName = selectedChat.displayname || 'Unknown Customer'; 
        const customerId = selectedChat.customerExternalId || selectedChat.externalChatId || 'unknown';
        const platform = selectedChat.platfrom;

        if (!orgId || !chatId || !agentId || !platform) {
            alert('Missing essential chat details (OrgId, ChatId, AgentId, Platform) to generate rating URL.');
            console.error('Rating URL generation failed due to missing data:', { orgId, chatId, agentId, platform, customerName, customerId });
            return;
        }

        const ratingUrl = `http://localhost:3000/customer-rating?` +
                         `OrgId=${encodeURIComponent(orgId)}&` +
                         `ChatId=${encodeURIComponent(chatId)}&` +
                         `AgentId=${encodeURIComponent(agentId)}&` +
                         `customerName=${encodeURIComponent(customerName)}&` +
                         `customerId=${encodeURIComponent(customerId)}&` +
                         `platform=${encodeURIComponent(platform)}`;

        const shortUrl = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(ratingUrl)}`).then(res => res.text());
        const message = `⭐Please Rate Me Here:\n${shortUrl}`;

        //const message = `⭐Please Rate Me Here:\n${ratingUrl}`;

        const messageData = {
            orgId: user.orgId,
            channelId: selectedChat.channelConfig,
            chatId: selectedChat.chatId,
            externalSenderId: selectedChat.customerExternalId,
            platform: selectedChat.platfrom,
            type: "text",
            text: message,
            audioDuration: 0
        };

        await sendMessageApi(messageData, user.token);
    };

    return (
        <section className="chat-conversation-section" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {selectedChat ? (
                <>
                {/* Chat Actions Panel */}
                    {isActionPanelVisible && (
                        <div className="action-panel" style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f9f9f9', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {/* Set Note */}
                            <div className="action-card">
                                <label htmlFor="chat-note">
                                    <FontAwesomeIcon icon={faNoteSticky} style={{ marginRight: '0.25rem' }} /> Note:
                                </label>
                                <textarea
                                    id="chat-note"
                                    value={currentChatNote}
                                    onChange={(e) => setCurrentChatNote(e.target.value)}
                                    placeholder="Add a note for this chat..."
                                    rows="2"
                                    disabled={isActionPanelLoading}
                                ></textarea>
                                <button onClick={handleSetNote} disabled={isActionPanelLoading || currentChatNote === currentChatHistory?.note} className="blue">
                                    {isActionPanelLoading ? 'Saving...' : 'Set Note'}
                                </button>
                            </div>

                            {/* Assign Agent/Team */}
                            <div className="action-card">
                                <label htmlFor="assign-agent">
                                    <FontAwesomeIcon icon={faArrowRightArrowLeft} style={{ marginRight: '0.25rem' }} /> Transfer Chat:
                                </label>
                                <select
                                    id="assign-agent"
                                    value={selectedChat.assignedAgentId || ''}
                                    onChange={(e) => handleAssignAgent(e.target.value)}
                                    disabled={isActionPanelLoading}
                                >
                                    <option value="">Select Agent or Team</option>
                                    {teamsAndAgents.map(team => (
                                        <optgroup key={team.id} label={`Team: ${team.name}`}>
                                            {team.usersList.map(agent => (
                                                <option key={agent.userId} value={agent.userId}>
                                                    {agent.userName} {agent.isOnline ? '(Online)' : '(Offline)'}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button onClick={() => handleAssignAgent(selectedChat.assignedAgentId)} disabled={isActionPanelLoading || !selectedChat.assignedAgentId} className="indigo">
                                    {isActionPanelLoading ? 'Transferring...' : 'Transfer'}
                                </button>
                            </div>

                            {/* Set/Remove Tag */}
                            <div className="action-card">
                                <label htmlFor="set-tag">
                                    <FontAwesomeIcon icon={faTag} style={{ marginRight: '0.25rem' }} /> Tags:
                                </label>
                                <select
                                    id="set-tag"
                                    value={currentChatTags?.[0] || ''}
                                    onChange={(e) => handleSetTag(e.target.value)}
                                    disabled={isActionPanelLoading}
                                >
                                    <option value="">Select a Tag</option>
                                    {allAvailableTags.map(tag => (
                                        <option key={tag.id} value={tag.id}>
                                            {tag.name}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={() => handleSetTag(currentChatTags?.[0] || null)} disabled={isActionPanelLoading || !currentChatTags?.[0]} className="green">
                                    {isActionPanelLoading ? 'Applying...' : 'Apply Tag'}
                                </button>
                                {currentChatTags?.length > 0 && (
                                    <button onClick={handleRemoveTag} disabled={isActionPanelLoading} className="red" style={{ marginTop: '0.5rem' }}>
                                        {isActionPanelLoading ? 'Removing...' : 'Remove Current Tag'}
                                    </button>
                                )}
                            </div>

                            {/* Change Status */}
                            <div className="action-card">
                                <label htmlFor="change-status">
                                    <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '0.25rem' }} /> Change Status:
                                </label>
                                <select
                                    id="change-status"
                                    value={selectedChat?.chatStatus || ''}
                                    onChange={(e) => handleChangeChatStatus(e.target.value)}
                                    disabled={isActionPanelLoading}
                                >
                                    <option value="">Select Status</option>
                                    {['Pending', 'Assigned', 'InProgress', 'Closed'].map(statusOption => (
                                        <option key={statusOption} value={statusOption}>
                                            {statusOption}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={() => handleChangeChatStatus(selectedChat?.chatStatus)} disabled={isActionPanelLoading || !selectedChat?.chatStatus} className="yellow">
                                    {isActionPanelLoading ? 'Updating...' : 'Set Status'}
                                </button>
                            </div>
                            {actionPanelError && (
                                <div style={{ gridColumn: 'span 4', backgroundColor: '#ffe0e0', border: '1px solid #ffb3b3', color: '#cc0000', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }} role="alert">
                                    <span>{actionPanelError}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Chat Header */}
                    <header className="header-panel" style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                                src={selectedChat.pictureUrl || `https://placehold.co/48x48/cccccc/333333?text=${selectedChat.displayname?.charAt(0) || '?'}`}
                                alt={selectedChat.displayname || 'User'}
                                style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid #007bff' }}
                            />
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{selectedChat.displayname}</h2>
                                <p style={{ fontSize: '0.875rem', color: '#555', margin: 0 }}>
                                    {platformIcons[selectedChat.platfrom] || <FontAwesomeIcon icon={faPaperPlane} style={{color: '#777'}}/>} 
                                      Status: {selectedChat.chatStatus}
                                    {currentTagName && (
                                        <span style={{ marginLeft: '0.5rem', backgroundColor: '#e6e0ff', color: '#6610f2', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                            <FontAwesomeIcon icon={faTag} style={{ marginRight: '0.25rem' }} />
                                            {currentTagName}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <button
                                onClick={handleRateAgent}
                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#007bff' }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                title="Rate Agent"
                            >
                                <FontAwesomeIcon icon={faStar} />
                            </button>

                            <button
                                onClick={() => setIsActionPanelVisible(!isActionPanelVisible)}
                                style={{ padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#555' }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                title={isActionPanelVisible ? "Hide Actions" : "Show Actions"}
                            >
                            <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                        </div>
                    </header>

                    {/* Chat Message Area */}
                    <ChatMessageArea
                        chatHistory={currentChatHistory}
                        loading={isActionPanelLoading}
                        error={actionPanelError}
                        currentAgentId={user?.userId}
                        currentChatTags={currentChatTags}
                        selectedChatStatus={selectedChat?.ChatStatus}
                        allAvailableTags={allAvailableTags}
                        selectedChatPlatform={selectedChat?.platfrom}
                        platformIcons={platformIcons}
                        onAcceptChat={onAcceptChat}
                        onRejectChat={onRejectChat}
                        isAcceptable = {isAcceptableByCurrentUser}
                        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} 
                    />

                    {/* Message Input Area */}
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        isLoading={isActionPanelLoading}
                    />
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#777' }}>
                    <svg style={{ width: '5rem', height: '5rem', marginBottom: '1rem' }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5-8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                    <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Select a chat to view conversation</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Click on any chat from the left panel to begin.</p>
                </div>
            )}
        </section>
    );
};

export default ChatConversation;
