import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllOrganizationsApi, createOrganizationApi, getOrganizationByIdApi, updateOrganizationApi, deleteOrganizationApi } from '../api/organization';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Model';
import { changeAgentStatusApi } from '../api/auth';
import Sidebar from '../components/Sidebar';

const formatTime = (time24h) => {
    if (!time24h) return '';
    try {
        const [hours, minutes] = time24h.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; 
        return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
        console.error("Error formatting time:", e);
        return time24h; 
    }
};

const OrganizationPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingorganization, setEditingOrganization] = useState(null); 
    const [organizationForm, setOrganizationForm] = useState({ name: '', description: '', maxAgentCount: '', maxChannelCount: '', startHour: '', endHour: '', isActive: true });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [organizationToDelete, setOrganizationToDelete] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const canCreateOrg = user?.permissions?.includes('organization_create');
    const canEditOrg = user?.permissions?.includes('organization_update');
    const canDeleteOrg = user?.permissions?.includes('organization_delete');

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


    const fetchOrganizations = async () => {
        if (authLoading || !user?.token) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedorganizations = await getAllOrganizationsApi(user?.isSuperAdmin ? null : user?.orgId, user.token);
            setOrganizations(fetchedorganizations);
        } catch (err) {
            console.error("Error fetching organizations:", err);
            setError("Failed to load organizations: " + (err.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [user, authLoading]);

    const handleAddOrgClick = () => {
        setEditingOrganization(null); 
        setOrganizationForm({ name: '', description: '', maxAgentCount: '', maxChannelCount: '', startHour: '', endHour: '',  isActive: true }); 
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleEditOrgClick = async (orgId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const orgData = await getOrganizationByIdApi(orgId, user.token);
            if (orgData) {
                setEditingOrganization(orgData);
                setOrganizationForm({
                    name: orgData.name,
                    description: orgData.description,
                    maxAgentCount: orgData.maxAgentCount,
                    maxChannelCount: orgData.maxChannelCount,
                    startHour: orgData.startHour,
                    endHour: orgData.endHour,
                    isActive: orgData.isActive
                });
                setIsModalOpen(true);
            } else {
                setError("Organization not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching organization for edit:", err);
            setError("Failed to load organization data for edit: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setOrganizationForm(prev => {
            let newValue;
            if (type === 'checkbox') {
                newValue = checked;
            } else if (type === 'number') { 
                newValue = parseFloat(value) || 0;
            } else {
                newValue = value;
            }
            return {
                ...prev,
                [name]: newValue
            };
        });
    };

    const handleSaveOrg = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!organizationForm.name.trim()) {
            setFormError("Organization name is required.");
            setIsSaving(false);
            return;
        }

         if (!organizationForm.startHour || !organizationForm.endHour) {
            setFormError("Start Hour and End Hour are required.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingorganization) {
                await updateOrganizationApi({
                    id: editingorganization.id, 
                    name: organizationForm.name,
                    description: organizationForm.description,
                    maxAgentCount: organizationForm.maxAgentCount,
                    maxChannelCount: organizationForm.maxChannelCount,
                    startHour: organizationForm.startHour,
                    endHour: organizationForm.endHour
                }, user.token);
                alert('Organization updated successfully!');
            } else {
                await createOrganizationApi({
                    name: organizationForm.name,
                    description: organizationForm.description,
                    maxAgentCount: organizationForm.maxAgentCount,
                    maxChannelCount: organizationForm.maxChannelCount,
                    startHour: organizationForm.startHour,
                    endHour: organizationForm.endHour
                }, user.token);
                alert('Organization created successfully!');
            }
            setIsModalOpen(false); 
            fetchOrganizations(); 
        } catch (err) {
            console.error("Error saving organization:", err);
            setFormError("Failed to save organization.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (org) => {
        setOrganizationToDelete(org);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!organizationToDelete) return;

        setIsSaving(true);
        setError(null);
        setShowDeleteConfirm(false);

        try {
            await deleteOrganizationApi(organizationToDelete.id, user.token);
            alert(`Organization "${organizationToDelete.name}" deleted successfully!`);
            fetchOrganizations();
        } catch (err) {
            console.error("Error deleting organization:", err);
            setError("Failed to delete organization: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
            setOrganizationToDelete(null); 
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setOrganizationToDelete(null);
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
                    maxWidth: '1400px', 
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Organization Management</h2>
                    {canCreateOrg && (
                        <button
                        onClick={handleAddOrgClick}
                        style={{
                            padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                            border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add New Organization
                    </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading organizations...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No organizations found. Click "Add Organization" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '100%', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Max Agent Count</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Max Channel Count</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Business Hour</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', color: '#555' }}>Status</th>
                                        {(canEditOrg || canDeleteOrg) && (
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #eee', color: '#555' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizations.map(org => (
                                        <tr key={org.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.1s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{org.name}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', maxWidth: '420px' }}>{org.description}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{org.maxAgentCount}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{org.maxChannelCount}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                {`${formatTime(org.startHour)} to ${formatTime(org.endHour)}`}
                                            </td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{
                                                    backgroundColor: org.isActive ? '#d4edda' : '#f8d7da',
                                                    color: org.isActive ? '#155724' : '#721c24',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {org.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {(canEditOrg || canDeleteOrg) && (
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                    {canEditOrg  && (
                                                        <button
                                                            onClick={() => handleEditOrgClick(org.id)}
                                                            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                            title="Edit Organization"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                    )}
                                                    {canDeleteOrg && (
                                                        <button
                                                            onClick={() => handleDeleteClick(org)}
                                                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                            title="Delete Organization"
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

            {/* Create/Edit Organization Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingorganization ? 'Edit Organization' : 'Add New Organization'}
            >
                <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organization Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={organizationForm.name}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter organization name"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={organizationForm.description}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', resize: 'vertical' }}
                            placeholder="Enter organization description"
                            disabled={isSaving}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="maxAgentCount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Agent Count:</label>
                        <input
                            type="number"
                            id="maxAgentCount"
                            name="maxAgentCount"
                            value={organizationForm.maxAgentCount}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter max agent count"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="maxChannelCount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Channel Count:</label>
                        <input
                            type="number"
                            id="maxChannelCount"
                            name="maxChannelCount"
                            value={organizationForm.maxChannelCount}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter max channel count"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="startHour" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start Hour:</label>
                        <input
                            type="time" 
                            id="startHour"
                            name="startHour"
                            value={organizationForm.startHour}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            disabled={isSaving}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="endHour" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>End Hour:</label>
                        <input
                            type="time" 
                            id="endHour"
                            name="endHour"
                            value={organizationForm.endHour}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            disabled={isSaving}
                            required
                        />
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
                        ) : editingorganization ? 'Update Organization' : 'Create Organization'}
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
                    Are you sure you want to delete organization "<strong>{organizationToDelete?.name}</strong>"? This action cannot be undone.
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

export default OrganizationPage;
