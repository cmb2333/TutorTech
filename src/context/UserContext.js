import React, { createContext, useState, useContext } from 'react';

// Create UserContext
const UserContext = createContext();

// Create UserProvider to wrap app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
