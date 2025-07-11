import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../contexts/AuthContext';
import { faPowerOff, faTag, faRoute, faUserPlus, faUserAstronaut,
        faPeopleGroup, faUserTie, faGlobe, faSatelliteDish, faHand, faComment, faLaptop } from '@fortawesome/free-solid-svg-icons'; 
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({
    logout,
    agentOnlineStatus,
    isActionPanelLoading,
    handleAgentStatusToggle,
    isSidebarOpen 
}) => {
    const {user} = useAuth();
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
                borderRadius: '0 1rem 0 0',
                zIndex: 40
            }}
        >
            {/* Header/Agent */}
            <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(to right, #007bff, #6610f2)',
                color: 'white',
                borderRadius: '0 0 1rem 0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',            
                flexDirection: 'column',    
                alignItems: 'center',       
                justifyContent: 'center',   
                textAlign: 'center'         
            }}>
                <div style={{ marginBottom: '10px' }}>
                    <Link to="/profile" style={{ textDecoration: 'none', color: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{user?.userName || 'Agent'}</h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>{user?.orgName || 'Organization'}</p>
                    </Link>
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
                        onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = agentOnlineStatus ? '#28a745' : '#dc3545'; }}
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
                
                {/* Main Navigation */}
                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '1rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faRoute} style={{ marginRight: '0.5rem', color: '#007bff' }} beat />
                            Navigation
                        </span>
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {hasPermission('dashboard_view') && (
                            <li>
                                <Link to="/dashboard" style={getLinkStyle('/dashboard')}
                                    onMouseOver={e => { if (location.pathname !== '/dashboard') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                    onMouseOut={e => { if (location.pathname !== '/dashboard') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <FontAwesomeIcon icon={faLaptop} style={{ marginRight: '0.5rem' }} beat />
                                    Dashboard
                                </Link>
                            </li>
                        )}
                        {user?.isSuperAdmin && hasPermission('superadmin_dashboard_view') && (
                            <li>
                                <Link to="/superadmin_dashboard" style={getLinkStyle('/superadmin_dashboard')}
                                    onMouseOver={e => { if (location.pathname !== '/superadmin_dashboard') e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                                    onMouseOut={e => { if (location.pathname !== '/superadmin_dashboard') e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <FontAwesomeIcon icon={faLaptop} style={{ marginRight: '0.5rem' }} beat />
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
                                    <FontAwesomeIcon icon={faComment} style={{ marginRight: '0.5rem' }} beat />
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
                                    <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '0.5rem' }}  spin/>
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
                                    <FontAwesomeIcon icon={faSatelliteDish} style={{ marginRight: '0.5rem' }} beat />
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
                                    <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '0.5rem' }} beat />
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
                                    <FontAwesomeIcon icon={faPeopleGroup} style={{ marginRight: '0.5rem' }} bounce />
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

export default Sidebar;
