"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    firstName?: string;
    lastName?: string;
    type?: string;
    raisonSociale?: string;
    phone?: string;
    allergies?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, isPending: isLoading } = useSession();
    const router = useRouter();

    const login = (userData: User) => {
        // With better-auth, login is handled by the client hooks (signIn)
        // This function is kept for compatibility if needed, but the session 
        // will be automatically updated by useSession()
        router.push('/compte');
    };

    const logout = async () => {
        await signOut();
        router.push('/compte');
    };

    // Transform session data to match our User interface
    const user = session?.user ? {
        ...session.user,
        // Ensure id is treated as string as better-auth does
    } as User : null;

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
