import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (userId: string) => void;
  createUser: (name: string, email: string) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('careerflow_users');
    const storedCurrentUser = localStorage.getItem('careerflow_current_user');

    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })));
    }

    if (storedCurrentUser) {
      const parsedUser = JSON.parse(storedCurrentUser);
      setCurrentUser({ ...parsedUser, createdAt: new Date(parsedUser.createdAt) });
    } else if (storedUsers && JSON.parse(storedUsers).length > 0) {
      // If no current user but users exist, select the first one
      const firstUser = JSON.parse(storedUsers)[0];
      setCurrentUser({ ...firstUser, createdAt: new Date(firstUser.createdAt) });
    } else {
      // Create default user if no users exist
      const defaultUser: User = {
        id: `user_${Date.now()}`,
        name: 'Demo User',
        email: 'demo@example.com',
        createdAt: new Date(),
      };
      createUserInternal(defaultUser);
      setCurrentUser(defaultUser);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('careerflow_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('careerflow_current_user', JSON.stringify(currentUser));
      // Switch the mock backend data for this user
      switchMockBackendUser(currentUser.id);
    }
  }, [currentUser]);

  const createUserInternal = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const createUser = (name: string, email: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      createdAt: new Date(),
    };
    createUserInternal(newUser);
    return newUser;
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const deleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert('Cannot delete the last user');
      return;
    }

    const newUsers = users.filter(u => u.id !== userId);
    setUsers(newUsers);

    // If deleting current user, switch to another
    if (currentUser?.id === userId) {
      const nextUser = newUsers[0];
      setCurrentUser(nextUser);
    }

    // Clear data for deleted user from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`careerflow_data_${userId}`)) {
        localStorage.removeItem(key);
      }
    });
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, ...updates } : u
    ));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      switchUser,
      createUser,
      deleteUser,
      updateUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Function to switch mock backend data
function switchMockBackendUser(userId: string) {
  // This will be called when user switches
  // The mock backend will need to be updated to use this
  (window as any).__currentUserId = userId;
}
