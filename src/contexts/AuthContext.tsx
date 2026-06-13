import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'https://eduspace-portal-backend.onrender.com';

interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  isEmailVerified: boolean;
  role: string;
  schoolId?: string;
  schoolName?: string;
  created_at?: string;
  // Parent-specific fields
  parentName?: string;
  parentPhone?: string;
  preferredContact?: string;
  childId?: string;
  childName?: string;
  childExamNumber?: string;
  childClass?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  // UPDATE THIS - single signIn that handles all login types
  signIn: (identifier: string, password: string, loginType?: 'email' | 'phone', schoolId?: string) => Promise<{ error: Error | null }>;
  // REMOVE parentSignIn - we don't need it anymore
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED signIn function that handles all login types
  const signIn = async (identifier: string, password: string, loginType?: 'email' | 'phone', schoolId?: string) => {
    try {
      let response;
      let endpoint = '';
      let body: any = {};

      // If loginType is provided, use it directly
      if (loginType === 'phone') {
        // Phone login (parent)
        endpoint = `${API_URL}/auth/parent-login`;
        body = { phone: identifier, password };
        if (schoolId) body = { ...body, schoolId };
      } else if (loginType === 'email') {
        // Email login - try regular first, then teacher
        // We'll handle this in a separate flow
        endpoint = `${API_URL}/auth/login`;
        body = { email: identifier, password };
        if (schoolId) body = { ...body, schoolId };
      } else {
        // No loginType provided - try to detect
        const isEmailInput = identifier.includes('@') && identifier.includes('.');

        if (isEmailInput) {
          // It's an email - try regular login first
          endpoint = `${API_URL}/auth/login`;
          body = { email: identifier, password };
          if (schoolId) body = { ...body, schoolId };
        } else {
          // It's a phone number - try parent login
          endpoint = `${API_URL}/auth/parent-login`;
          body = { phone: identifier, password };
          if (schoolId) body = { ...body, schoolId };
        }
      }

      // Make the first attempt
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // If successful, process the response
      if (response.ok) {
        const data = await response.json();
        console.log('Login response:', data);

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Set role in localStorage based on response
        if (data.user?.role) {
          localStorage.setItem('userRole', data.user.role);
        }

        setToken(data.access_token);
        setUser(data.user);

        return { error: null };
      }

      // If first attempt failed and it was email login, try teacher login
      if (endpoint === `${API_URL}/auth/login`) {
        console.log('Regular login failed, trying teacher login...');
        const teacherBody: any = { email: identifier, password };
        if (schoolId) teacherBody.schoolId = schoolId;

        const teacherResponse = await fetch(`${API_URL}/auth/teachers/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teacherBody),
        });

        if (teacherResponse.ok) {
          const data = await teacherResponse.json();
          console.log('Teacher login response:', data);

          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', data.user?.role || 'teacher');
          setToken(data.access_token);
          setUser(data.user);

          return { error: null };
        }

        // Both logins failed
        const errorData = await teacherResponse.json();
        return {
          error: {
            message: errorData.message || 'Invalid credentials',
          } as Error,
        };
      }

      // If it was phone login and it failed
      const errorData = await response.json();
      return {
        error: {
          message: errorData.message || 'Invalid phone number or password',
        } as Error,
      };

    } catch (error: any) {
      console.error('Login error:', error);
      return {
        error: {
          message: error.message || 'Login failed. Please try again.',
        } as Error,
      };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: {
            message: errorData.message || 'Registration failed. Please try again.',
          } as Error,
        };
      }

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: 'Registration failed. Please try again.',
        } as Error,
      };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: {
            message: errorData.message || 'Failed to send reset email.',
          } as Error,
        };
      }

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: 'Failed to send reset email.',
        } as Error,
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    signIn,  // This now handles all login types
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
