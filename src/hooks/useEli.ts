import { useState, useCallback } from 'react';
import { EliMessage } from '../types';
import { sendEliMessage, getEliOpener } from '../lib/eli';

interface UseEliOptions {
  sessionType: 'daily' | 'weekly' | 'reflection' | 'dashboard';
  user: any;
  mission: any;
  roles: any[];
  roleGoals?: any[];
  todayPriorities?: any[];
}

export const useEli = (options: UseEliOptions) => {
  const opener = getEliOpener(options.sessionType, { user: options.user });

  const [messages, setMessages] = useState<EliMessage[]>([
    {
      id: '1',
      role: 'eli',
      content: opener,
      timestamp: new Date().toISOString(),
      context: options.sessionType
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    // Add user message immediately
    const userMsg: EliMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      context: options.sessionType
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendEliMessage(content, {
        user: options.user,
        mission: options.mission,
        roles: options.roles,
        roleGoals: options.roleGoals,
        todayPriorities: options.todayPriorities,
        sessionType: options.sessionType,
        conversationHistory: [...messages, userMsg]
      });

      const eliMsg: EliMessage = {
        id: (Date.now() + 1).toString(),
        role: 'eli',
        content: response,
        timestamp: new Date().toISOString(),
        context: options.sessionType
      };

      setMessages(prev => [...prev, eliMsg]);
    } catch (error) {
      console.error('Eli error:', error);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, options]);

  const addEliMessage = useCallback((content: string) => {
    const msg: EliMessage = {
      id: Date.now().toString(),
      role: 'eli',
      content,
      timestamp: new Date().toISOString(),
      context: options.sessionType
    };
    setMessages(prev => [...prev, msg]);
  }, [options.sessionType]);

  return { messages, sendMessage, addEliMessage, loading };
};
