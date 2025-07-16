import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllPermissionsApi, createPermissionApi, getPermissionByIdApi, updatePermissionApi, deletePermissionApi } from '../api/permission';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { changeAgentStatusApi } from '../api/user';
import Modal from '../components/Model';
import Sidebar from '../components/Sidebar';

const PermissionPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();
    const [perms, setPerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerm, setEditingPerm] = useState(null); 
    const [permForm, setPermForm] = useState({ name: '', description: '' });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [permToDelete, setPermToDelete] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const canCreatePerm = user?.permissions?.includes('permissions_create');
    const canEditPerm = user?.permissions?.includes('permissions_update');
    const canDeletePerm = user?.permissions?.includes('permissions_delete');


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
    
    const fetchPerms = async () => {
        if (authLoading || !user?.token) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedPerms = await getAllPermissionsApi(user.token);
            setPerms(fetchedPerms);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            setError("Failed to load permissions: " + (err.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerms();
    }, [user, authLoading]); 

    const handleAddPermClick = () => {
        setEditingPerm(null); 
        setPermForm({ name: '', description: ''}); 
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleEditPermClick = async (permId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const permData = await getPermissionByIdApi(permId, user.token);
            if (permData) {
                setEditingPerm(permData);
                setPermForm({
                    name: permData.name,
                    description: permData.description
                });
                setIsModalOpen(true);
            } else {
                setError("Permission not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching permission for edit:", err);
            setFormError("Failed to save permission.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPermForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSavePerm = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!permForm.name.trim()) {
            setFormError("Permission Name is required.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingPerm) {
                await updatePermissionApi({
                    id: editingPerm.id,
                    name: permForm.name,
                    description: permForm.description
                }, user.token);
                alert('Permission updated successfully!');
            } else {
                await createPermissionApi({
                    name: permForm.name,
                    description: permForm.description
                }, user.token);
                alert('Permission created successfully!');
            }
            setIsModalOpen(false); 
            fetchPerms(); 
        } catch (err) {
            console.error("Error saving permission:", err);
            setFormError("Failed to save permission.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (perm) => {
        setPermToDelete(perm);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!permToDelete) return;

        setIsSaving(true); 
        setError(null);
        setShowDeleteConfirm(false); 

        try {
            await deletePermissionApi(permToDelete.id, user.token);
            alert(`Permission "${permToDelete.name}" deleted successfully!`);
            fetchPerms();
        } catch (err) {
            console.error("Error deleting permission:", err);
            setError("Failed to delete permission: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
            setPermToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setPermToDelete(null);
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Permission Management</h2>
                    {canCreatePerm && (
                        <button
                            onClick={handleAddPermClick}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                                border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New Permission
                        </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading permissions...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : perms.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No permissions found. Click "Add New Permission" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '0.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', tableLayout: 'fixed' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '30%' }}>Permission Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '40%' }}>Description</th>
                                        {(canEditPerm || canDeletePerm) && (
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#555', fontSize: '1.095rem', width: '30%' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {perms.map(perm => (
                                        <tr key={perm.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
                                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.06)'}
                                        >
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{perm.name}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{perm.description}</td>
                                            {(canEditPerm || canDeletePerm) && (
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                {canEditPerm && (
                                                    <button
                                                        onClick={() => handleEditPermClick(perm.id)}
                                                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                        title="Edit Permission"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}
                                                {canDeletePerm && (
                                                    <button
                                                        onClick={() => handleDeleteClick(perm)}
                                                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                        title="Delete Permission"
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

            {/* Create/Edit Permission Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPerm ? 'Edit Permission' : 'Add New Permission'}
            >
                <form onSubmit={handleSavePerm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={permForm.name}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter permission name"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={permForm.description}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', resize: 'vertical' }}
                            placeholder="Enter permission description"
                            disabled={isSaving}
                        ></textarea>
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
                        ) : editingPerm ? 'Update Permission' : 'Create Permission'}
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
                    Are you sure you want to delete permission "<strong>{permToDelete?.name}</strong>"? This action cannot be undone.
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

export default PermissionPage;
