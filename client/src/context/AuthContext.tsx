import { auth } from "../firebase/config";
import { createContext, useContext, useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    idToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider =({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setIdToken(user ? await user.getIdToken() : null);
            setIsLoading(false);
        })
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = setInterval(async () => {
            try {
                const token = await user.getIdToken();
                setIdToken(token);
            } catch (error) {
                console.error("Token refresh failed:", error);
            }
        }, 1000 * 60 * 5);
        return () => clearInterval(unsubscribe);
    }, [user]);

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setIdToken(await userCredential.user.getIdToken());
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIdToken(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }
    return (
        <AuthContext.Provider value={{ user, idToken, login, logout, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    )
    
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) { throw new Error("useAuth must be used within an AuthProvider"); }
    return context;
};