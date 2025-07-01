import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllTeamsApi, createTeamApi, getTeamByIdApi, updateTeamApi, deleteTeamApi } from '../api/teams';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Model';
import { changeAgentStatusApi } from '../api/auth';
import Sidebar from '../components/Sidebar';
import { getAllOrganizationsApi } from '../api/organization';

const TeamsPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null); 
    const [teamForm, setTeamForm] = useState({ name: '', description: '', organizationId: '', organizationName: '', isActive: true });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const [allOrganizations, setAllOrganizations] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(true);

    const canCreateTeam = user?.permissions?.includes('teams_create');
    const canEditTeam = user?.permissions?.includes('teams_update');
    const canDeleteTeam = user?.permissions?.includes('teams_delete');

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

    const fetchTeams = async () => {
        console.log("user token",user?.token);
        if (authLoading || !user?.token) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedTeams = await getAllTeamsApi(user?.isSuperAdmin ? null : user?.orgId, user.token);
            setTeams(fetchedTeams);
        } catch (err) {
            console.error("Error fetching teams:", err);
            setError("Failed to load teams: " + (err.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
            if (authLoading || !user?.token) { 
                return;
            }
            try {
                const [orgs] = await Promise.all([
                    getAllOrganizationsApi(user?.isSuperAdmin ? null : user?.orgId, user.token)
                ]);
    
                setAllOrganizations(orgs);
            } catch (err) {
                console.error("Error fetching  organizations:", err);
            }
            finally{
                setOrganizationsLoading(false);
            }
        };

    useEffect(() => {
        fetchTeams();
        fetchDropdownData();
    }, [user, authLoading]); 

    const handleAddTeamClick = () => {
        setEditingTeam(null); 
        setTeamForm({ name: '', description: '', organizationId: '', organizationName: '',  isActive: true }); 
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleEditTeamClick = async (teamId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const teamData = await getTeamByIdApi(teamId, user.token);
            if (teamData) {
                setEditingTeam(teamData);
                setTeamForm({
                    name: teamData.name,
                    description: teamData.description,
                    organizationId: teamData.organizationId,
                    organizationName: teamData.organizationName,
                    isActive: teamData.isActive
                });
                setIsModalOpen(true);
            } else {
                setError("Team not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching team for edit:", err);
            setError("Failed to load team data for edit.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTeamForm(prev => {
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

    const handleSaveTeam = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!teamForm.name.trim()) {
            setFormError("Team Name is required.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingTeam) {
                await updateTeamApi({
                    id: editingTeam.id,
                    organizationId: editingTeam.organizationId, 
                    name: teamForm.name,
                    description: teamForm.description
                }, user.token);
                alert('Team updated successfully!');
            } else {
                const organizationId = user?.isSuperAdmin ? teamForm.organizationId : user.orgId;
                await createTeamApi({
                    orgId: organizationId,
                    name: teamForm.name,
                    description: teamForm.description
                }, user.token);
                alert('Team created successfully!');
            }
            setIsModalOpen(false); 
            fetchTeams(); 
        } catch (err) {
            console.error("Error saving team:", err);
            setFormError("Failed to save team.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (team) => {
        setTeamToDelete(team);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!teamToDelete) return;

        setIsSaving(true); 
        setError(null);
        setShowDeleteConfirm(false); 

        try {
            await deleteTeamApi(teamToDelete.id, user.token);
            alert(`Team "${teamToDelete.name}" deleted successfully!`);
            fetchTeams();
        } catch (err) {
            console.error("Error deleting team:", err);
            setError("Failed to delete team: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
            setTeamToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setTeamToDelete(null);
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>Team Management</h2>
                    {canCreateTeam && (
                        <button
                            onClick={handleAddTeamClick}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                                border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New Team
                        </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading teams...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No teams found. Click "Add New Team" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '0.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', tableLayout: 'fixed' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '25%' }}>Team Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '25%' }}>Organization</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '40%' }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '15%' }}>Status</th>
                                        {(canEditTeam || canDeleteTeam) && (
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#555', fontSize: '1.095rem', width: '15%' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map(team => (
                                        <tr key={team.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.1s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{team.name}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{team.organizationName}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{team.description}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{
                                                    backgroundColor: team.isActive ? '#d4edda' : '#f8d7da',
                                                    color: team.isActive ? '#155724' : '#721c24',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {team.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {(canEditTeam || canDeleteTeam) && (
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                {canEditTeam && (
                                                    <button
                                                        onClick={() => handleEditTeamClick(team.id)}
                                                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                        title="Edit Team"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}
                                                {canDeleteTeam && (
                                                    <button
                                                        onClick={() => handleDeleteClick(team)}
                                                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                        title="Delete Team"
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

            {/* Create/Edit Team Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTeam ? 'Edit Team' : 'Add New Team'}
            >
                <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!editingTeam && user.isSuperAdmin) && (
                        <div>
                            <label htmlFor="organizationId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organization:</label>
                                <select
                                    id="organizationId" 
                                    name="organizationId" 
                                    value={teamForm.organizationId || ''}
                                    onChange={handleFormChange} 
                                    disabled={isSaving}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }} 
                                    required
                                >
                                <option value="">Select Organization</option>
                                {allOrganizations.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                                </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="teamName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Team Name:</label>
                        <input
                            type="text"
                            id="teamName"
                            name="name"
                            value={teamForm.name}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter team name"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="teamDescription" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                        <textarea
                            id="teamDescription"
                            name="description"
                            value={teamForm.description}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', resize: 'vertical' }}
                            placeholder="Enter team description"
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
                        ) : editingTeam ? 'Update Team' : 'Create Team'}
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
                    Are you sure you want to delete team "<strong>{teamToDelete?.name}</strong>"? This action cannot be undone.
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

export default TeamsPage;
