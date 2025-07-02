import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle, faFileAlt, faLocationArrow } from '@fortawesome/free-solid-svg-icons';

const formatMessageTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const ChatMessageArea = ({ chatHistory, loading, error, currentAgentId, onAcceptChat, onRejectChat, isAcceptable }) => {
    const [messagesAcceptedOrRejected, setMessagesAcceptedOrRejected] = useState(false);
    const [accept, setAccept] = useState(null);
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (chatHistory?.chatId) {
            const isAlreadyHandled = chatHistory.ChatStatus === 'InProgress' || chatHistory.ChatStatus === 'Closed'; 
            setMessagesAcceptedOrRejected(isAlreadyHandled);
        }else {
            setMessagesAcceptedOrRejected(false);
        }
    },[chatHistory]);

    const handleAcceptClick = async (e) => {
        e.stopPropagation();
        setMessagesAcceptedOrRejected(true);
        if (onAcceptChat) {
            try{
                await onAcceptChat(chatHistory.chatId);
            } catch (error){
                 console.error("Error accepting chat:", error);
                setMessagesAcceptedOrRejected(false);
            }
        }
    };

    const handleRejectClick = async (e) => {
        e.stopPropagation();
        if (onRejectChat) {
            setMessagesAcceptedOrRejected(true);
            try {
                await onRejectChat(chatHistory.chatId);
            } catch (error) {
                console.error("Error rejecting chat:", error);
                setMessagesAcceptedOrRejected(false);
            }
        }
    };

    if (loading) {
        return (
            <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9f9f9' }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                <p style={{ marginLeft: '0.75rem', color: '#555' }}>Loading messages...</p>
            </div>
        );
    }

    if (!chatHistory || !chatHistory.chatMessage || chatHistory.chatMessage.length === 0) {
        return (
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9f9f9' }}>
                <p style={{ color: '#777', fontSize: '1.125rem' }}>No messages in this chat yet.</p>
                <p style={{ fontSize: '0.875rem', color: '#777', marginTop: '0.5rem' }}>Start the conversation below!</p>
            </div>
        );
    }

    const sortedMessages = [...chatHistory.chatMessage].sort((a, b) =>
        new Date(a.timeStamp) - new Date(b.timeStamp)
    );
        
     const shouldShowAcceptRejectControls = isAcceptable && !messagesAcceptedOrRejected;

    return (
        <div className="custom-scrollbar" style={{ flex: '1', overflowY: 'auto', padding: '1rem', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedMessages.map((message) => {
                    const isAgentMessage = message.senderType === 'Agent' && message.senderUserId === currentAgentId;
                    const isOtherAgentMessage = message.senderType === 'Agent' && message.senderUserId !== currentAgentId;
                    const isVideoMessage = message.messageType === 'video';
                    console.log("Isvideo",isVideoMessage);
                    let bubbleStyle = {
                        maxWidth: '70%',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        marginBottom: '0.5rem',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    };
                    let flexAlign = 'flex-start';

                    if (isAgentMessage) {
                        bubbleStyle = {
                            ...bubbleStyle,
                            backgroundColor: '#007bff',
                            color: 'white',
                            marginLeft: 'auto',
                            borderBottomRightRadius: 0
                        };
                        flexAlign = 'flex-end';
                    } else if (isOtherAgentMessage) {
                        bubbleStyle = {
                            ...bubbleStyle,
                            backgroundColor: '#d0e0f0', 
                            color: '#333',
                            marginRight: 'auto',
                            borderBottomLeftRadius: 0
                        };
                        flexAlign = 'flex-start';
                    } else if (isVideoMessage){
                        bubbleStyle = {
                            ...bubbleStyle,
                            maxWidth: '25%',
                            maxHeight: '25%'
                        }
                    }
                    else { 
                        bubbleStyle = {
                            ...bubbleStyle,
                            backgroundColor: '#e2e2e2',
                            color: '#333',
                            marginRight: 'auto',
                            borderBottomLeftRadius: 0
                        };
                        flexAlign = 'flex-start';
                    }


                    return (
                        <div
                            key={message.id}
                            style={{ display: 'flex', justifyContent: flexAlign }}
                        >

                        {shouldShowAcceptRejectControls && message.id === sortedMessages[0]?.id && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                right: '20rem',
                                // transform: 'translateY(-50%)',
                                display: 'flex',
                                gap: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                <p>Will you accept this Chat to be assigned?</p>
                                <button
                                    onClick={handleAcceptClick}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#218838'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#28a745'}
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} /> Accept
                                </button>
                                <button
                                    onClick={handleRejectClick}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'}
                                >
                                    <FontAwesomeIcon icon={faTimesCircle} /> Reject
                                </button>
                            </div>
                        )}
                            <div style={bubbleStyle}>
                                {message.messageType === 'image' && message.content ? (
                                    <img src={message.content} alt="Sent" style={{ maxWidth: '100%', borderRadius: '0.5rem' }} />
                                ) : message.messageType === 'audio' && message.content ? (
                                    <audio controls src={message.content}></audio>
                                ) : message.messageType === 'video' &&  message.content ? (
                                    <video controls src={message.content} style={{ maxWidth: '100%', maxHeight: '400px', width: 'auto', height:'auto',borderRadius: '0.5rem', display:'block' }}>
                                        Your browser does not support the video tag.
                                    </video>
                                ) : message.messageType === 'document' && message.content ? (
                                    <a 
                                        href={message.content} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{  
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            color: '#007bff', 
                                            textDecoration: 'underline',
                                            wordBreak: 'break-all',
                                            color: 'white'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faFileAlt} />
                                        Download File
                                    </a>
                                ) : message.messageType === 'location' && message.content ? (
                                    <div sx={{ display: 'flex', alignItems: 'center' }}>
                                        <a href = {message.content} target='blank' style={{textDecoration: 'none'}}>
                                        <FontAwesomeIcon icon={faLocationArrow} sx={{ mr: 0.5 }} /> Location
                                        </a>
                                    </div>   
                                ) : (
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{message.content}</p>
                                )}
                                <span style={{ display: 'block', textAlign: 'right', fontSize: '0.65rem', opacity: '0.8', marginTop: '0.25rem' }}>
                                    {formatMessageTimestamp(message.timeStamp)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatMessageArea;
