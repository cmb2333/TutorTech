import React, { createContext, useState, useContext, useEffect } from 'react';

// Create UserContext
const UserContext = createContext();

// Create UserProvider to wrap app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user session on app load or page refresh (Again, for cookies)
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/session`, {
          method: 'GET',
          credentials: 'include',
        });
  
        // History enabled by default
        if (response.ok) {
          const data = await response.json();
          setUser({
            ...data,
            history_enabled: data.history_enabled ?? true,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
