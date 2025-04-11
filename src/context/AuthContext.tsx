import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { auth as firebaseAuth, db as firestoreDb } from '../firebase/config';

// Type assertions for Firebase instances
const auth: Auth = firebaseAuth;
const db: Firestore = firestoreDb;

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userData: any;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, name: string, dob: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setCurrentUser(user);
      if (user) {
        try {
          console.log('Fetching user data for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('User data found:', userDoc.data());
            setUserData(userDoc.data());
          } else {
            console.log('No user data found');
            setUserData(null);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to fetch user data. Please try again.');
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, name: string, dob: string) => {
    try {
      console.log('Registering user:', email);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('User registered, creating user document');
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        dob,
        createdAt: new Date().toISOString()
      });
      
      console.log('User document created successfully');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Logging in user:', email);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      setError(null);
      await signOut(auth);
      setUserData(null);
      console.log('Logout successful');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
      throw err;
    }
  };

  const signup = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
      });
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    userData,
    loading,
    error,
    register,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 