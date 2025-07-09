import React,{ useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ChatItem from './ChatItem';

const ChatList = ({
    chatList,
    selectedChat,
    handleChatSelect,
    chatListLoading,
    chatListError,
    allAvailableTags,
    platformIcons,
    handleLoadMoreChats, 
    hasMoreChats,
}) => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredChats, setFilteredChats] = useState(chatList);    

    useEffect(() => {
         if (!user || !user.orgId) {
            setFilteredChats([]); 
            return;
        }
        const orgFiltered = chatList.filter(chat => chat.orgId === user.orgId);
        setFilteredChats(orgFiltered);

        if (searchTerm) {
          const lowercasedSearchTerm = searchTerm.toLowerCase();
          const filtered = orgFiltered.filter(chat =>
            chat.displayname?.toLowerCase().includes(lowercasedSearchTerm)
          );
          setFilteredChats(filtered);
        } else {
          setFilteredChats(orgFiltered);
        }
      }, [chatList, searchTerm]);
      
    return (
        <section className="chat-list-section">
            <header className="header-panel" style={{ backgroundColor: '#f9f9f9' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
                    Chat Inbox
                    <span style={{ marginLeft: '0.5rem', backgroundColor: '#e0f2ff', color: '#007bff', fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>{chatList.length}</span>
                </h2>
                {/* Search bar */}
                <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        marginTop: '0.75rem', width: 'calc(100% - 1rem)', padding: '0.5rem',
                        border: '1px solid #ccc', borderRadius: '0.5rem',
                        transition: 'border-color 0.15s ease-in-out'
                    }}
                />
            </header>
            <div className="custom-scrollbar" style={{ padding: '1rem' }}>
                {chatListLoading && chatList.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '1.5rem', color: '#007bff' }} />
                    </div>
                ) : chatListError ? (
                    <div style={{ textAlign: 'center', color: '#cc0000' }}>Error: {chatListError}</div>
                ) : chatList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>No chats found with current filters.</div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredChats.map(chat => (
                            <ChatItem
                                key={chat.chatId}
                                chat={chat}
                                isSelected={selectedChat?.chatId === chat.chatId}
                                onSelect={handleChatSelect}
                                allAvailableTags={allAvailableTags}
                                platformIcons={platformIcons}
                            />
                        ))}
                    </ul>
                )}
                {/* Load More Button */}
                {hasMoreChats && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                        <button
                            onClick={handleLoadMoreChats}
                            disabled={chatListLoading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: chatListLoading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {chatListLoading && chatList.length > 0 ? ( 
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : null}
                            {chatListLoading && chatList.length > 0 ? 'Loading More...' : 'Load More Chats'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ChatList;
