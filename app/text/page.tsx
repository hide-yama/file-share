'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Users, Copy, Check, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { createBrowserClient } from '@/lib/supabase-client';

interface TextRoom {
  id: string;
  room_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function TextSharePage() {
  const [roomId, setRoomId] = useState('');
  const [content, setContent] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentRoom, setCurrentRoom] = useState<TextRoom | null>(null);
  const supabase = createBrowserClient();

  // Generate random room ID (4 characters, lowercase alphabet only)
  const generateRoomId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Create new room
  const createRoom = async () => {
    try {
      const newRoomId = generateRoomId();
      
      const { data, error } = await supabase
        .from('text_rooms')
        .insert({
          room_id: newRoomId,
          content: ''
        })
        .select()
        .single();

      if (error) throw error;

      setRoomId(newRoomId);
      setIsCreating(false);
      setIsInRoom(true);
      setCurrentRoom(data);
    } catch {
      setError('ルームの作成に失敗しました');
    }
  };

  // Join existing room
  const joinRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('text_rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error || !data) {
        setError('ルームが見つかりません');
        return;
      }

      setContent(data.content || '');
      setIsInRoom(true);
      setCurrentRoom(data);
      setLastUpdated(new Date());
    } catch {
      setError('ルームへの参加に失敗しました');
    }
  };

  // Manual refresh function
  const refreshContent = async () => {
    if (!roomId || !currentRoom) return;

    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('text_rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error || !data) {
        setError('最新データの取得に失敗しました');
        return;
      }

      // Only update if content has changed
      if (data.content !== content) {
        setContent(data.content || '');
        setCurrentRoom(data);
      }
      setLastUpdated(new Date());
      setError(''); // Clear any previous errors
    } catch {
      setError('最新データの取得に失敗しました');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update content in database
  const updateContent = useCallback(async (newContent: string) => {
    if (!currentRoom) return;

    try {
      await supabase
        .from('text_rooms')
        .update({ content: newContent, updated_at: new Date().toISOString() })
        .eq('room_id', roomId);
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  }, [currentRoom, roomId, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isInRoom || !roomId) return;

    const channel = supabase
      .channel(`text_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'text_rooms',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'content' in payload.new && payload.new.content !== content) {
            setContent(payload.new.content as string);
            setLastUpdated(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isInRoom, roomId, supabase, content]);

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy text content to clipboard
  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setContentCopied(true);
    setTimeout(() => setContentCopied(false), 2000);
  };

  // Format last updated time
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!isInRoom) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 px-4 py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-blue-700 mb-6 shadow-md">
                <MessageSquare className="h-4 w-4 mr-2" />
                リアルタイムテキスト共有
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                テキスト共有ルーム
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
                ルームIDだけでテキストをリアルタイム共有
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => { setIsCreating(true); setError(''); }}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      isCreating 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    新規ルーム作成
                  </button>
                  <button
                    onClick={() => { setIsCreating(false); setError(''); }}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                      !isCreating 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    既存ルームに参加
                  </button>
                </div>

                {!isCreating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ルームID
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="例: abc123def456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                )}

                <button
                  onClick={isCreating ? createRoom : joinRoom}
                  disabled={!isCreating && !roomId}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'ルームを作成' : 'ルームに参加'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 px-4 py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">ルームID: {roomId}</span>
              </div>
              <button
                onClick={copyRoomId}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all flex-shrink-0"
                title={copied ? 'コピーしました' : 'ルームIDをコピー'}
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
              </button>
            </div>
            <button
              onClick={() => setIsInRoom(false)}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
            >
              退室
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  共有テキスト
                </label>
                <button
                  onClick={copyContent}
                  disabled={!content}
                  className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title={contentCopied ? 'コピーしました' : 'テキストをコピー'}
                >
                  {contentCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                  <span className="text-gray-600">
                    {contentCopied ? 'コピーしました' : 'コピー'}
                  </span>
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  updateContent(e.target.value);
                }}
                placeholder="ここにテキストを入力すると、同じルームの全員にリアルタイムで共有されます..."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <Users className="inline h-4 w-4 mr-1" />
                このルームで編集中
                {lastUpdated && (
                  <span className="ml-4 text-xs text-gray-500">
                    最終更新: {formatLastUpdated(lastUpdated)}
                  </span>
                )}
              </div>
              <button
                onClick={refreshContent}
                disabled={isRefreshing}
                className="flex items-center px-3 py-2 text-sm bg-white/60 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '更新中...' : '最新に更新'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}