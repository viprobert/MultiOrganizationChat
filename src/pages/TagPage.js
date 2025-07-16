import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllTagsApi, createTagApi, getTagByIdApi, updateTagApi, deleteTagApi } from '../api/tags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { changeAgentStatusApi } from '../api/user';
import Modal from '../components/Model';
import Sidebar from '../components/Sidebar';

const TagPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState(null); 
    const [tagForm, setTagForm] = useState({ name: '', description: '', isActive: true });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const canCreateTag = user?.permissions?.includes('tags_create');
    const canEditTag = user?.permissions?.includes('tags_update');
    const canDeleteTag = user?.permissions?.includes('tags_delete');

    const handleAgentStatusToggle = async () => {
        if (!user?.userId || !user?.token) return;
        setIsActionPanelLoading(true);
        setActionPanelError(null);
        try {
            const newStatus = !agentOnlineStatus;
            await changeAgentStatusApi(user.userId, newStatus, user.token);
            setAgentOnlineStatus(newStatus);
        } catch (err) {
            setActionPanelError("Failed to change status: " + (err.message || "Unknown error."));
        } finally {
            setIsActionPanelLoading(false);
        }
    };

    const fetchTags = async () => {
        if (authLoading || !user?.token) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedTags = await getAllTagsApi(user.orgId,user.token);
            setTags(fetchedTags);
        } catch (err) {
            console.error("Error fetching tags:", err);
            setError("Failed to load tags: " + (err.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, [user, authLoading]); 

    const handleAddTagClick = () => {
        setEditingTag(null); 
        setTagForm({ name: '', description: '', isActive: true }); 
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleEditTagClick = async (tagId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const tagData = await getTagByIdApi(tagId, user.token);
            if (tagData) {
                setEditingTag(tagData);
                setTagForm({
                    name: tagData.name,
                    description: tagData.description,
                    isActive: tagData.isActive
                });
                setIsModalOpen(true);
            } else {
                setError("Tag not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching tag for edit:", err);
            setFormError("Failed to save tag.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTagForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveTag = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!tagForm.name.trim()) {
            setFormError("Tag Name is required.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingTag) {
                await updateTagApi({
                    id: editingTag.id,
                    orgId: user.orgId, 
                    name: tagForm.name,
                    description: tagForm.description
                }, user.token);
                alert('Tag updated successfully!');
            } else {
                await createTagApi({
                    orgId: user.orgId,
                    name: tagForm.name,
                    description: tagForm.description
                }, user.token);
                alert('Tag created successfully!');
            }
            setIsModalOpen(false); 
            fetchTags(); 
        } catch (err) {
            console.error("Error saving tag:", err);
            setFormError("Failed to save tag.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (tag) => {
        setTagToDelete(tag);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!tagToDelete) return;

        setIsSaving(true); 
        setError(null);
        setShowDeleteConfirm(false); 

        try {
            await deleteTagApi(tagToDelete.id, user.orgId, user.token);
            alert(`Tag "${tagToDelete.name}" deleted successfully!`);
            fetchTags();
        } catch (err) {
            console.error("Error deleting tag:", err);
            setError("Failed to delete tag: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
            setTagToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setTagToDelete(null);
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Tag Management</h2>
                    {canCreateTag && (
                        <button
                            onClick={handleAddTagClick}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                                border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New Tag
                        </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading tags...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : tags.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No tags found. Click "Add New Tag" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '0.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', tableLayout: 'fixed' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '30%'  }}>Tag Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '40%'  }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '15%'  }}>Status</th>
                                        {(canEditTag || canDeleteTag) && (
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#555', fontSize: '1.095rem', width: '15%'  }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tags.map(tag => (
                                        <tr key={tag.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.1s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{tag.name}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{tag.description}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{
                                                    backgroundColor: tag.isActive ? '#d4edda' : '#f8d7da',
                                                    color: tag.isActive ? '#155724' : '#721c24',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {tag.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {(canEditTag || canDeleteTag) && (
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                    {canEditTag && (
                                                        <button
                                                            onClick={() => handleEditTagClick(tag.id)}
                                                            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                            title="Edit Tag"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                    )}
                                                    {canDeleteTag && (
                                                        <button
                                                            onClick={() => handleDeleteClick(tag)}
                                                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                            title="Delete Tag"
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

            {/* Create/Edit Tag Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTag ? 'Edit Tag' : 'Add New Tag'}
            >
                <form onSubmit={handleSaveTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="tagName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tag Name:</label>
                        <input
                            type="text"
                            id="tagName"
                            name="name"
                            value={tagForm.name}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter tag name"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="tagDescription" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                        <textarea
                            id="tagDescription"
                            name="description"
                            value={tagForm.description}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', resize: 'vertical' }}
                            placeholder="Enter tag description"
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
                        ) : editingTag ? 'Update Tag' : 'Create Tag'}
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
                    Are you sure you want to delete tag "<strong>{tagToDelete?.name}</strong>"? This action cannot be undone.
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

export default TagPage;
