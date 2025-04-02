"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Database, CheckSquare } from 'lucide-react';

// Modified MessagesPanel to handle multiple chats
const MessagesPanel = ({ chatIds, chats, allChats }) => {
    const t = useTranslations('chatPanel');
    const [allMessages, setAllMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const previousMessagesLengthRef = useRef(0);
    
    // Create a more comprehensive mapping of chat IDs to chat names
    // Use all available chats, not just selected ones
    const chatNameMap = {};
    // First add from the selected chats
    chats?.forEach(chat => {
        chatNameMap[chat.chat_id] = chat.chat_name || chat.chat_id;
    });
    // Then add from allChats if available
    allChats?.forEach(chat => {
        if (!chatNameMap[chat.chat_id]) {
            chatNameMap[chat.chat_id] = chat.chat_name || chat.chat_id;
        }
    });

    // Helper function to get chat name
    const getChatName = (chatId) => {
        return chatNameMap[chatId] || t('unknownChat');
    };

    // Scroll to bottom function
    const scrollToBottom = () => {
        if (shouldAutoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    // Handle scroll events to determine if user is at bottom
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            // Consider "at bottom" if within 50px of the bottom
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
            setShouldAutoScroll(isAtBottom);
        }
    };

    useEffect(() => {
        // Function to fetch messages for all selected chats
        const fetchAllMessages = async () => {
            try {
                const fetchPromises = chatIds.map(async (chatId) => {
                    const response = await fetch(`/api/chats/get_processed_messages?chat_id=${chatId}`);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch messages for chat ${chatId}`);
                    }
                    
                    const data = await response.json();
                    
                    // Add chat_id to any messages that might be missing it
                    return data.map(msg => ({
                        ...msg,
                        chat_id: msg.chat_id || chatId
                    }));
                });
                
                const results = await Promise.all(fetchPromises);
                
                // Flatten all messages into a single array
                const mergedMessages = results.flat();
                
                // Sort messages by timestamp (oldest first)
                mergedMessages.sort((a, b) => 
                    new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
                );
                
                setAllMessages(mergedMessages);
                
                // Debug logging
                console.log('Messages loaded:', mergedMessages);
                console.log('Chat name mapping:', chatNameMap);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        if (chatIds.length > 0) {
            // Initial fetch
            fetchAllMessages();
            
            // Set up interval for updates
            const intervalId = setInterval(fetchAllMessages, 5000);
            
            // Clean up interval on unmount
            return () => clearInterval(intervalId);
        } else {
            setAllMessages([]);
        }
    }, [chatIds]);

    // Effect to scroll to bottom when new messages arrive
    useEffect(() => {
        // Check if there are actually new messages
        const hasNewMessages = allMessages.length > previousMessagesLengthRef.current;
        previousMessagesLengthRef.current = allMessages.length;
        
        // Only scroll if new messages were added and user was at the bottom
        if (hasNewMessages) {
            scrollToBottom();
        }
    }, [allMessages]);
    
    // Initial scroll when component mounts
    useEffect(() => {
        scrollToBottom();
    }, []);

    if (chatIds.length === 0) {
        return (
            <div className="bg-base-200 rounded-box p-4 h-192 overflow-y-auto">
                <div className="text-center text-base-content/70 my-8">
                    {t('noChatsSelected')}
                </div>
            </div>
        );
    }

    return (
        <div 
            className="bg-base-200 rounded-box p-4 h-192 overflow-y-auto" 
            ref={containerRef}
            onScroll={handleScroll}
        >
            {allMessages.length === 0 ? (
                <div className="text-center text-base-content/70 my-2">
                    {t('noMessages')}
                </div>
            ) : (
                <>
                    {allMessages.map((message, index) => {
                        const chatName = getChatName(message.chat_id);
                        
                        return (
                            <div key={index} className="chat chat-start mb-4">
                                <div className="chat-bubble bg-base-100">
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {/* Always show source badge, with fallback text */}
                                        <div className="badge badge-primary badge-sm">
                                            {message.source_name || t('unknownSource')}
                                        </div>
                                        <div className="badge badge-secondary badge-sm">
                                            {chatName}
                                        </div>
                                        {message.timestamp && (
                                            <div className="text-xs opacity-70">
                                                {new Date(message.timestamp).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="font-bold">{message.sender || t('unknownSender')}</div>
                                    <div className="mt-1">{message.text}</div>
                                    {message.data && Object.keys(message.data).length > 0 && (
                                        <div className="mt-2 bg-base-300/50 p-2 rounded-lg">
                                            {Object.entries(message.data).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
};

export default function ChatPanel() {
    const t = useTranslations('chatPanel');

    const [dataSources, setDataSources] = useState([]);
    const [selectedDataSources, setSelectedDataSources] = useState([]);
    const [chats, setChats] = useState([]);
    const [selectedChats, setSelectedChats] = useState([]);

    const [allChats, setAllChats] = useState([]);
    const [activeChats, setActiveChats] = useState([]);
    const [selectedConfigSource, setSelectedConfigSource] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch data sources on component mount
    useEffect(() => {
        fetchDataSources();
    }, []);

    // Fetch chats when data sources are selected
    useEffect(() => {
        if (selectedDataSources.length > 0) {
            fetchChatsFromMultipleSources();
        } else {
            setChats([]);
            setSelectedChats([]);
        }
    }, [selectedDataSources]);

    // Fetch chats when config data source is selected
    useEffect(() => {
        if (selectedConfigSource) {
            fetchAllChats(selectedConfigSource);
            fetchActiveChats(selectedConfigSource);
        }
    }, [selectedConfigSource]);

    const fetchDataSources = async () => {
        console.log('hello');

        try {
            const response = await fetch('/api/chats/get_datasources');

            if (!response.ok) {
                throw new Error("Failed to fetch data sources");
            }

            const data = await response.json();
            setDataSources(data.datasources || []);

            if (data.datasources && data.datasources.length > 0) {
                setSelectedConfigSource(data.datasources[0]);
            }
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const fetchChatsFromMultipleSources = async () => {
        try {
            const fetchPromises = selectedDataSources.map(async (sourceName) => {
                const response = await fetch(`/api/chats/get_chats?source_name=${sourceName}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch chats for source ${sourceName}`);
                }
                
                const data = await response.json();
                return data.chats || [];
            });
            
            const results = await Promise.all(fetchPromises);
            const allChats = results.flat();
            console.log(results);
            console.log(results.flat());
            setChats(allChats);
            setSelectedChats([]); // Reset selected chats when data sources change
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const fetchAllChats = async (sourceName) => {
        try {
            const response = await fetch(`/api/chats/get_chats?source_name=${sourceName}`);

            if (!response.ok) {
                throw new Error("Failed to fetch all chats");
            }

            const data = await response.json();
            setAllChats(data.chats || []);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const fetchActiveChats = async (sourceName) => {
        try {
            const response = await fetch(`/api/chats/get_active_chats?source_name=${sourceName}`);

            if (!response.ok) {
                throw new Error("Failed to fetch active chats");
            }

            const data = await response.json();
            setActiveChats(data.chats || []);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const handleToggleChat = (chatId) => {
        if (activeChats.includes(chatId)) {
            setActiveChats(activeChats.filter(id => id !== chatId));
        } else {
            setActiveChats([...activeChats, chatId]);
        }
    };

    const handleToggleDataSource = (sourceName) => {
        if (selectedDataSources.includes(sourceName)) {
            setSelectedDataSources(selectedDataSources.filter(name => name !== sourceName));
        } else {
            setSelectedDataSources([...selectedDataSources, sourceName]);
        }
    };

    const handleSelectAllDataSources = () => {
        if (selectedDataSources.length === dataSources.length) {
            setSelectedDataSources([]);
        } else {
            setSelectedDataSources([...dataSources]);
        }
    };

    const handleToggleSelectedChat = (chatId) => {
        if (selectedChats.includes(chatId)) {
            setSelectedChats(selectedChats.filter(id => id !== chatId));
        } else {
            setSelectedChats([...selectedChats, chatId]);
        }
    };

    const handleSelectAllChats = () => {
        if (selectedChats.length === chats.length) {
            setSelectedChats([]);
        } else {
            setSelectedChats(chats.map(chat => chat.chat_id));
        }
    };

    const saveActiveChats = async () => {
        try {
            setIsUpdating(true);
            const response = await fetch('/api/chats/set_active_chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_name: selectedConfigSource,
                    chat_ids: activeChats
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Failed to update active chats");
            }

            setMessage({ text: t('updateSuccess'), type: 'success' });

            // Refresh chat list if any of the current data sources matches the config one
            if (selectedDataSources.includes(selectedConfigSource)) {
                fetchChatsFromMultipleSources();
            }
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full text-base-content">
            <h2 className="card-title text-secondary mb-6">{t('title')}</h2>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                    <span>{message.text}</span>
                </div>
            )}

            {/* Chat viewer section */}
            <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={20} className="text-primary" />
                        <h3 className="text-lg font-medium">{t('chatViewer')}</h3>
                    </div>

                    <div className="mb-6">
                        <label className="label">
                            <span className="label-text">{t('selectDataSource')}</span>
                        </label>
                        <div className="bg-base-200 rounded-box p-3 mb-2">
                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={selectedDataSources.length === dataSources.length && dataSources.length > 0}
                                        onChange={handleSelectAllDataSources}
                                    />
                                    <span className="label-text font-medium">{t('selectAll')}</span>
                                </label>
                            </div>
                            <div className="divider my-1"></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {dataSources.map((source) => (
                                    <div key={source} className="form-control">
                                        <label className="label cursor-pointer justify-start gap-3">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm checkbox-primary"
                                                checked={selectedDataSources.includes(source)}
                                                onChange={() => handleToggleDataSource(source)}
                                            />
                                            <span className="label-text">{source}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="label">
                                <span className="label-text">{t('selectChat')}</span>
                            </label>
                            {chats.length > 0 && (
                                <button 
                                    className="btn btn-xs btn-outline"
                                    onClick={handleSelectAllChats}
                                >
                                    {selectedChats.length === chats.length ? t('deselectAll') : t('selectAll')}
                                </button>
                            )}
                        </div>
                        
                        {chats.length === 0 ? (
                            <div className="bg-base-200 rounded-box p-4 text-center text-base-content/70">
                                {selectedDataSources.length === 0 
                                    ? t('selectDataSourceFirst') 
                                    : t('noChatsAvailable')}
                            </div>
                        ) : (
                            <div className="bg-base-200 rounded-box p-3 flex flex-wrap gap-2">
                                {chats.map((chat) => (
                                    <div 
                                        key={chat.chat_id}
                                        className={`badge badge-lg cursor-pointer ${
                                            selectedChats.includes(chat.chat_id) 
                                                ? 'badge-primary' 
                                                : 'badge-outline'
                                        }`}
                                        onClick={() => handleToggleSelectedChat(chat.chat_id)}
                                    >
                                        {chat.chat_name || t('unnamed')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <MessagesPanel chatIds={selectedChats} chats={chats} allChats={allChats} />
                </div>
            </div>

            {/* Chat configuration section */}
            <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={20} className="text-primary" />
                        <h3 className="text-lg font-medium">{t('chatConfiguration')}</h3>
                    </div>

                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text">{t('configureDataSource')}</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={selectedConfigSource}
                            onChange={(e) => setSelectedConfigSource(e.target.value)}
                        >
                            {dataSources.map((source) => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-base-200 rounded-box p-4 mb-4">
                        <h4 className="font-medium mb-2">{t('availableChats')}</h4>

                        {allChats.length === 0 ? (
                            <div className="text-base-content/70">{t('noChatsAvailable')}</div>
                        ) : (
                            <div className="space-y-2">
                                {allChats.map((chat) => (
                                    <div key={chat.chat_id} className="form-control">
                                        <label className="label cursor-pointer justify-start gap-3">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={activeChats.includes(chat.chat_id)}
                                                onChange={() => handleToggleChat(chat.chat_id)}
                                            />
                                            <span className="label-text">
                                                {chat.chat_name || t('unnamed')}
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            className={`btn btn-primary ${isUpdating ? 'loading' : ''}`}
                            onClick={saveActiveChats}
                            disabled={isUpdating || allChats.length === 0}
                        >
                            {isUpdating ? t('saving') : t('saveActiveChats')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}