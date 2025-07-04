import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsersApi, createUserApi, getUserByIdApi, updateUserApi, deleteUserApi} from '../api/user';
import { getAllTeamsApi } from '../api/teams';
import { getAllUserRolesApi } from '../api/userrole';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Model';
import { getAllOrganizationsApi } from '../api/organization';
import { changeAgentStatusApi } from '../api/auth';
import Sidebar from '../components/Sidebar';


const UserPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 
    const [userForm, setUserForm] = useState({ username: '', orgId: '', email: '',organizationId: '', userRoleId: '', userRoleName: '', teamId: '', teamName: '', isActive: true });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [allAvailableTeams, setAllAvailableTeams] = useState([]);
    const [allAvailableRoles, setAllAvailableRoles] = useState([]);

    const [allTeamsAcrossOrgs, setAllTeamsAcrossOrgs] = useState([]);
    const [allRolesAcrossOrgs, setAllRolesAcrossOrgs] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const [allOrganizations, setAllOrganizations] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(true);
    const [organizationsError, setOrganizationsError] = useState(null);

    const canCreateUser = user?.permissions?.includes('users_create');
    const canEditUser = user?.permissions?.includes('users_update');
    const canDeleteUser = user?.permissions?.includes('users_view');

    const handleAgentStatusToggle = async () => {
        if (!user?.userId) return;
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
    
    const fetchUsers = async () => {
        if (authLoading || !user?.token) { 
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const fetchedUsers = await getAllUsersApi(user?.isSuperAdmin ? null : user?.orgId, user.token);
            setUsers(fetchedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users: " + (err.message || err.response?.data?.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        if (authLoading || !user?.token) { 
            return;
        }
        setOrganizationsLoading(true); 
        setOrganizationsError(null)
        try {
            let teams = [];
            let roles = [];
            let orgs = [];
            
            if (user?.isSuperAdmin) {
                orgs = await getAllOrganizationsApi(user?.isSuperAdmin ? null : user?.orgId, user.token);
                setAllOrganizations(orgs);
                setOrganizationsLoading(false);

                [teams, roles] = await Promise.all([
                    getAllTeamsApi(null, user.token), 
                    getAllUserRolesApi(null, user.token) 
                ]);
                setAllTeamsAcrossOrgs(teams); 
                setAllRolesAcrossOrgs(roles); 
            } else {
                [teams, roles] = await Promise.all([
                    getAllTeamsApi(user.orgId, user.token),
                    getAllUserRolesApi(user.orgId, user.token)
                ]);
                setAllAvailableTeams(teams); 
                setAllAvailableRoles(roles);
                setFilteredTeams(teams); 
                setFilteredRoles(roles); 

                setUserForm(prev => ({
                    ...prev,
                    organizationId: user.orgId || ''
                }));
            }
        } catch (err) {
            console.error("Error fetching teams or roles:", err);
            setOrganizationsError("Failed to load dropdown data: " + (err.message || "Unknown error."));
            setOrganizationsLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdownData();
        fetchUsers();
    }, [user, authLoading]); 

    useEffect(() => {
        if (user?.isSuperAdmin && userForm.organizationId) {
            setFilteredTeams(allTeamsAcrossOrgs.filter(team => team.organizationId === userForm.organizationId));
            setFilteredRoles(allRolesAcrossOrgs.filter(role => role.organizationId === userForm.organizationId));
        } else if (!user?.isSuperAdmin) {
            setFilteredTeams(allAvailableTeams);
            setFilteredRoles(allAvailableRoles);
        } 
        else {
            setFilteredTeams([]);
            setFilteredRoles([]);
        }
        if (userForm.teamId && !filteredTeams.some(t => t.id === userForm.teamId)) {
            setUserForm(prev => ({ ...prev, teamId: '' }));
        }
        if (userForm.userRoleId && !filteredRoles.some(r => r.id === userForm.userRoleId)) {
            setUserForm(prev => ({ ...prev, userRoleId: '' }));
        }

    }, [userForm.organizationId, allTeamsAcrossOrgs, allRolesAcrossOrgs, user?.isSuperAdmin]);

    const handleAddUserClick = () => {
        setEditingUser(null); 
        setUserForm({ 
            username: '', orgId: '', email: '',
            organizationId: user?.isSuperAdmin ? '' : (user?.orgId || ''),
            userRoleId: '', userRoleName: '', teamId: '', teamName: '', isActive: true }); 
        setFormError(null);
        setIsModalOpen(true);
        if (user?.isSuperAdmin) {
            setFilteredTeams([]);
            setFilteredRoles([]);
        }
    };

    const handleEditUserClick = async (userId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const userData = await getUserByIdApi(userId, user.token);
            if (userData) {
                setEditingUser(userData);

                const userOrgId = userData.tenantId || '';

                 if (userOrgId && user?.isSuperAdmin) {
                    setFilteredTeams(allTeamsAcrossOrgs.filter(team => team.organizationId === userOrgId));
                    setFilteredRoles(allRolesAcrossOrgs.filter(role => role.organizationId === userOrgId));
                } else if (!user?.isSuperAdmin) {
                    setFilteredTeams(allAvailableTeams);
                    setFilteredRoles(allAvailableRoles);
                } else {
                    setFilteredTeams([]);
                    setFilteredRoles([]);
                }

                setUserForm({
                    username: userData.username,
                    email: userData.email,
                    userRoleId: userData.userRoleId || '',
                    userRoleName: userData.userRoleName || '',
                    teamId: userData.teamId || '', 
                    teamName: userData.teamName || '',      
                    isActive: userData.isActive
                });
                setIsModalOpen(true);
            } else {
                setError("User not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching user for edit:", err);
            setFormError("Failed to load user data for edit."); 
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserForm(prev => {
            let newValue;

            if (type === 'checkbox') {
                newValue = checked;
            } else {
                newValue = value;
            }
            if (name === 'organizationId') {
                return {
                    ...prev,
                    [name]: newValue,
                    teamId: '',
                    userRoleId: ''
                };
            }
            return {
                ...prev,
                [name]: newValue
            };
        });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!editingUser && user?.isSuperAdmin && !userForm.organizationId) {
            setFormError("Please select an Organization.");
            setIsSaving(false);
            return;
        }

        if (!userForm.username.trim() || !userForm.email.trim()) { 
            setFormError("Username and Email are required.");
            setIsSaving(false);
            return;
        }
        
        if (!editingUser && !userForm.password.trim()) {
            setFormError("Password is required for new users.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingUser) {
                const updatePayload = {
                    id: editingUser.id,
                    orgId: editingUser.orgId, 
                    username: userForm.username,
                    email: userForm.email,
                    userRoleId: userForm.userRoleId || null, 
                    teamId: userForm.teamId || null,         
                    isActive: userForm.isActive
                };
                await updateUserApi(updatePayload, user.token);
                alert('User updated successfully!');
            } else {
                const organizationId = user?.isSuperAdmin ? userForm.organizationId : user.orgId;
                const createPayload = {
                    orgId: organizationId, 
                    username: userForm.username,
                    password: userForm.password,
                    email: userForm.email,
                    userRoleId: userForm.userRoleId || null, 
                    teamId: userForm.teamId || null,        
                };
                await createUserApi(createPayload, user.token);
                alert('User created successfully!');
            }
            setIsModalOpen(false); 
            fetchUsers(); 
        } catch (err) {
            console.error("Error saving user:", err);
            setFormError(err.response?.data?.message || "Failed to save user."); 
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete || !user?.token) return;

        setIsSaving(true); 
        setError(null);
        setShowDeleteConfirm(false); 

        try {
            await deleteUserApi(userToDelete.id, user.token);
            alert(`User "${userToDelete.username}" deleted successfully!`); 
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user"); 
        } finally {
            setIsSaving(false);
            setUserToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>User Management</h2>
                    {canCreateUser && (
                        <button
                            onClick={handleAddUserClick}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                                border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New User
                        </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading users...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No Users found. Click "Add New User" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '0.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', tableLayout: 'fixed' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '25%' }}>UserName</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '25%' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '20%' }}>Role</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '20%' }}>Team</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '10%' }}>Status</th>
                                        {(canEditUser || canDeleteUser) && (
                                            <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '10%' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(usr => (
                                        <tr key={usr.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.1s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{usr.username}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{usr.email}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{usr.userRoleName ? usr.userRoleName : 'N/A'}</td> 
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{usr.teamName ? usr.teamName : 'N/A'}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{
                                                    backgroundColor: usr.isActive ? '#d4edda' : '#f8d7da',
                                                    color: usr.isActive ? '#155724' : '#721c24',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {usr.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {(canEditUser || canDeleteUser) && (
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                    {canEditUser && (
                                                        <button
                                                            onClick={() => handleEditUserClick(usr.id)}
                                                            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                            title="Edit User"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                    )}
                                                    {canDeleteUser && (
                                                        <button
                                                            onClick={() => handleDeleteClick(usr)}
                                                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                            title="Delete User"
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Add New User'}
            >
                <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(!editingUser && user.isSuperAdmin) && (
                        <div>
                            <label htmlFor="organizationId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organization:</label>
                                <select
                                    id="organizationId" 
                                    name="organizationId" 
                                    value={userForm.organizationId || ''}
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
                        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={userForm.username}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter username"
                            disabled={isSaving}
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={userForm.email}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter Email"
                            disabled={isSaving}
                            required 
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password:</label>
                            <input
                                type='password'
                                id="password"
                                name="password"
                                value={userForm.password}
                                onChange={handleFormChange}
                                style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                                placeholder="Enter Password"
                                disabled={isSaving}
                                required 
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="teamId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Team:</label>
                        <select
                            id="teamId" 
                            name="teamId" 
                            value={userForm.teamId || ''}
                            onChange={handleFormChange} 
                            disabled={isSaving}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }} 
                        >
                            <option value="">Select Team</option>
                            {filteredTeams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option> 
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="userRoleId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role:</label> 
                        <select
                            id="userRoleId" 
                            name="userRoleId" 
                            value={userForm.userRoleId || ''}
                            onChange={handleFormChange} 
                            disabled={isSaving}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                        >
                            <option value="">Select Role</option>
                            {filteredRoles.map(role => (
                                <option key={role.id} value={role.id}>{role.roleName}</option> 
                            ))}
                        </select>
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
                        ) : editingUser ? 'Update User' : 'Create User'}
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={showDeleteConfirm}
                onClose={handleDeleteCancel}
                title="Confirm Delete"
            >
                <p style={{ marginBottom: '1.5rem' }}>
                    Are you sure you want to delete user "<strong>{userToDelete?.username}</strong>"? This action cannot be undone.
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

export default UserPage;
