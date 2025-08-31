import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
	email: string;
	role: string;
	token: string;
	[key: string]: any;
}

interface AuthContextType {
	user: User | null;
	login: (user: User) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		const email = localStorage.getItem("email");
		if (token && role && email) {
			setUser({ token, role, email });
		}
	}, []);

	const login = (userData: User) => {
		setUser(userData);
		localStorage.setItem("token", userData.token);
		localStorage.setItem("role", userData.role);
		localStorage.setItem("email", userData.email);
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("email");
	};

	return (
		React.createElement(AuthContext.Provider, { value: { user, login, logout } }, children)
	);
};

export default AuthProvider;
