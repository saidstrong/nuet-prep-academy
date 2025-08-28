import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Real-time subscription helpers
export const subscribeToChatMessages = (chatId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`chat:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
        filter: `chatId=eq.${chatId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToUserStatus = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'User',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToCourseUpdates = (courseId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`course:${courseId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Course',
        filter: `id=eq.${courseId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToEnrollmentUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('enrollments')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'CourseEnrollment',
      },
      callback
    )
    .subscribe();
};

// Chat real-time functions
export const sendMessage = async (chatId: string, content: string, senderId: string) => {
  const { data, error } = await supabase
    .from('Message')
    .insert([
      {
        chatId,
        content,
        senderId,
        type: 'TEXT',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markMessageAsRead = async (messageId: string, userId: string) => {
  const { data, error } = await supabase
    .from('MessageRead')
    .upsert([
      {
        messageId,
        userId,
        readAt: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// User presence management
export const updateUserPresence = async (userId: string, status: 'online' | 'offline' | 'away') => {
  const { data, error } = await supabase
    .from('UserPresence')
    .upsert([
      {
        userId,
        status,
        lastSeen: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const subscribeToPresence = (callback: (payload: any) => void) => {
  return supabase
    .channel('presence')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'UserPresence' }, callback)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'UserPresence' }, callback)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'UserPresence' }, callback)
    .subscribe();
};

// Notification system
export const createNotification = async (userId: string, title: string, message: string, type: string) => {
  const { data, error } = await supabase
    .from('Notification')
    .insert([
      {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Notification',
        filter: `userId=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('Notification')
    .update({ isRead: true, readAt: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
"// Updated Supabase config" 
