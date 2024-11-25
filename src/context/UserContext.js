import React, { createContext, useState, useContext, useEffect } from 'react';

// Create UserContext
const UserContext = createContext();

// Create UserProvider to wrap app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch user session on app load or page refresh (Again, for cookies)
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUser(null);
      }
    };

    fetchUserSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
