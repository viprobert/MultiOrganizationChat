import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUserRolesApi, createUserRoleApi, getUserRoleByIdApi, updateUserRoleApi, deleteUserRoleApi } from '../api/userrole';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Model';
import { changeAgentStatusApi } from '../api/auth';
import Sidebar from '../components/Sidebar';
import { getPermissionToAssignApi } from '../api/permission';
import { getAllOrganizationsApi } from '../api/organization';

const UserRolesPage = () => {
    const { user, logout, loading: authLoading, error: authError } = useAuth();
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null); 
    const [roleForm, setRoleForm] = useState({ roleName: '', organizationId: '', organizationName: '', description: '', isActive: true, selectedPermissionIds: [] });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const [allPermissions, setAllPermissions] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [permissionsError, setPermissionsError] = useState(null);

    const [allOrganizations, setAllOrganizations] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(true);
    const [organizationsError, setOrganizationsError] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

    const canCreateRole = user?.permissions?.includes('userrole_create');
    const canEditRole = user?.permissions?.includes('userrole_update');
    const canDeleteRole = user?.permissions?.includes('userrole_delete');

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

    const fetchUserRoles = async () => {
        if (authLoading || !user?.token) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedRoles = await getAllUserRolesApi(user?.isSuperAdmin ? null : user?.orgId, user.token);
            setUserRoles(fetchedRoles);
        } catch (err) {
            console.error("Error fetching user roles:", err);
            setError("Failed to load user roles: " + (err.message || "Unknown error."));
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        if (authLoading || !user?.token) { 
            return;
        }
        try {
            const [perms, orgs] = await Promise.all([
                getPermissionToAssignApi(user.token),
                getAllOrganizationsApi(user?.isSuperAdmin ? null : user?.orgId, user.token)
            ]);

            setAllPermissions(perms);
            setAllOrganizations(orgs);
        } catch (err) {
            console.error("Error fetching permissions or organizations:", err);
        }
        finally{
            setPermissionsLoading(false);
            setOrganizationsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserRoles();
        fetchDropdownData();
    }, [user, authLoading]);

    const handleAddRoleClick = () => {
        setEditingRole(null); 
        setRoleForm({ roleName: '', description: '', organizationId: '', organizationName: '', isActive: true, selectedPermissionIds: [] }); 
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleEditRoleClick = async (roleId) => {
        setFormError(null);
        setIsSaving(true); 
        try {
            const roleData = await getUserRoleByIdApi(roleId, user.token);
            if (roleData) {
                setEditingRole(roleData);
                const currentPermissionIds = roleData.permissions ? roleData.permissions.map(p => p.id) : [];
                setRoleForm({
                    roleName: roleData.roleName,
                    organizationId: roleData.organizationId,
                    organizationName: roleData.organizationName,
                    description: roleData.description,
                    isActive: roleData.isActive,
                    selectedPermissionIds: roleData.selectedPermissionIds
                });
                setIsModalOpen(true);
            } else {
                setError("User Role not found for editing.");
            }
        } catch (err) {
            console.error("Error fetching user role for edit:", err);
            setFormError("Failed to save user role.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRoleForm(prev => {
            let newValue;
            console.log("select value", e);
            console.log("type", type);
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

     const handlePermissionChange = (permissionId, isChecked) => {
        setRoleForm(prev => {
            const newPermissionIds = isChecked
                ? [...prev.selectedPermissionIds, permissionId]
                : prev.selectedPermissionIds.filter(id => id !== permissionId);
            return {
                ...prev,
                selectedPermissionIds: newPermissionIds
            };
        });
    };

    const handleSaveRole = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);

        if (!roleForm.roleName.trim()) {
            setFormError("Role Name is required.");
            setIsSaving(false);
            return;
        }

        if (roleForm.selectedPermissionIds.length === 0) {
            setFormError("At least one permission must be selected.");
            setIsSaving(false);
            return;
        }

        try {
            if (editingRole) {
                await updateUserRoleApi({
                    id: editingRole.id,
                    orgId: editingRole.organizationId, 
                    roleName: roleForm.roleName,
                    description: roleForm.description,
                    permissionId: roleForm.selectedPermissionIds   
                }, user.token);
                alert('User Role updated successfully!');
            } else {
                const organizationId = user?.isSuperAdmin ? roleForm.organizationId : user.orgId;
                await createUserRoleApi({
                    orgId: organizationId,
                    roleName: roleForm.roleName,
                    description: roleForm.description,
                    permissionId: roleForm.selectedPermissionIds
                }, user.token);
                alert('User Role created successfully!');
            }
            setIsModalOpen(false); 
            fetchUserRoles(); 
        } catch (err) {
            console.error("Error saving user role:", err);
            setFormError("Failed to save user role.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        setIsSaving(true);
        setError(null);
        setShowDeleteConfirm(false);

        try {
            await deleteUserRoleApi(roleToDelete.id, user.token);
            alert(`User Role "${roleToDelete.roleName}" deleted successfully!`);
            fetchUserRoles();
        } catch (err) {
            console.error("Error deleting user role:", err);
            setError("Failed to delete user role: " + (err.message || "Unknown error."));
        } finally {
            setIsSaving(false);
            setRoleToDelete(null); 
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setRoleToDelete(null);
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
        <div className="container-full-height"  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexGrow: 1, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
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
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333', margin: 0 }}>User Role Management</h2>
                    {canCreateRole && (
                        <button
                            onClick={handleAddRoleClick}
                            style={{
                                padding: '0.75rem 1.25rem', backgroundColor: '#007bff', color: 'white',
                                border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'background-color 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            <FontAwesomeIcon icon={faPlus} /> Add New Role
                        </button>
                    )}
                </header>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2rem', color: '#007bff' }} />
                            <p style={{ marginLeft: '1rem', color: '#555' }}>Loading user roles...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', color: '#cc0000', padding: '2rem', border: '1px solid #ffb3b3', borderRadius: '0.5rem', backgroundColor: '#ffe0e0' }}>
                            <p>Error: {error}</p>
                        </div>
                    ) : userRoles.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
                            <p>No user roles found. Click "Add New Role" to get started!</p>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '0.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', tableLayout: 'fixed' }}>
                                <thead style={{ backgroundColor: '#f7f7f7' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '25%' }}>Role Name</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '30%' }}>Organization</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '30%' }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: '#555', fontSize: '1.095rem', width: '15%' }}>Status</th>
                                        {(canEditRole || canDeleteRole) && (
                                            <th style={{ padding: '1rem', textAlign: 'center', color: '#555', fontSize: '1.095rem', width: '15%' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {userRoles.map(role => (
                                        <tr key={role.id} style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'transform 0.1s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}>{role.roleName}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{role.organizationName}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{role.description}</td>
                                            <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{
                                                    backgroundColor: role.isActive ? '#d4edda' : '#f8d7da',
                                                    color: role.isActive ? '#155724' : '#721c24',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {role.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {(canEditRole || canDeleteRole) && (    
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #eee', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', textAlign: 'center' }}>
                                                    {canEditRole && (
                                                        <button
                                                            onClick={() => handleEditRoleClick(role.id)}
                                                            style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '0.75rem', fontSize: '1.1rem' }}
                                                            title="Edit Role"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                    )}
                                                    {canDeleteRole && (
                                                        <button
                                                            onClick={() => handleDeleteClick(role)}
                                                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}
                                                            title="Delete Role"
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

            {/* Create/Edit User Role Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRole ? 'Edit User Role' : 'Add New User Role'}
            >
                <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(!editingRole && user.isSuperAdmin) && (
                    <div>
                        <label htmlFor="organizationId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organization:</label>
                            <select
                                id="organizationId" 
                                name="organizationId" 
                                value={roleForm.organizationId || ''}
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
                        <label htmlFor="roleName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role Name:</label>
                        <input
                            type="text"
                            id="roleName"
                            name="roleName"
                            value={roleForm.roleName}
                            onChange={handleFormChange}
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                            placeholder="Enter role name"
                            disabled={isSaving}
                        />
                    </div>
                    <div>
                        <label htmlFor="roleDescription" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description:</label>
                        <textarea
                            id="roleDescription"
                            name="description"
                            value={roleForm.description}
                            onChange={handleFormChange}
                            rows="3"
                            style={{ width: '95%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem', resize: 'vertical' }}
                            placeholder="Enter role description"
                            disabled={isSaving}
                        ></textarea>
                    </div>

                     <div style={{ border: '1px solid #eee', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f9f9f9' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Assign Permissions:</h3>
                        {permissionsLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555' }}>
                                <FontAwesomeIcon icon={faSpinner} spin /> Loading Permissions...
                            </div>
                        ) : permissionsError ? (
                            <div style={{ color: '#cc0000', fontSize: '0.875rem' }}>{permissionsError}</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                {allPermissions.map(permission => (
                                    <label key={permission.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            value={permission.id}
                                            checked={roleForm?.selectedPermissionIds?.includes(permission.id) ?? false}
                                            onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                            disabled={isSaving}
                                            style={{ transform: 'scale(1.2)' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', color: '#444' }}>{permission.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
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
                        ) : editingRole ? 'Update Role' : 'Create Role'}
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
                    Are you sure you want to delete user role "<strong>{roleToDelete?.roleName}</strong>"? This action cannot be undone.
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

export default UserRolesPage;
