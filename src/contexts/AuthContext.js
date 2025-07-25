import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, generateTwoFactorSetupApi, verifyTwoFactorSetupApi, disableTwoFactorApi, 
        completeTwoFactorSetupApi, forgetPasswordApi  } from '../api/auth';
import { checkUserApi } from '../api/user';
const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = sessionStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from session storage:", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [twoFactorEnabledForUser, setTwoFactorEnabledForUser] = useState(false);
    const [twoFactorSetupData, setTwoFactorSetupData] = useState(null);
    const [userIdFor2FA, setUserIdFor2FA] = useState(null);

    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState(null);

    const login = useCallback(async (username, password, twoFactorCode = null, recoveryCode = null) => {
        setLoading(true);
        setError(null);
        setTwoFactorSetupData(null);

        try {
            const response = await loginApi(username, password, twoFactorCode, recoveryCode);
            if (response.code === 400){
                setLoading(false);
                setError(response.message);
            }
            if (response.requiresTwoFactor) {
                setRequiresTwoFactor(true);
                setTwoFactorEnabledForUser(response.twoFactorEnabledForUser);
                setUserIdFor2FA(response.userId);

                if (!response.twoFactorEnabledForUser) {
                    setTwoFactorSetupData(response.twoFactorSetupData);
                    setLoading(false);
                    return { success: true, status: '2FA_SETUP_REQUIRED', message: response.message || 'Two-factor authentication setup required.' };
                } else {
                    setLoading(false);
                    return { success: true, status: '2FA_VERIFICATION_REQUIRED', message: response.message || 'Two-factor authentication code required.' };
                }
            } else {
                setLoading(false);
                setError("Login requires 2FA, but an unexpected response was received.");
                return { success: false, status: 'LOGIN_FAILED', message: 'Unexpected login state. Please try again.' };
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred during login.';
            setError(errorMessage);
            setLoading(false);
            return { success: false, status: 'LOGIN_FAILED', message: errorMessage };
        }
    }, []);

    const completeForcedTwoFactorSetup = useCallback(async (code) => {
        setLoading(true);
        setError(null);
        try {
            if (!userIdFor2FA) {
                throw new Error("User ID not available for 2FA setup/verification completion. Cannot proceed.");
            }
            const data = await completeTwoFactorSetupApi(userIdFor2FA, code);
            const userData = {
                userId: data.userId,
                userName: data.userName,
                orgId: data.orgId,
                orgName: data.orgName,
                roleName: data.roleName,
                isOnline: data.isOnline,
                teamId: data.teamId,
                token: data.token,
                permissions: data.permissions,
                isSuperAdmin: data.isSuperAdmin
            };
            setUser(userData);
            sessionStorage.setItem('user', JSON.stringify(userData));

            setRequiresTwoFactor(false);
            setTwoFactorEnabledForUser(false);
            setTwoFactorSetupData(null);
            setUserIdFor2FA(null);

            setLoading(false);
            return { success: true, message: '2FA verification complete. You are now logged in!' };
        } catch (err) {
            console.error("2FA setup/verification API error:", err);
            const errorMessage = err.message || "Failed to complete 2FA setup/verification.";
            setError(errorMessage);
            setLoading(false);
            return { success: false, message: errorMessage };
        }
    }, [userIdFor2FA]);

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem('user');
        setRequiresTwoFactor(false);
        setTwoFactorEnabledForUser(false);
        setTwoFactorSetupData(null);
        setUserIdFor2FA(null);
    }, []);

    const generateTwoFactorSetup = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            //if (!user?.token) throw new Error("Not authenticated.");
            const data = await generateTwoFactorSetupApi(userIdFor2FA);
            setLoading(false);
            return { success: true, data };
        } catch (err) {
            setError(err.message || "Failed to generate 2FA setup data.");
            setLoading(false);
            return { success: false, message: err.message };
        }
    }, [user?.token]);

    const verifyTwoFactorSetup = useCallback(async (code) => {
        setLoading(true);
        setError(null);
        try {
            if (!user?.token) throw new Error("Not authenticated.");
            const data = await verifyTwoFactorSetupApi(user.userId, code, user.token);
            setLoading(false);
            return { success: true, data };
        } catch (err) {
            setError(err.message || "Failed to verify 2FA setup.");
            setLoading(false);
            return { success: false, message: err.message };
        }
    }, [user?.token, user?.userId]);

    const disableTwoFactor = useCallback(async (code) => {
        setLoading(true);
        setError(null);
        try {
            if (!user?.token) throw new Error("Not authenticated.");
            const data = await disableTwoFactorApi(user.userId, code, user.token);
            setLoading(false);
            return { success: true, data };
        } catch (err) {
            setError(err.message || "Failed to disable 2FA.");
            setLoading(false);
            return { success: false, message: err.message };
        }
    }, [user?.token]);

    const checkUserByEmail = useCallback(async (email) => {
        setForgotPasswordLoading(true);
        setForgotPasswordError(null);
        try {
            const response = await checkUserApi(email);
            setForgotPasswordLoading(false);
            return { success: true };
        } catch (err) {
            console.error("Forgot password email check error:", err);
            const errorMessage = err.message || "Failed to process request. Please try again.";
            setForgotPasswordError(errorMessage);
            setForgotPasswordLoading(false);
            return { success: false, message: errorMessage };
        }
    }, []);

    const resetPassword = useCallback(async (email, otp, newPassword) => {
        setForgotPasswordLoading(true);
        setForgotPasswordError(null);
        try {
            const response = await forgetPasswordApi(email, otp, newPassword);
            setForgotPasswordLoading(false);
            return { success: true, message: response.message || "Password has been reset successfully." };
        } catch (err) {
            console.error("Password reset error:", err);
            const errorMessage = err.message || "Failed to reset password. Please check your OTP or try again.";
            setForgotPasswordError(errorMessage);
            setForgotPasswordLoading(false);
            return { success: false, message: errorMessage };
        }
    }, []);

    const contextValue = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        requiresTwoFactor,
        twoFactorEnabledForUser,
        twoFactorSetupData,
        userIdFor2FA,
        completeForcedTwoFactorSetup,
        generateTwoFactorSetup,
        verifyTwoFactorSetup,
        disableTwoFactor,
        checkUserByEmail,         
        resetPassword,            
        forgotPasswordLoading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
