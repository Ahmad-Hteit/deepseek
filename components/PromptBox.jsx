// ✅ FIXED PromptBox.jsx
/* eslint-disable no-unused-vars */
import Image from 'next/image';
import React, { useState } from 'react';
import { assets } from '@assets/assets';
import PropTypes from 'prop-types';
import { useAppContext } from '@context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const PromptBox = ({ isLoading, setIsLoading }) => {
  const [prompt, setPrompt] = useState('');
  const { user, chats, setChats, selectedChats, setSelectedChats } = useAppContext();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(e);
    }
  };

  const sendPrompt = async (e) => {
    e.preventDefault();
    const promptCopy = prompt;

    if (!user) return toast.error('Login to send message');
    if (!selectedChats) return toast.error('No chat selected');
    if (isLoading) return toast.error('Wait for the previous prompt to respond');

    try {
      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now()
      };
if (!selectedChats) {
  toast.error("No chat selected");
  return;
}

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChats._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      setSelectedChats((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt]
      }));

      const { data } = await axios.post('/api/chat/ai', {
        chatId: selectedChats._id,
        prompt
      });

      console.log("DeepSeek response", data);


      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: "",
          timestamp: Date.now()
        };

        const tokens = data.message.content.split(" ");
if (!selectedChats) {
  toast.error("No chat selected");
  return;
}

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChats._id
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat
          )
        );

        setSelectedChats((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage]
        }));

        tokens.forEach((_, i) => {
          setTimeout(() => {
            const updatedContent = tokens.slice(0, i + 1).join(" ");
            setSelectedChats((prev) => {
              const updatedMessages = [...prev.messages];
              updatedMessages[updatedMessages.length - 1] = {
                ...updatedMessages[updatedMessages.length - 1],
                content: updatedContent
              };
              return { ...prev, messages: updatedMessages };
            });
          }, 100 * i);
        });
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={sendPrompt} className={`w-full ${selectedChats?.messages.length} > 0 ? 
     max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
        rows={2}
        placeholder='Message DeepSeek'
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className='flex items-center justify-between text-sm mt-2'>
        <div className='flex items-center gap-2'>
          <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
            <Image className='h-5' src={assets.deepthink_icon} alt='' />
            DeepThink (R1)
          </p>
          <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
            <Image className='h-5' src={assets.search_icon} alt='' />
            Search
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt='' />
          <button
            type="submit"
            disabled={!prompt}
            className={`p-2 rounded-full transition-all duration-300 ${prompt ? 'bg-primary hover:opacity-90' : 'bg-gray-600 cursor-not-allowed'} flex items-center justify-center`}
          >
            <Image
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt='Send'
              className='w-4 h-4'
            />
          </button>
        </div>
      </div>
    </form>
  );
};

PromptBox.propTypes = {
  isLoading: PropTypes.bool,
  setIsLoading: PropTypes.func,
};

export default PromptBox;
