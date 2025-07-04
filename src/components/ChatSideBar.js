import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faRoute, faTag, faCommentDots, faSpinner, faUserPlus, faSitemap,
        faChevronDown, faChevronUp, faUserAstronaut, faPeopleGroup, faUserTie, 
        faGlobe, faSatelliteDish, faHand, faComment, faLaptop } from '@fortawesome/free-solid-svg-icons'; 
import { FaFacebookMessenger, FaLine, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const platformIcons = {
  LINE: <FaLine size={20} style={{ color: '#00B900' }} />,
  TELEGRAM: <FaTelegramPlane size={20} style={{ color: '#0088CC' }} />,
  WhatsApp: <FaWhatsapp size={20} style={{ color: '#25D366' }} />,
  Messenger: <FaFacebookMessenger size={20} style={{ color: '#0078FF' }} />,
};

const ChatSideBar = ({
    user,
    logout,
    agentOnlineStatus,
    isActionPanelLoading,
    handleAgentStatusToggle,
    signalRError,
    isSignalRConnected,
    channels,
    handleChannelFilterChange,
    selectedChannelId,
    agentAssignedChatsCounts,
    handleStatusFilterChange,
    selectedChatStatusFilter,
    tagsWithCounts,
    handleTagFilterChange,
    selectedTagIdFilter,
    isChannelsSectionVisible,
    setIsChannelsSectionVisible,
    isNavigSectionVisible,
    setIsNavigSectionVisible,
    isSidebarOpen 
}) => {
    const statusColor = agentOnlineStatus ? 'green' : 'red';
    const statusText = agentOnlineStatus ? 'Online' : 'Offline';
    const location = useLocation(); 
    const hasPermission = (permission) => user?.permissions?.includes(permission);

    const getLinkStyle = (path) => ({
        width: '85%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
        transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', textDecoration: 'none',
        backgroundColor: location.pathname === path ? '#e0f2ff' : 'transparent',
        color: location.pathname === path ? '#007bff' : '#555',
        fontWeight: location.pathname === path ? 'bold' : 'normal'
    });

    return (
        <aside
            className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
            style={{
                transform: isSidebarOpen ? 'translateX(0)' : (window.innerWidth <= 768 ? 'translateX(-100%)' : 'translateX(0)'),
                position: window.innerWidth <= 768 ? 'fixed' : 'relative',
                transition: 'transform 0.3s ease-in-out',
                width: '250px',
                backgroundColor: '#ffffff',
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 40
            }}
        >
            {/* Header/Agent */}
            <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, #007bff, #6610f2)', color: 'white', borderRadius: '0 0 1rem 0', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div>
                        <Link to="/profile" style={{ textDecoration: 'none', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{user?.userName || 'Agent'}</h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>{user?.orgName || 'Organization'}</p>
                        </Link>
                    </div>
                </div>
                {/* Agent Status */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={handleAgentStatusToggle}
                        style={{
                            display: 'flex', alignItems: 'center', padding: '0.25rem 0.75rem',
                            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            backgroundColor: agentOnlineStatus ? '#28a745' : '#dc3545', color: 'white', border: 'none',
                            cursor: isActionPanelLoading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s ease', marginTop: '10px'
                        }}
                        onMouseOver={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = agentOnlineStatus ? '#218838' : '#c82333'; }}
                        onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title={`Click to go ${agentOnlineStatus ? 'Offline' : 'Online'}`}
                        disabled={isActionPanelLoading}
                    >
                        <span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', marginRight: '0.5rem', backgroundColor: statusColor }}></span>
                        {isActionPanelLoading ? 'Updating...' : statusText}
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="custom-scrollbar" style={{ flexGrow: 1, padding: '1rem' }}>
                {/* SignalR Connection Status */}
                {signalRError && (
                    <div style={{ backgroundColor: '#ffe0e0', border: '1px solid #ffb3b3', color: '#cc0000', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '0.5rem' }} /> {signalRError}
                    </div>
                )}
                {isSignalRConnected && !signalRError && (
                    <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '0.5rem' }} /> Real-time updates active.
                    </div>
                )}

                {/* Main Navigation */}
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faRoute} style={{ marginRight: '0.5rem', color: '#007bff' }} beat />
                            Navigation
                        </span>
                        <button
                            onClick={() => setIsNavigSectionVisible(!isNavigSectionVisible)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '1rem' }}
                            title={isNavigSectionVisible ? "Hide Navigation" : "Show Navigation"}
                        >
                            <FontAwesomeIcon icon={isNavigSectionVisible ? faChevronUp : faChevronDown} />
                        </button>
                    </h3>
                    {isNavigSectionVisible && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {hasPermission('dashboard_view') && (
                                <li>
                                    <Link to="/dashboard" style={getLinkStyle('/dashboard')}
                                        onMouseOver={e => { if (location.pathname !== '/dashboard') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/dashboard') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faLaptop} style={{ marginRight: '0.5rem' }} beat/>
                                        Dashboard
                                    </Link>
                                </li>
                            )}
                            {hasPermission('chat_view') && (
                                <li>
                                    <Link to="/chat" style={getLinkStyle('/chat')}
                                        onMouseOver={e => { if (location.pathname !== '/chat') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/chat') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faComment} style={{ marginRight: '0.5rem' }} beat/>
                                        Chat
                                    </Link>
                                </li>
                            )}
                            {hasPermission('organization_view') && (
                                <li>
                                    <Link to="/organization" style={getLinkStyle('/organization')}
                                        onMouseOver={e => { if (location.pathname !== '/organization') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/organization') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '0.5rem' }} spin/>
                                        Organization
                                    </Link>
                                </li>
                            )}
                            {hasPermission('channel_view') && (
                                <li>
                                    <Link to="/channel" style={getLinkStyle('/channel')}
                                        onMouseOver={e => { if (location.pathname !== '/channel') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/channel') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faSatelliteDish} style={{ marginRight: '0.5rem' }} beat/>
                                        Channel
                                    </Link>
                                </li>
                            )}
                            {hasPermission('assign_chat') && (
                                <li>
                                    <Link to="/assign-chat" style={getLinkStyle('/assign-chat')}
                                        onMouseOver={e => { if (location.pathname !== '/assign-chat') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/assign-chat') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '0.5rem' }} beat/>
                                        Assign Chats
                                    </Link>
                                </li>
                            )} 
                            {hasPermission('userrole_view') && (
                                <li>
                                    <Link to="/user-roles" style={getLinkStyle('/user-roles')}
                                        onMouseOver={e => { if (location.pathname !== '/user-roles') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/user-roles') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faUserTie} style={{ marginRight: '0.5rem' }} beat/>
                                        User Roles
                                    </Link>
                                </li>
                            )}
                            {hasPermission('teams_view') && (
                                <li>
                                    <Link to="/teams" style={getLinkStyle('/teams')}
                                        onMouseOver={e => { if (location.pathname !== '/teams') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/teams') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faPeopleGroup} style={{ marginRight: '0.5rem' }} bounce/>
                                        Teams
                                    </Link>
                                </li>
                            )}
                            {hasPermission('users_view') && (
                                <li>
                                    <Link to="/users" style={getLinkStyle('/users')}
                                        onMouseOver={e => { if (location.pathname !== '/users') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/users') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faUserAstronaut} style={{ marginRight: '0.5rem' }} beat/>
                                        Users
                                    </Link>
                                </li>
                            )}
                            {hasPermission('permissions_view') && (
                                <li>
                                    <Link to="/permission" style={getLinkStyle('/permission')}
                                        onMouseOver={e => { if (location.pathname !== '/permission') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/permission') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faHand} style={{ marginRight: '0.5rem' }} shake/>
                                        Permission
                                    </Link>
                                </li>
                            )}
                            {hasPermission('tags_view') && (
                                <li>
                                    <Link to="/tag" style={getLinkStyle('/tag')}
                                        onMouseOver={e => { if (location.pathname !== '/tag') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (location.pathname !== '/tag') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <FontAwesomeIcon icon={faTag} style={{ marginRight: '0.5rem' }} beat/>
                                        Tags
                                    </Link>
                                </li>
                            )} 
                        </ul>
                    )}
                </div>


                {/* Channel/Group List */}
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faSitemap} style={{ marginRight: '0.5rem', color: '#007bff' }} />
                            Channels
                        </span>
                        <button
                            onClick={() => setIsChannelsSectionVisible(!isChannelsSectionVisible)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '1rem' }}
                            title={isChannelsSectionVisible ? "Hide Channels" : "Show Channels"}
                        >
                            <FontAwesomeIcon icon={isChannelsSectionVisible ? faChevronUp : faChevronDown} />
                        </button>
                    </h3>
                    {isChannelsSectionVisible && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>
                                <button
                                    onClick={() => handleChannelFilterChange('All')}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                        transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                        backgroundColor: selectedChannelId === null ? '#e0f2ff' : 'transparent',
                                        color: selectedChannelId === null ? '#007bff' : '#555',
                                        fontWeight: selectedChannelId === null ? 'bold' : 'normal'
                                    }}
                                    onMouseOver={e => { if (selectedChannelId !== null) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                    onMouseOut={e => { if (selectedChannelId !== null) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    All Channels
                                </button>
                            </li>
                            {channels.map(channel => (
                                <li key={channel.id}>
                                    <button
                                        onClick={() => handleChannelFilterChange(channel.id)}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                            transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                            backgroundColor: selectedChannelId === channel.id ? '#e0f2ff' : 'transparent',
                                            color: selectedChannelId === channel.id ? '#007bff' : '#555',
                                            fontWeight: selectedChannelId === channel.id ? 'bold' : 'normal',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                        onMouseOver={e => { if (selectedChannelId !== channel.id) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                        onMouseOut={e => { if (selectedChannelId !== channel.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <span style={{ marginRight: '0.5rem' }}>
                                            {platformIcons[channel.platform] || <FontAwesomeIcon icon={faCommentDots} style={{color: '#777'}}/>}
                                        </span>
                                        {channel.name} ({channel.platform})
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Status and Counts */}
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333', display: 'flex', alignItems: 'center' }}>
                         <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '0.5rem', color: '#007bff' }} />
                        My Chats
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <button
                                onClick={() => handleStatusFilterChange('All')}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: selectedChatStatusFilter === 'All' ? '#e0f2ff' : 'transparent',
                                    color: selectedChatStatusFilter === 'All' ? '#007bff' : '#555',
                                    fontWeight: selectedChatStatusFilter === 'All' ? 'bold' : 'normal'
                                }}
                                onMouseOver={e => { if (selectedChatStatusFilter !== 'All') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                onMouseOut={e => { if (selectedChatStatusFilter !== 'All') e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span>All</span>
                                <span style={{ backgroundColor: '#cce5ff', color: '#004085', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {agentAssignedChatsCounts.all}
                                </span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleStatusFilterChange('Unassigned')}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: selectedChatStatusFilter === 'Unassigned' ? '#e0f2ff' : 'transparent',
                                    color: selectedChatStatusFilter === 'Unassigned' ? '#007bff' : '#555',
                                    fontWeight: selectedChatStatusFilter === 'Unassigned' ? 'bold' : 'normal'
                                }}
                                onMouseOver={e => { if (selectedChatStatusFilter !== 'Unassigned') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                onMouseOut={e => { if (selectedChatStatusFilter !== 'Unassigned') e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span>Unassigned</span>
                                <span style={{ backgroundColor: '#cce5ff', color: '#004085', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {agentAssignedChatsCounts.unassigned}
                                </span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleStatusFilterChange('Unread')}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: selectedChatStatusFilter === 'Unread' ? '#e0f2ff' : 'transparent',
                                    color: selectedChatStatusFilter === 'Unread' ? '#007bff' : '#555',
                                    fontWeight: selectedChatStatusFilter === 'Unread' ? 'bold' : 'normal'
                                }}
                                onMouseOver={e => { if (selectedChatStatusFilter !== 'Unread') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                onMouseOut={e => { if (selectedChatStatusFilter !== 'Unread') e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span>Unread</span>
                                {/* <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {agentAssignedChatsCounts.unread}
                                </span> */}
                            </button>
                        </li>
                        {['Pending', 'Assigned', 'InProgress', 'Closed'].map(status => (
                            <li key={status}>
                                <button
                                    onClick={() => handleStatusFilterChange(status)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                        transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        backgroundColor: selectedChatStatusFilter === status ? '#e0f2ff' : 'transparent',
                                        color: selectedChatStatusFilter === status ? '#007bff' : '#555',
                                        fontWeight: selectedChatStatusFilter === status ? 'bold' : 'normal'
                                    }}
                                    onMouseOver={e => { if (selectedChatStatusFilter !== status) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                    onMouseOut={e => { if (selectedChatStatusFilter !== status) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <span>{status}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tag List */}
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333', display: 'flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faTag} style={{ marginRight: '0.5rem', color: '#007bff' }} />
                        Tags
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <button
                                onClick={() => handleTagFilterChange('All')}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                    transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: selectedTagIdFilter === null ? '#e0f2ff' : 'transparent',
                                    color: selectedTagIdFilter === null ? '#007bff' : '#555',
                                    fontWeight: selectedTagIdFilter === null ? 'bold' : 'normal'
                                }}
                                onMouseOver={e => { if (selectedTagIdFilter !== null) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                onMouseOut={e => { if (selectedTagIdFilter !== null) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span>All Tags</span>
                            </button>
                        </li>
                        {tagsWithCounts.map(tag => (
                            <li key={tag.id}>
                                <button
                                    onClick={() => handleTagFilterChange(tag.id)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                        transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        backgroundColor: selectedTagIdFilter === tag.id ? '#e0f2ff' : 'transparent',
                                        color: selectedTagIdFilter === tag.id ? '#007bff' : '#555',
                                        fontWeight: selectedTagIdFilter === tag.id ? 'bold' : 'normal'
                                    }}
                                    onMouseOver={e => { if (selectedTagIdFilter !== tag.id) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                    onMouseOut={e => { if (selectedTagIdFilter !== tag.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <span>{tag.name}</span>
                                    <span style={{ backgroundColor: '#e2e2e2', color: '#555', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        {tag.chatList ? tag.chatList.length : 0}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Logout Button */}
            <div style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
                <button
                    onClick={logout}
                    style={{
                        width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        backgroundColor: '#dc3545', color: 'white', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                    <FontAwesomeIcon icon={faPowerOff} style={{ marginRight: '0.5rem' }} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default ChatSideBar;
