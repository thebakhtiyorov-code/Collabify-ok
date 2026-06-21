import React, { useState, useEffect, useRef } from 'react';
import { User, JobPost, Proposal, Message, ChatRoom, RealTimeEvent } from './types';
import RoleSwitcher from './components/RoleSwitcher';
import ClientDashboard from './components/ClientDashboard';
import FreelancerDashboard from './components/FreelancerDashboard';
import ChatSystem from './components/ChatSystem';
import { 
  Building2, Users, LayoutDashboard, MessageSquareCode, ShieldAlert,
  HardDriveUpload, UserPlus, Info, Terminal, ChevronRight, HelpCircle
} from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'https://collabify-ok.onrender.com' 
  : 'https://collabify-ok.onrender.comgit add';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'console' | 'vault'>('console');
  const [sseConnected, setSseConnected] = useState(false);

  const activeRoomIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    const bootstrapData = async () => {
      try {
        const resUsers = await fetch(`${BACKEND_URL}/api/users`);
        const listUsers: User[] = await resUsers.json();
        setAllUsers(listUsers);
        if (listUsers.length > 0) {
          setCurrentUser(listUsers[0]);
        }
        const resJobs = await fetch(`${BACKEND_URL}/api/jobs`);
        const listJobs: JobPost[] = await resJobs.json();
        setJobPosts(listJobs);
        const resProposals = await fetch(`${BACKEND_URL}/api/proposals`);
        const listProposals: Proposal[] = await resProposals.json();
        setProposals(listProposals);
      } catch (err) {
        console.error('[Collabify Boot Fail]', err);
      }
    };
    bootstrapData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const syncUserRooms = async () => {
      try {
        const resRooms = await fetch(`${BACKEND_URL}/api/chat/rooms?userId=${currentUser.id}`);
        const dataRooms: ChatRoom[] = await resRooms.json();
        setChatRooms(dataRooms);
        if (dataRooms.length > 0) {
          setActiveRoomId(dataRooms[0].id);
        } else {
          setActiveRoomId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to sync chat rooms for target profile', err);
      }
    };
    syncUserRooms();
  }, [currentUser]);

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/rooms/${activeRoomId}/messages`);
        const listMsgs = await res.json();
        setMessages(listMsgs);
      } catch (err) {
        console.error('Failed to sync transcripts for active room', err);
      }
    };
    fetchMessages();
  }, [activeRoomId]);

  useEffect(() => {
    const eventSource = new EventSource(`${BACKEND_URL}/api/realtime/stream`);
    eventSource.onopen = () => {
      setSseConnected(true);
      console.log('[SSE Connected] Standard keep-alive streaming channel active.');
    };
    eventSource.onerror = (e) => {
      setSseConnected(false);
      console.error('[SSE Error] Attempting auto reconnect...', e);
    };
    eventSource.onmessage = (event) => {
      try {
        if (event.data === ':ok') return;
        const payload: RealTimeEvent = JSON.parse(event.data);
        switch (payload.type) {
          case 'job_created':
            setJobPosts(prev => {
              if (prev.some(j => j.id === payload.payload.id)) return prev;
              return [payload.payload, ...prev];
            });
            break;
          case 'job_updated':
            setJobPosts(prev => prev.map(j => j.id === payload.payload.id ? payload.payload : j));
            break;
          case 'proposal_created':
            setProposals(prev => {
              if (prev.some(p => p.id === payload.payload.id)) return prev;
              return [payload.payload, ...prev];
            });
            break;
          case 'proposal_updated':
            setProposals(prev => prev.map(p => p.id === payload.payload.id ? payload.payload : p));
            break;
          case 'room_created':
            setChatRooms(prev => {
              const belongs = currentUser 
                ? (payload.payload.clientId === currentUser.id || payload.payload.freelancerId === currentUser.id)
                : true;
              if (!belongs) return prev;
              if (prev.some(r => r.id === payload.payload.id)) return prev;
              return [payload.payload, ...prev];
            });
            break;
          case 'message_created':
            const msg = payload.payload;
            if (msg.chatRoomId === activeRoomIdRef.current) {
              setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.warn('Failed parsing keep-alive event buffer', err);
      }
    };
    return () => {
      eventSource.close();
    };
  }, [currentUser]);

  const handleAddJob = async (jobData: { title: string; description: string; budget: number; tags: string[] }) => {
    if (!currentUser) return;
    const res = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...jobData, clientId: currentUser.id })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create job');
    }
    const createdJob = await res.json();
    console.log('[Job created successfully]', createdJob);
  };

  const handleRespondProposal = async (proposalId: string, status: 'accepted' | 'declined') => {
    const res = await fetch(`${BACKEND_URL}/api/proposals/${proposalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update proposal status');
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: 'open' | 'in_progress' | 'completed') => {
    const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update job status');
    }
  };

  const handleSubmitProposal = async (proposalData: {
    jobPostId: string;
    bidAmount: number;
    coverLetter: string;
    estimatedDays: number;
  }) => {
    if (!currentUser) return;
    const res = await fetch(`${BACKEND_URL}/api/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...proposalData, freelancerId: currentUser.id })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit proposal bid.');
    }
  };

  const handleOpenChatChannel = async (counterpartyId: string, jobPostId: string) => {
    if (!currentUser) return;
    const clientAct = currentUser.role === 'client' ? currentUser.id : counterpartyId;
    const freelancerAct = currentUser.role === 'freelancer' ? currentUser.id : counterpartyId;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientAct,
          freelancerId: freelancerAct,
          jobPostId
        })
      });
      if (!res.ok) throw new Error('Could not establish secure archive channel');
      const room: ChatRoom = await res.json();
      setChatRooms(prev => {
        if (prev.some(r => r.id === room.id)) return prev;
        return [room, ...prev];
      });
      setActiveRoomId(room.id);
      setWorkspaceTab('vault');
    } catch (err) {
      console.error('Error opening direct chat', err);
    }
  };

  const handleSendMessage = async (roomId: string, text: string, attachments: any[]) => {
    if (!currentUser) return;
    const res = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUser.id,
        text,
        attachments
      })
    });
    if (!res.ok) {
      throw new Error('Failed to post live reply');
    }
  };

  const handleUploadFile = async (fileName: string, size: string, fileData: string) => {
    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, size, fileData })
    });
    if (!res.ok) {
      throw new Error('Upload failed on server');
    }
    return await res.json();
  };

  return (
    <div className="min-h-screen bg-immersive-bg font-sans antialiased text-immersive-text-primary flex flex-col selection:bg-immersive-accent/20">
      <RoleSwitcher 
        currentUser={currentUser} 
        allUsers={allUsers} 
        onUserSelect={(user) => setCurrentUser(user)}
        sseConnected={sseConnected}
      />

      <div className="bg-immersive-surface border-b border-immersive-border sticky top-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex gap-1">
            <button
              onClick={() => setWorkspaceTab('console')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all select-none cursor-pointer border ${
                workspaceTab === 'console' 
                  ? 'bg-immersive-bg text-immersive-text-primary border-immersive-border shadow-inner' 
                  : 'text-immersive-text-secondary border-transparent hover:text-immersive-text-primary hover:bg-immersive-surface-bright/30'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-immersive-accent" />
              <span>Project Marketplace &amp; Pipelines</span>
            </button>
            <button
              onClick={() => setWorkspaceTab('vault')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all select-none cursor-pointer relative border ${
                workspaceTab === 'vault' 
                  ? 'bg-immersive-bg text-immersive-text-primary border-immersive-border shadow-inner' 
                  : 'text-immersive-text-secondary border-transparent hover:text-immersive-text-primary hover:bg-immersive-surface-bright/30'
              }`}
            >
              <MessageSquareCode className="w-4 h-4 text-immersive-accent" />
              <span>Document Vault &amp; Live Chat</span>
              {sseConnected && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-immersive-surface-bright border border-immersive-border px-3 py-1.5 rounded-xl text-immersive-text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-immersive-accent flex items-center justify-center text-[7px] text-white">
                ✓
              </span>
              <span>Active Terminal: <strong className="text-immersive-text-primary">{currentUser.name}</strong></span>
              <span className="text-[9px] bg-immersive-bg text-immersive-accent px-1.5 py-0.2 rounded font-sans uppercase border border-immersive-border">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        {currentUser ? (
          <div>
            {workspaceTab === 'console' ? (
              currentUser.role === 'client' ? (
                <div className="animate-fade-in">
                  <ClientDashboard 
                    currentUser={currentUser}
                    jobPosts={jobPosts}
                    proposals={proposals}
                    onAddJob={handleAddJob}
                    onRespondProposal={handleRespondProposal}
                    onUpdateJobStatus={handleUpdateJobStatus}
                    openChatWithFreelancer={handleOpenChatChannel}
                  />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <FreelancerDashboard 
                    currentUser={currentUser}
                    jobPosts={jobPosts}
                    proposals={proposals}
                    onSubmitProposal={handleSubmitProposal}
                    openChatWithClient={handleOpenChatChannel}
                  />
                </div>
              )
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-immersive-surface border border-immersive-border p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-immersive-accent shrink-0 mt-0.5" />
                  <div className="text-xs text-immersive-text-secondary space-y-1">
                    <p className="font-semibold text-immersive-text-primary">Interactive Sandbox Mode Information</p>
                    <p>To demonstrate real-time WebSocket capabilities, we have structured an advanced **Server-Sent Events (SSE)** broadcast engine.</p>
                  </div>
                </div>

                <ChatSystem 
                  currentUser={currentUser}
                  chatRooms={chatRooms}
                  activeRoomId={activeRoomId}
                  onSelectRoom={(id) => setActiveRoomId(id)}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onUploadFile={handleUploadFile}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-immersive-surface border border-immersive-border rounded-2xl">
            <ShieldAlert className="w-12 h-12 text-immersive-text-secondary animate-pulse" />
            <h2 className="font-display font-medium text-immersive-text-primary text-lg mt-4">Profile Terminal Syncing</h2>
            <p className="text-immersive-text-secondary text-xs mt-1.5">Setting secure credentials. Please wait...</p>
          </div>
        )}
      </main>

      <footer className="bg-immersive-surface border-t border-immersive-border text-immersive-text-secondary py-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-immersive-accent" />
            <span className="font-semibold font-display text-immersive-text-primary">Collabify Enterprise Marketplace</span>
            <span>•</span>
            <span className="font-mono text-[10px]">v1.4.2 Production Ready</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span>Server Ingress Node: {window.location.hostname === 'localhost' ? 'Port 3000' : 'Cloud Server'}</span>
            <span>SSE Multicast Broadcaster: Enabled</span>
            <span>Client State Synced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}