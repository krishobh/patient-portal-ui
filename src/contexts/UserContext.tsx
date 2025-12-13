import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserRole {
  name: string;
  code: string;
}

export interface UserSession {
  token: string;
  user_id: number;
  business_date: string;
  user_name: string;
  logo: string;
  organisation: any;
  role: UserRole;
  department_id: number;
  photo?: string;
}

interface UserContextType {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  clearUser: () => void;
  logout: () => void;
  hydrated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Runtime type check for UserSession
function isUserSession(obj: any): obj is UserSession {
  if (!obj) return false;
  if (typeof obj.token !== 'string') console.warn('token failed', obj.token);
  if (typeof obj.user_id !== 'number' && typeof obj.user_id !== 'string') console.warn('user_id failed', obj.user_id);
  if (typeof obj.business_date !== 'string') console.warn('business_date failed', obj.business_date);
  if (typeof obj.user_name !== 'string') console.warn('user_name failed', obj.user_name);
  if (typeof obj.logo !== 'string' && typeof obj.photo !== 'string') console.warn('logo/photo failed', obj.logo, obj.photo);
  if (!obj.role || typeof obj.role.name !== 'string' || typeof obj.role.code !== 'string') console.warn('role failed', obj.role);
  if (typeof obj.department_id !== 'number') console.warn('department_id failed', obj.department_id);
  return (
    typeof obj.token === 'string' &&
    (typeof obj.user_id === 'number' || typeof obj.user_id === 'string') &&
    typeof obj.business_date === 'string' &&
    typeof obj.user_name === 'string' &&
    (typeof obj.logo === 'string' || typeof obj.photo === 'string') &&
    obj.role && typeof obj.role.name === 'string' && typeof obj.role.code === 'string' &&
    typeof obj.department_id === 'number'
  );
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("userSession");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (isUserSession(parsed)) {
          // Normalize user_id to number and logo to string
          setUserState({
            ...parsed,
            user_id: typeof parsed.user_id === 'string' ? parseInt(parsed.user_id, 10) : parsed.user_id,
            logo: parsed.logo || parsed.photo || "",
          });
        } else {
          console.warn("Invalid userSession format in localStorage, clearing...");
          localStorage.removeItem("userSession");
        }
      } catch (e) {
        console.error("Failed to parse userSession from localStorage", e);
        localStorage.removeItem("userSession");
      }
    }
    setHydrated(true);
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("userSession", JSON.stringify(user));
    } else {
      localStorage.removeItem("userSession");
    }
  }, [user]);

  const setUser = (user: UserSession | null) => setUserState(user);
  const clearUser = () => setUser(null);

  // Logout function - clears all stored data
  const logout = () => {
    // Clear all state
    setUserState(null);
    
    // Clear all localStorage items
    localStorage.removeItem("userSession");
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      clearUser, 
      logout,
      hydrated
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


