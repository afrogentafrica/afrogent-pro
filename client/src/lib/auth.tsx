import { apiRequest } from './queryClient';
import { jwtDecode } from 'jwt-decode';
import React from 'react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

interface AuthToken {
  id: number;
  email: string;
  role: 'admin' | 'client';
  exp: number;
}

export interface LoginResponse {
  token: string;
  user: UserData;
  message: string;
}

export interface RegisterResponse {
  token: string;
  user: UserData;
  message: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiRequest('POST', '/api/auth/login', { email, password });
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
}

export async function register(userData: { name: string, email: string, password: string, role?: 'admin' | 'client', phoneNumber?: string }): Promise<RegisterResponse> {
  const response = await apiRequest('POST', '/api/auth/register', userData);
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
}

export function logout(): void {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getCurrentUser(): UserData | null {
  const token = getToken();
  
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<AuthToken>(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      logout();
      return null;
    }
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: '' // Name is not stored in token, would need API call to get full profile
    };
  } catch (error) {
    console.error('Failed to decode token', error);
    logout();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user && user.role === 'admin';
}

export function requireAuth(Component: React.ComponentType): React.FC {
  return function ProtectedRoute(props: any) {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
}

export function requireAdmin(Component: React.ComponentType): React.FC {
  return function AdminRoute(props: any) {
    if (!isAuthenticated() || !isAdmin()) {
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
}