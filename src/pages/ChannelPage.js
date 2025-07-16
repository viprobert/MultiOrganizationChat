import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllChannelsApi, createChannelApi, getChannelByIdApi, updateChannelApi, deleteChannelApi } from '../api/channels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { changeAgentStatusApi } from '../api/user';
import Modal from '../components/Model';
import Sidebar from '../components/Sidebar';

const ChannelPage = () => {
    const { user,logout, loading: authLoading, error: authError } = useAuth();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null); 
    const [channelForm, setChannelForm] = useState({ name: '', platform: '', accessToken:'', webhookSecret: '', otherConfigJson: '', externalChannelId: '', isActive: true });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const canCreateChannel = user?.permissions?.includes('channel_create');
    const canEditChannel = user?.permissions?.includes('channel_update');
    const canDeleteChannel = user?.permissions?.includes('channel_delete');

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

     const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const fetchChannels = async () => {
        if (authLoading || !user?.token) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedChannels = await getAllChannelsApi(user.orgId, user.token);
            setChannels(fetchedChannels);
        } catch (err) {
            console.error("Error fetching channels:", err);
            setError("Failed to load channels: " + (err.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChannels();
    }, [user, authLoading]); 

    const handleAddChannelClick = () => {
        setEditingChannel(null); 
        setChannelForm({ name: '', platform: '', accessToken: '', webhookSecret: '', otherConfigJson: '', externalChannelId: '', isActive: true }); 
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleEditChannelClick = async (channelId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const channelData = await getChannelByIdApi(channelId, user.token);
            if (channelData) {
                setEditingChannel(channelData);
                setChannelForm({
                    name: channelData.name,
                    platform: channelData.platform,
                    accessToken: channelData.accessToken,
                    webhookSecret: channelData.webhookSecret,
                    otherConfigJson: channelData.otherConfigJson,
                    externalChannelId: channelData.externalChannelId,
                    isActive: channelData.isActive
                });
                setIsModalOpen(true);
            } else {
                setError("Channel not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching channel for edit:", err);
            setError("Failed to load channel data for edit.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setChannelForm(prev => {
            let newValue;
            if (type === 'checkbox') {
                newValue = checked;
            }
            else {
                newValue = value;
            }
            return {
                ...prev,
                [name]: newValue
            };
        });
    };

    const handleSaveChannel = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!channelForm.name.trim()) {
            setFormError("Channel Name is required.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingChannel) {
                await updateChannelApi({
                    id: editingChannel.id,
                    orgId: user.orgId, 
                    name: channelForm.name,
                    platform: channelForm.platform,
                    accessToken: channelForm.accessToken,
                    webhookSecret: channelForm.webhookSecret,
                    otherConfigJson: channelForm.otherConfigJson,
                    externalChannelId: channelForm.externalChannelId
                }, user.token);
                alert('Channel updated successfully!');
            } else {
                await createChannelApi({
                    orgId: user.orgId,
                    name: channelForm.name,
                    platform: channelForm.platform,
                    accessToken: channelForm.accessToken,
                    webhookSecret: channelForm.webhookSecret,
                    otherConfigJson: channelForm.otherConfigJson,
                    externalChannelId: channelForm.externalChannelId,
                }, user.token);
                alert('Channel created successfully!');
            }
            setIsModalOpen(false); 
            fetchChannels(); 
        } catch (err) {
            console.error("Error saving channel:", err);
            setFormError("Failed to save channel.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (channel) => {
        setChannelToDelete(channel);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!channelToDelete) return;

        setIsSaving(true); 
        setError(null);
        setShowDeleteConfirm(false); 

        try {
            await deleteChannelApi(channelToDelete.id, user.token);
            alert(`Channel "${channelToDelete.name}" deleted successfully!`);
            fetchChannels();
        } catch (err) {
            console.error("Error deleting channel:", err);
            setError("Failed to delete channel: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
            setChannelToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setChannelToDelete(null);
    };

    if (authLoading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem', color: '#777', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                <p>Loading user authentication...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem', color: '#cc0000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
                <p>Authentication Error: {authError}</p>
                <p>Please try logging in again.</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem', color: '#777', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9f9f9' }}>
                <p>Please log in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container-full-height" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexGrow: 1, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar
            user={user}
            logout={logout}
            agentOnlineStatus={agentOnlineStatus}
            isActionPanelLoading={isActionPanelLoading}
            handleAgentStatusToggle={handleAgentStatusToggle}
            isSidebarOpen={isSidebarOpen}
            />
            <div style={{ 
                    maxWidth: '1200px', 
                    margin: '5rem auto', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '0.75rem', 
                    boxShadow: '0 0px 15px rgba(0,0,0,0.1)', 
                    flex: 1, 
                    marginLeft: 'auto', 
                    marginRight: 'auto',
                    width:  'auto',
                    paddingTop: '20px',
                    paddingBottom: '20px' }}>
                <header style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Channel Management</h2>
                    {canCreateChannel && (
                        <button
                            onClick={handleAddChannelClick}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                                border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New Channel
                        </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading channels...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : channels.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No channels found. Click "Add New Channel" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '100%', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Platform</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>AccessToken</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Webhook</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Other Config</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Channel/GroupId</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Status</th>
                                        {(canEditChannel || canDeleteChannel) && (
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', color: '#555' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {channels.map(channel => (
                                        <tr key={channel.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.1s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{channel.name}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{channel.platform}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{truncateText(channel.accessToken, 15)}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{truncateText(channel.webhookSecret, 15)}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{truncateText(channel.otherConfigJson, 15)}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{truncateText(channel.externalChannelId,20)}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{
                                                    backgroundColor: channel.isActive ? '#d4edda' : '#f8d7da',
                                                    color: channel.isActive ? '#155724' : '#721c24',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {channel.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {(canEditChannel || canDeleteChannel) && (
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                {canEditChannel && (
                                                    <button
                                                        onClick={() => handleEditChannelClick(channel.id)}
                                                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                        title="Edit Channel"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}
                                                {canDeleteChannel && (
                                                    <button
                                                        onClick={() => handleDeleteClick(channel)}
                                                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                        title="Delete Channel"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </button>
                                                )}
                                            </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Channel Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingChannel ? 'Edit Channel' : 'Add New Channel'}
            >
                <form onSubmit={handleSaveChannel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="channelName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Channel Name:</label>
                        <input
                            type="text"
                            id="channelName"
                            name="name"
                            value={channelForm.name}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter Channel Name"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="channelPlatform" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Platform:</label>
                        <input
                            type="text"
                            id="channelPlatform"
                            name="platform"
                            value={channelForm.platform}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter Platform - LINE/TELEGRAM/MESSENGER/WHATSAPP"
                            disabled={isSaving}
                        ></input>
                    </div>
                    <div>
                        <label htmlFor="accessToken" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Access Token:</label>
                        <input
                            type="text"
                            id="accessToken"
                            name="accessToken"
                            value={channelForm.accessToken}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter Access Token/Secret Token"
                            disabled={isSaving}
                        ></input>
                    </div>
                    <div>
                        <label htmlFor="webhookSecret" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Webhook:</label>
                        <input
                            type="text"
                            id="webhookSecret"
                            name="webhookSecret"
                            value={channelForm.webhookSecret}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter webhook secret"
                            disabled={isSaving}
                        ></input>
                    </div>
                    <div>
                        <label htmlFor="otherConfigJson" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Other Config:</label>
                        <input
                            type="text"
                            id="otherConfigJson"
                            name="otherConfigJson"
                            value={channelForm.otherConfigJson}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter Other Configs"
                            disabled={isSaving}
                        ></input>
                    </div>
                    <div>
                        <label htmlFor="externalChannelId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Group/Channel Id:</label>
                        <input
                            type="text"
                            id="externalChannelId"
                            name="externalChannelId"
                            value={channelForm.externalChannelId}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter external group/channel Id"
                            disabled={isSaving}
                        ></input>
                    </div>

                    {formError && (
                        <div style={{ color: '#cc0000', backgroundColor: '#ffe0e0', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ffb3b3' }}>
                            {formError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white',
                            border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                        onMouseOver={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#218838'; }}
                        onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#28a745'; }}
                    >
                        {isSaving ? (
                            <> <FontAwesomeIcon icon={faSpinner} spin /> Saving... </>
                        ) : editingChannel ? 'Update Channel' : 'Create Channel'}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={handleDeleteCancel}
                title="Confirm Delete"
            >
                <p style={{ marginBottom: '1.5rem' }}>
                    Are you sure you want to delete channel "<strong>{channelToDelete?.name}</strong>"? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={handleDeleteCancel}
                        disabled={isSaving}
                        style={{
                            padding: '0.75rem 1.5rem', backgroundColor: '#6c757d', color: 'white',
                            border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#5a6268'; }}
                        onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#6c757d'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={isSaving}
                        style={{
                            padding: '0.75rem 1.5rem', backgroundColor: '#dc3545', color: 'white',
                            border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                        }}
                        onMouseOver={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#c82333'; }}
                        onMouseOut={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#dc3545'; }}
                    >
                        {isSaving ? (
                            <> <FontAwesomeIcon icon={faSpinner} spin /> Deleting... </>
                        ) : 'Delete'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ChannelPage;
