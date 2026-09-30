import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';


export type UserRole = 'OPERATOR' | 'SUPERVISOR' | 'FORENSIC' | 'AUDITOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  badge_id: string;
  role: UserRole;
  department: string;
  public_key_pem?: string;
}

export const MOCK_OFFICERS: Record<string, AuthUser> = {
  'rajesh.sharma': {
    id: 'usr-001',
    username: 'rajesh.sharma',
    full_name: 'Inspector Rajesh Sharma',
    badge_id: 'NCB-DEL-742',
    role: 'OPERATOR',
    department: 'Delhi Zonal Unit, Field Enforcement',
  },
  'priya.patel': {
    id: 'usr-002',
    username: 'priya.patel',
    full_name: 'Dr. Priya Patel',
    badge_id: 'NCB-MUM-108',
    role: 'SUPERVISOR',
    department: 'Mumbai Regional Forensic Lab',
  },
  'vikram.singh': {
    id: 'usr-003',
    username: 'vikram.singh',
    full_name: 'Dr. Vikram Singh',
    badge_id: 'CFSL-CH-554',
    role: 'FORENSIC',
    department: 'Central Forensic Science Laboratory',
  },
  'ananya.deshmukh': {
    id: 'usr-004',
    username: 'ananya.deshmukh',
    full_name: 'Hon. Ananya Deshmukh',
    badge_id: 'JUD-DEL-019',
    role: 'AUDITOR',
    department: 'Special NDPS Court Registry',
  },
  'suresh.kumar': {
    id: 'usr-005',
    username: 'suresh.kumar',
    full_name: 'Suresh Kumar',
    badge_id: 'NCB-HQ-001',
    role: 'ADMIN',
    department: 'National Cyber & Systems Admin',
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password?: string, forceRole?: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

const TOKEN_KEY = 'prm_auth_token';
const USER_KEY  = 'prm_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password?: string, forceRole?: UserRole) => {
    const cleanUsername = username.trim().toLowerCase();
    
    try {
      // Try backend API first
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: password || 'password123' }),
      });

      if (res.ok) {
        const data = await res.json();
        const authUser: AuthUser = {
          id:          data.user.id,
          username:    data.user.username,
          full_name:   data.user.full_name,
          badge_id:    data.user.badge_id,
          role:        (forceRole || data.user.role || 'OPERATOR').toUpperCase() as UserRole,
          department:  data.user.department,
          public_key_pem: data.user.public_key_pem,
        };

        localStorage.setItem(TOKEN_KEY, data.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setToken(data.access_token);
        setUser(authUser);
        return;
      }
    } catch {
      // Network or API connection error -> gracefully use offline officer identity
    }

    // Offline / Mock fallback: Find or construct officer user
    let fallbackOfficer: AuthUser | null = MOCK_OFFICERS[cleanUsername] || null;
    if (!fallbackOfficer) {
      // Check partial match
      const matchedKey = Object.keys(MOCK_OFFICERS).find(k => cleanUsername.includes(k) || k.includes(cleanUsername));
      fallbackOfficer = matchedKey ? MOCK_OFFICERS[matchedKey] : null;
    }

    const assignedRole: UserRole = forceRole || (fallbackOfficer?.role || 'OPERATOR');
    const authUser: AuthUser = fallbackOfficer || {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: cleanUsername || 'officer.field',
      full_name: cleanUsername.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Investigating Officer',
      badge_id: `NCB-${assignedRole.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      role: assignedRole,
      department: assignedRole === 'SUPERVISOR' ? 'Regional Forensic Lab' :
                  assignedRole === 'FORENSIC' ? 'CFSL Chemical Division' :
                  assignedRole === 'AUDITOR' ? 'Judicial Special NDPS Registry' :
                  assignedRole === 'ADMIN' ? 'National Control Bureau Systems' :
                  'Field Enforcement Zonal Unit',
    };

    const mockToken = `pramaniriksh_offline_token_${authUser.id}`;
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(mockToken);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user && !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

