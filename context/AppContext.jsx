/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
"use client";

import { useState, createContext, useContext, useEffect } from 'react';
import { useAuth, useUser } from "@clerk/nextjs";
import axios from 'axios';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);

  const createNewChat = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.post('/api/chat/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    console.log("Created new chat?");

      return data.success;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  };

  const fetchUsersChats = async () => {
    try {
      if (!user) return;
      setLoadingChats(true);

      const token = await getToken();

      const { data } = await axios.get('/api/chat/get', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        const fetchedChats = data.data;
        console.log("Fetched chats:", fetchedChats);
        console.log("Selected chat:", fetchedChats[0]);


        if (fetchedChats.length === 0) {
        const created = await createNewChat();
        if (!created) {
          toast.error("Failed to create chat.");
          return;
        }
        // Fetch again after creation
        await fetchUsersChats();
        return;
      }



        // Sort and set
        fetchedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setChats(fetchedChats);
        setSelectedChats(fetchedChats[0]); // Select the latest chat

      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (user && chats.length === 0 && !loadingChats) {
      fetchUsersChats();
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        chats,
        setChats,
        selectedChats,
        setSelectedChats,
        createNewChat,
        fetchUsersChats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
