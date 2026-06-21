import React, { useState, useEffect, useRef } from 'react';
import { User, ChatRoom, Message } from '../types';
import { 
  Send, Paperclip, FileText, Download, UserCheck, CheckCircle2, 
  Layers, ShieldAlert, Folder, Plus, ArrowUpRight, UploadCloud, Trash2
} from 'lucide-react';

interface ChatSystemProps {
  currentUser: User;
  chatRooms: ChatRoom[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  messages: Message[];
  onSendMessage: (roomId: string, text: string, attachments: any[]) => Promise<void>;
  onUploadFile: (fileName: string, size: string, fileData: string) => Promise<{ name: string; url: string; size: string }>;
}

export default function ChatSystem({
  currentUser,
  chatRooms,
  activeRoomId,
  onSelectRoom,
  messages,
  onSendMessage,
  onUploadFile
}: ChatSystemProps) {
  // UI States
  const [inputText, setInputText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<{ name: string; url: string; size: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Refs for auto-scroll and file triggers
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter messages for active room
  const activeRoom = chatRooms.find(r => r.id === activeRoomId);

  // Auto scroll logic on new messages / attachments
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoomId]);

  // Handle Drag & Drop handlers for the Chat Pane (Document Vault)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDocumentDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processSelectedFiles(files);
    }
  };

  // Click manual upload handler
  const handleManualUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processSelectedFiles(files);
    }
  };

  // Process files: convert to Base64 and secure to the backend vault
  const processSelectedFiles = async (files: FileList) => {
    setIsUploading(true);
    setUploadError('');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Limit to 4MB in sandboxed memory
      if (file.size > 4 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 4MB payload limit.`);
        continue;
      }

      const reader = new FileReader();
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      const fileDataPromise = new Promise<string>((resolve) => {
        reader.onload = (event) => {
          resolve(event.target?.result as string || '');
        };
        reader.readAsDataURL(file);
      });

      try {
        const fileContent = await fileDataPromise;
        const result = await onUploadFile(file.name, sizeStr, fileContent);
        setPendingAttachments(prev => [...prev, result]);
      } catch (err) {
        setUploadError('Failed to parse secure document archive.');
      }
    }
    setIsUploading(false);
  };

  const handleRemovePending = (idx: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit message and attachments
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId) return;

    if (!inputText.trim() && pendingAttachments.length === 0) {
      return;
    }

    try {
      await onSendMessage(activeRoomId, inputText, pendingAttachments);
      setInputText('');
      setPendingAttachments([]);
    } catch (err) {
      setUploadError('Failed to transmit message.');
    }
  };

  return (
    <div className="bg-immersive-surface border border-immersive-border rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[600px] animate-fade-in">
      {/* SIDEBAR: ACTIVE CHAT ROOMS */}
      <div className="border-r border-immersive-border flex flex-col h-full bg-immersive-bg/40">
        <div className="p-4 border-b border-immersive-border bg-immersive-surface-bright text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-immersive-accent" />
            <span className="font-display font-semibold text-xs tracking-tight text-immersive-text-primary">E2E Briefing & Chat Vault</span>
          </div>
          <span className="text-[10px] bg-immersive-bg text-immersive-accent border border-immersive-accent/15 px-1.5 py-0.5 rounded font-mono font-bold">
            AES 256
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-immersive-border/30">
          {chatRooms.length === 0 ? (
            <div className="p-8 text-center text-immersive-text-secondary select-none">
              <FileText className="w-8 h-8 mx-auto text-immersive-text-secondary/30 mb-2" />
              <p className="text-xs font-semibold text-immersive-text-primary">No active negotiations yet</p>
              <p className="text-[10px] text-immersive-text-secondary/60 mt-1">Chat room is initiated when negotiations begin or when you click "Chat / Negotiate Details".</p>
            </div>
          ) : (
            chatRooms.map((room) => {
              const isActive = room.id === activeRoomId;
              const isFreelancerView = currentUser.role === 'freelancer';
              const counterPartyName = isFreelancerView ? room.clientName : room.freelancerName;
              
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full text-left p-4 hover:bg-immersive-bg/80 transition-all duration-150 relative block cursor-pointer select-none ${
                    isActive ? 'bg-immersive-bg border-l-4 border-l-immersive-accent shadow-inner' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-display font-semibold text-immersive-text-primary text-xs">
                      {counterPartyName}
                    </div>
                    {room.jobTitle && (
                      <span className="text-[8px] bg-immersive-surface-bright text-immersive-accent px-1.5 py-0.5 rounded font-mono uppercase font-bold max-w-[120px] truncate border border-immersive-border">
                        {room.jobTitle}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-[10px] text-immersive-text-secondary mt-1 truncate font-mono">
                    Open secure end-to-end sandbox
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT MESSAGES WINDOW & UPLOADS MAPPED (Vault System) */}
      <div 
        className={`md:col-span-2 flex flex-col h-full relative ${
          dragOver ? 'bg-immersive-accent/10' : 'bg-immersive-surface'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDocumentDrop}
      >
        {/* DRAG AND DROP OVERLAY */}
        {dragOver && (
          <div className="absolute inset-0 bg-immersive-bg/80 backdrop-blur-xs flex flex-col items-center justify-center border-2 border-dashed border-immersive-accent rounded-r-2xl pointer-events-none z-10 transition-all">
            <UploadCloud className="w-12 h-12 text-immersive-accent animate-bounce" />
            <p className="font-display font-semibold text-immersive-accent text-sm mt-3">Drop Supporting Projects briefs here</p>
            <p className="text-xs text-immersive-text-secondary font-mono">Accepts source codes, PDFs & documentation</p>
          </div>
        )}

        {activeRoom ? (
          <>
            {/* Conversation Header banner */}
            <div className="p-4 border-b border-immersive-border bg-immersive-surface-bright flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[9px] font-mono text-immersive-text-secondary font-bold uppercase tracking-widest leading-none">ACTIVE BRIEF SECURE LINE</p>
                <h3 className="font-display font-bold text-immersive-text-primary text-sm mt-1 leading-none">
                  {currentUser.role === 'freelancer' ? activeRoom.clientName : activeRoom.freelancerName}
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-emerald-950/40 text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-tight border border-emerald-800/30">
                <UserCheck className="w-3 h-3 text-emerald-450" />
                SECURE END-TO-END
              </div>
            </div>

            {/* Error alerts if file limit or socket fail occurs */}
            {uploadError && (
              <div className="bg-red-950/40 text-red-400 border-b border-red-800/30 text-xs px-4 py-2.5 font-medium flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  {uploadError}
                </span>
                <button onClick={() => setUploadError('')} className="text-red-400 font-semibold hover:text-red-100 cursor-pointer">✕</button>
              </div>
            )}

            {/* Conversations Scroll pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-immersive-bg/30">
              {messages.length === 0 ? (
                <div className="text-center py-10 select-none">
                  <p className="text-xs text-immersive-text-secondary font-semibold font-mono">No transcripts logged yet.</p>
                  <p className="text-[10px] text-immersive-text-secondary/60 mt-1">Start drafting suggestions, budgets, or attaching specifications PDF below.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end animate-fade-in' : 'mr-auto items-start'}`}
                    >
                      {/* Message bubble */}
                      <div className={`rounded-2xl p-3 text-xs leading-relaxed border ${
                        isMe 
                          ? 'bg-immersive-surface-bright border-immersive-border text-immersive-text-primary rounded-br-none shadow-md' 
                          : 'bg-immersive-bg border-immersive-border/60 text-immersive-text-primary rounded-bl-none shadow-sm'
                      }`}>
                        <p className="whitespace-pre-line font-sans">{msg.text}</p>
                        
                        {/* Attachments Section Inside Bubble */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-immersive-border/40 space-y-1.5">
                            {msg.attachments.map((file, fIdx) => (
                              <a
                                key={fIdx}
                                href={file.url}
                                download={file.name}
                                referrerPolicy="no-referrer"
                                className={`flex items-center justify-between gap-4 p-2 rounded-lg text-[10px] border font-mono transition-colors ${
                                  isMe 
                                    ? 'bg-immersive-bg/80 border-immersive-border hover:bg-immersive-bg hover:border-immersive-accent/40 text-immersive-text-primary' 
                                    : 'bg-immersive-surface-bright border-immersive-border hover:bg-immersive-surface hover:text-immersive-text-primary text-immersive-text-secondary'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <FileText className="w-3.5 h-3.5 text-immersive-accent" />
                                  <span className="truncate max-w-[150px] font-semibold">{file.name}</span>
                                  <span className="opacity-60 text-[9px]">({file.size || '300 KB'})</span>
                                </span>
                                <Download className="w-3.5 h-3.5 hover:text-immersive-accent shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp labels */}
                      <span className="text-[9px] text-immersive-text-secondary/60 font-mono mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ATTACHMENT STATUS BUILDER */}
            {pendingAttachments.length > 0 && (
              <div className="p-3 border-t bg-immersive-surface-bright border-immersive-border flex flex-wrap gap-2 items-center">
                <span className="text-[9px] font-mono text-immersive-text-secondary font-bold uppercase block w-full">Pending Attachment:</span>
                {pendingAttachments.map((f, idx) => (
                  <div key={idx} className="bg-immersive-bg border border-immersive-border text-[10px] px-2.5 py-1 rounded-md flex items-center justify-between gap-2 shadow-sm">
                    <span className="truncate max-w-[150px] font-mono font-medium text-immersive-text-primary">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePending(idx)}
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SENDING CONTROLS CHAT DRAWER */}
            <form onSubmit={handleSend} className="p-4 border-t border-immersive-border bg-immersive-surface-bright flex items-center gap-3">
              {/* Click triggers hidden file inputs */}
              <button
                type="button"
                onClick={handleManualUploadClick}
                disabled={isUploading}
                className="w-10 h-10 bg-immersive-bg text-immersive-text-secondary hover:text-immersive-accent rounded-xl flex items-center justify-center border border-immersive-border/80 hover:bg-immersive-bg/50 cursor-pointer transition-colors"
                title="Secure project briefs upload"
              >
                <Paperclip className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />

              <input
                type="text"
                placeholder={isUploading ? 'Preparing document archive...' : 'Type a secure message, suggestion, draft project brief...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isUploading}
                className="flex-1 text-xs text-immersive-text-primary bg-immersive-bg border border-immersive-border rounded-xl px-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && pendingAttachments.length === 0) || isUploading}
                className="w-10 h-10 bg-immersive-accent hover:opacity-90 disabled:opacity-30 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-immersive-bg/30">
            <Folder className="w-12 h-12 text-immersive-text-secondary/30" />
            <h3 className="font-display font-medium text-immersive-text-primary text-sm mt-3">Select Active Chat Sandbox</h3>
            <p className="text-xs text-immersive-text-secondary max-w-sm mt-1">
              Launch real-time conversation via proposal cards or current project boards to share asset archives and source structures.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
