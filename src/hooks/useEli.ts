import { useState, useCallback, useEffect } from 'react';
import { EliMessage } from '../types';
import { sendEliMessage, getEliOpener } from '../lib/eli';
import { saveEliMessage, getRecentEliHistory } from '../lib/db';

interface UseEliOptions {
  sessionType: 'daily' | 'weekly' | 'reflection' | 'dashboard';
  user: any;
  mission: any;
  roles: any[];
  roleGoals?: any[];
  todayPriorities?: any[];
  yesterdayPriorities?: any[];
}

export const useEli = (options: UseEliOptions) => {
  const [pastConversations, setPastConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<EliMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Load past conversation history then set opener
  useEffect(() => {
    if (!options.user?.id) return;

    getRecentEliHistory(options.user.id, 12).then(history => {
      setPastConversations(history);

      const opener = getEliOpener(options.sessionType, {
        user: options.user,
        yesterdayPriorities: options.yesterdayPriorities,
      });

      setMessages([{
        id: '1',
        role: 'eli',
        content: opener,
        timestamp: new Date().toISOString(),
        context: options.sessionType
      }]);
      setReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.user?.id, options.sessionType]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: EliMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      context: options.sessionType
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Save user message to DB (fire and forget)
    if (options.user?.id) {
      saveEliMessage(options.user.id, 'user', content, options.sessionType);
    }

    try {
      const response = await sendEliMessage(content, {
        user: options.user,
        mission: options.mission,
        roles: options.roles,
        roleGoals: options.roleGoals,
        todayPriorities: options.todayPriorities,
        yesterdayPriorities: options.yesterdayPriorities,
        sessionType: options.sessionType,
        conversationHistory: [...messages, userMsg],
        pastConversations,
      });

      const eliMsg: EliMessage = {
        id: (Date.now() + 1).toString(),
        role: 'eli',
        content: response,
        timestamp: new Date().toISOString(),
        context: options.sessionType
      };

      setMessages(prev => [...prev, eliMsg]);

      // Save Eli's response to DB
      if (options.user?.id) {
        saveEliMessage(options.user.id, 'eli', response, options.sessionType);
      }
    } catch (error) {
      console.error('Eli error:', error);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, options, pastConversations]);

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

  return { messages, sendMessage, addEliMessage, loading, ready };
};
