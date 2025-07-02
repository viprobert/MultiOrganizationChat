
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faPaperPlane, faImage, faFileAudio, faLocationArrow, faIcons, faVideo, faFile } from '@fortawesome/free-solid-svg-icons';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const getLatestMessagePreview = (message) => {
    console.log("message to list view", message);
    if (message.messageType === "text"){
     return(
        message.contenet
      )
    }
    else if (message.messageType === "image"){
      return(
      <div sx={{ display: 'flex', alignItems: 'center' }}>
        <FontAwesomeIcon icon={faImage} sx={{ mr: 0.5 }} /> Image
      </div>
      )
    }
    else if (message.messageType === "audio"){
      return(
      <div sx={{ display: 'flex', alignItems: 'center' }}>
         <FontAwesomeIcon icon={faFileAudio} sx={{ mr: 0.5 }} /> Audio
      </div>
      )
    }
    else if (message.messageType === "video"){
      return(
      <div sx={{ display: 'flex', alignItems: 'center' }}>
         <FontAwesomeIcon icon={faVideo} sx={{ mr: 0.5 }} /> Video
      </div>
      )
    }
    else if (message.messageType === "document"){
      return(
      <div sx={{ display: 'flex', alignItems: 'center' }}>
         <FontAwesomeIcon icon={faFile} sx={{ mr: 0.5 }} /> Document
      </div>
      )
    }
    else if (message.messageType === "location"){
      return(
      <div sx={{ display: 'flex', alignItems: 'center' }}>
        <FontAwesomeIcon icon={faLocationArrow} sx={{ mr: 0.5 }} /> Location
      </div>
      )
    }
    else if (message.messageType === "sticker"){
      return (
          <div sx={{ display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faIcons} sx={{ mr: 0.5 }} /> Sticker
          </div>
        )
    }        
        return message.content;
  };

const ChatItem = ({ chat, isSelected, onSelect, allAvailableTags, platformIcons }) => {
     const currentTagName = chat?.tagId
        ? allAvailableTags.find(tag => tag.id === chat.tagId)?.name
        : null;
    return (
        <li
            className={`chat-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(chat)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                    src={chat.pictureUrl || `https://placehold.co/48x48/cccccc/333333?text=${chat.displayname?.charAt(0) || '?'}`}
                    alt={chat.displayname || 'User'}
                    style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #66b3ff' }}
                />
                <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#333',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            flexShrink: 1, 
                            marginRight: '0.5rem'
                        }}>
                            {chat.displayname}
                        </h3>
                        {chat.unreadCount > 0 && (
                            // <span style={{ backgroundColor: '#ff4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.125rem 0.5rem', borderRadius: '9999px', flexShrink: 0 }}>
                            //     {chat.unreadCount}
                            // </span>
                            <span style={{ backgroundColor: '#ff4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.125rem', borderRadius: '50%', width: '0.75rem', height: '0.75rem', display: 'inline-block', flexShrink: 0 }}>
                            </span>
                        )}
                    </div>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#555',
                        wordBreak: 'break-word', 
                        overflowWrap: 'break-word',
                        marginTop: '0.25rem'
                    }}>
                        {getLatestMessagePreview(chat.chatMessage) || 'No messages'}
                        {/* {chat.chatMessage?.content || 'No messages'} */}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#777', marginTop: '0.25rem' }}>
                        {formatTimestamp(chat.latestMsgTime)}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                        
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#e0f2ff', color: '#007bff', fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
                            {platformIcons[chat.platfrom] || <FontAwesomeIcon icon={faPaperPlane} style={{color: '#777'}}/>} 
                            {chat.platfrom}
                        </span>
                        
                        {currentTagName && (
                            <span style={{ marginLeft: '0.5rem', backgroundColor: '#e6e0ff', color: '#6610f2', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                <FontAwesomeIcon icon={faTag} style={{ marginRight: '0.25rem' }} />
                                {currentTagName}
                            </span>
                        )}
                        
                        {chat.chatStatus && (
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px',
                                fontWeight: '600',
                                backgroundColor: chat.chatStatus === 'Active' || chat.chatStatus === 'InProgress' ? '#d4edda' :
                                                 chat.chatStatus === 'Pending' ? '#fff3cd' :
                                                 chat.chatStatus === 'Assigned' ? '#e0f2ff' :
                                                 chat.chatStatus === 'Closed' ? '#f8d7da' : '#eee',
                                color: chat.chatStatus === 'Active' || chat.chatStatus === 'InProgress' ? '#155724' :
                                       chat.chatStatus === 'Pending' ? '#856404' :
                                       chat.chatStatus === 'Assigned' ? '#004085' :
                                       chat.chatStatus === 'Closed' ? '#721c24' : '#333'
                            }}>
                                {chat.chatStatus}
                            </span>
                        )}
                    </div>
                </div>
            </div>           
        </li>
    );
};

export default ChatItem;
