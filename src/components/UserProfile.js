import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import { getUserByIdApi, updateProfileApi , changeAgentStatusApi } from '../api/user'; 
import { changePasswordAPI } from '../api/auth';
import Sidebar from '../components/Sidebar';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editableUsername, setEditableUsername] = useState('');
    const [editableEmail, setEditableEmail] = useState('');

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [agentOnlineStatus, setAgentOnlineStatus] = useState(user?.isOnline ?? false);
    const [actionPanelError, setActionPanelError] = useState(null);
    const [isActionPanelLoading, setIsActionPanelLoading] = useState(false);

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
    
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.userId || !user?.token) {
                setError("User ID or token not available.");
                setLoading(false);
                return;
            }
            try {
                const data = await getUserByIdApi(user.userId, user.token);
                setUserProfile(data);
                setEditableUsername(data.username);
                setEditableEmail(data.email);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch user data.");
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?.userId, user?.token]);

    const handleUpdateProfile = async () => {
        if (!user?.userId || !user?.token) return;

        const payload = {
            orgId: userProfile.orgId,
            username: editableUsername,
            email: editableEmail,
            id: userProfile.userid,
        };

        try {
            await updateProfileApi(payload, user.token);
            setUserProfile(prev => ({ ...prev, username: editableUsername, email: editableEmail }));
            setIsEditingProfile(false);
            alert("Profile updated successfully!");
        } catch (err) {
            alert(`Error: ${err.message || "Failed to update profile."}`);
        }
    };

    const handleChangePassword = async () => {
        setPasswordMessage('');
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordMessage("All password fields are required.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage("New passwords do not match.");
            return;
        }

        try {
            await changePasswordAPI({
                userId: user.userId,
                oldpassword: oldPassword,
                password: newPassword
            }, user.token);

            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowChangePassword(false);
            setPasswordMessage("Password changed successfully!");
        } catch (err) {
            setPasswordMessage(`Error: ${err.message || "Failed to change password."}`);
        }
    };

    if (loading) return <div style={{ textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div className='error-text'>{error}</div>;
    if (!userProfile) return <div className='error-text'>No user data found.</div>;

    return (
        <div className="container-full-height">
            <Sidebar
            user={user}
            logout={logout}
            agentOnlineStatus={agentOnlineStatus}
            isActionPanelLoading={isActionPanelLoading}
            handleAgentStatusToggle={handleAgentStatusToggle}
            isSidebarOpen={isSidebarOpen}
            />
            <div className='user-profile-container'>
            <div className="user-profile-container">
            <h2 className="user-profile-title">User Profile</h2>

            <div className="user-profile-row">
                <label className="user-profile-label">Username:</label>
                {isEditingProfile ? (
                    <input
                        type="text"
                        value={editableUsername}
                        onChange={(e) => setEditableUsername(e.target.value)}
                        className="user-profile-input"
                    />
                ) : (
                    <span>{userProfile.username}</span>
                )}
                </div>

                <div className="user-profile-row">
                    <label className="user-profile-label">Email:</label>
                    {isEditingProfile ? (
                        <input
                            type="email"
                            value={editableEmail}
                            onChange={(e) => setEditableEmail(e.target.value)}
                            className="user-profile-input"
                        />
                    ) : (
                        <span>{userProfile.email}</span>
                    )}
                </div>

                <div className="user-profile-button-group">
                    {!isEditingProfile ? (
                        <button className="user-profile-button" onClick={() => setIsEditingProfile(true)}>
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button className="user-profile-button save" onClick={handleUpdateProfile}>Save</button>
                            <button className="user-profile-button cancel"
                                onClick={() => {
                                    setEditableUsername(editableUsername);
                                    setEditableEmail(editableEmail);
                                    setIsEditingProfile(false);
                                }}
                            >Cancel</button>
                        </>
                    )}
                </div>
            </div>


            <hr style={{ margin: '30px 0' }} />

            <div>
                <h2 className="user-profile-title">Change Password</h2>
                    <>
                        {showChangePassword && (
                            <div className="user-profile-row">
                                <label className="user-profile-label">Old Password:</label>
                                
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="user-profile-input"
                                />  
                            </div>
                        )}
                        {showChangePassword && (
                            <div className="user-profile-row">
                                <label className="user-profile-label">New Password:</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="user-profile-input"
                                />
                            </div>
                        )}
                        {showChangePassword && (
                            <div className="user-profile-row">
                                <label className="user-profile-label">Confirm New:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="user-profile-input"
                                />
                            </div>
                        )}

                        <div className="user-profile-button-group">
                        {!showChangePassword ? (
                            <button className="user-profile-button" onClick={() => setShowChangePassword(true)}>
                                Change Password
                            </button>
                        ) : (
                            <>
                                <button className="user-profile-button save" onClick={handleChangePassword}>Submit</button>
                                <button className="user-profile-button cancel"
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setOldPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setPasswordMessage('');
                                    }}
                                >Cancel</button>
                            </>
                        )}
                        </div>

                        {passwordMessage && (
                            <div className={passwordMessage.startsWith('Error') ? 'error-text' : 'success-text'}>
                                {passwordMessage}
                            </div>
                        )}
                    </>
            </div>
        </div>
        </div>
        
    );
};

export default UserProfile;
