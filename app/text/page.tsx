'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Copy, Check, ClipboardPaste } from 'lucide-react';
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
  const [isCopying, setIsCopying] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [notice, setNotice] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentRoom, setCurrentRoom] = useState<TextRoom | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Fetch latest content from database (returns null on failure)
  const fetchLatest = async (): Promise<string | null> => {
    // Drop any pending save so it can't overwrite what we fetch
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    const { data, error } = await supabase
      .from('text_rooms')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error || !data) {
      setError('最新データの取得に失敗しました');
      return null;
    }

    setContent(data.content || '');
    setCurrentRoom(data);
    setLastUpdated(new Date());
    setError('');
    return data.content || '';
  };

  // Update content in database
  const saveContent = async (newContent: string) => {
    if (!currentRoom) return;

    const { error } = await supabase
      .from('text_rooms')
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq('room_id', roomId);

    if (error) {
      setError('保存に失敗しました');
      return;
    }
    setLastUpdated(new Date());
    setError('');
  };

  // Debounced save while typing, so out-of-order writes can't clobber newer text
  const scheduleSave = (newContent: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      saveContent(newContent);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // コピ: fetch latest, then copy it to clipboard
  const copyLatest = async () => {
    setIsCopying(true);
    try {
      const latest = fetchLatest().then((text) => text ?? content);
      if (typeof ClipboardItem !== 'undefined') {
        // Hand the clipboard a promise so Safari keeps the click's user activation across the fetch
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': latest.then((text) => new Blob([text], { type: 'text/plain' })),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await latest);
      }
      setContentCopied(true);
      setTimeout(() => setContentCopied(false), 2000);
    } catch {
      setError('クリップボードへのコピーに失敗しました');
    } finally {
      setIsCopying(false);
    }
  };

  // ペ: replace content with clipboard text and save immediately
  const pasteAndSave = async () => {
    setError('');
    // Chrome waits silently on a small permission bubble near the address bar until answered
    const permission = await navigator.permissions
      ?.query({ name: 'clipboard-read' as PermissionName })
      .then((status) => status.state)
      .catch(() => null);
    if (permission === 'prompt') {
      setNotice('ブラウザのアドレスバー付近に表示される「クリップボードの読み取り」を許可してください');
    }

    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      setError(
        permission === 'denied'
          ? 'クリップボードの読み取りがブロックされています。アドレスバー左のアイコンから許可するか、テキスト欄に直接貼り付けてください'
          : 'クリップボードを読み取れませんでした。テキスト欄に直接貼り付けてください'
      );
      textareaRef.current?.focus();
      return;
    } finally {
      setNotice('');
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setContent(text);
    setIsPasting(true);
    try {
      await saveContent(text);
      setPasted(true);
      setTimeout(() => setPasted(false), 2000);
    } finally {
      setIsPasting(false);
    }
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && roomId) {
                          joinRoom();
                        }
                      }}
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              {notice}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  共有テキスト
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyLatest}
                    disabled={isCopying}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    title="最新を取得してコピー"
                  >
                    {contentCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    コピ
                  </button>
                  <button
                    onClick={pasteAndSave}
                    disabled={isPasting}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    title="クリップボードの内容で置き換えて保存"
                  >
                    {pasted ? <Check className="h-4 w-4" /> : <ClipboardPaste className="h-4 w-4" />}
                    ペ
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  scheduleSave(e.target.value);
                }}
                placeholder="「ペ」でクリップボードの内容を共有、相手は「コピ」で最新を取得してコピーできます"
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                <Users className="inline h-4 w-4 mr-1" />
                このルームで編集中
                {lastUpdated && (
                  <span className="ml-4 text-xs text-gray-500">
                    最終更新: {formatLastUpdated(lastUpdated)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}