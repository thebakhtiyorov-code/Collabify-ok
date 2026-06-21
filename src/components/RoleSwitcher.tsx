import React from 'react';
import { User } from '../types';
import { Briefcase, Palette, Code, Layers, FileText, Star, Shuffle, Users } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: User | null;
  allUsers: User[];
  onUserSelect: (user: User) => void;
  sseConnected: boolean;
}

export default function RoleSwitcher({ currentUser, allUsers, onUserSelect, sseConnected }: RoleSwitcherProps) {
  const getIcon = (avatarName: string) => {
    switch (avatarName) {
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-indigo-500" />;
      case 'Palette': return <Palette className="w-5 h-5 text-pink-500" />;
      case 'Code': return <Code className="w-5 h-5 text-emerald-500" />;
      case 'Layers': return <Layers className="w-5 h-5 text-sky-500" />;
      case 'FileText': return <FileText className="w-5 h-5 text-amber-500" />;
      default: return <Users className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-immersive-bg border-b border-immersive-border text-immersive-text-secondary px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
      {/* Platform Branding */}
      <div className="flex items-center gap-2">
        <div className="bg-immersive-accent rounded-lg p-1.5 text-white font-bold font-display tracking-widest text-sm flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          C
        </div>
        <span className="font-display font-bold text-lg text-immersive-text-primary tracking-tight">COLLABIFY</span>
        <span className="text-[10px] bg-immersive-accent/10 text-immersive-accent font-mono px-1.5 py-0.5 rounded border border-immersive-accent/20 select-none">
          B2B FREELANCE HUB
        </span>
      </div>

      {/* Connection State & Simulator Help */}
      <div className="flex items-center gap-3">
        {/* Real-Time Live Status Indicator */}
        <div className="flex items-center gap-1.5 bg-immersive-surface px-2.5 py-1 rounded-full text-xs border border-immersive-border">
          <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-immersive-success animate-pulse' : 'bg-red-500'}`}></span>
          <span className="font-medium text-immersive-text-secondary">
            {sseConnected ? 'Real-Time Sync Online' : 'Connecting Sync...'}
          </span>
        </div>

        {/* Dynamic Persona Switcher instructions */}
        <div className="text-xs text-immersive-text-secondary flex items-center gap-1.5 bg-immersive-accent/5 border border-immersive-accent/10 px-3 py-1 rounded-md hidden md:flex">
          <Shuffle className="w-3.5 h-3.5 text-immersive-accent" />
          <span>Test multiple users in different tabs or switch profiles to simulate real-time bids & chat!</span>
        </div>
      </div>

      {/* Act As Swappable Personas */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-immersive-text-secondary uppercase tracking-wider font-semibold mr-1">Act As:</span>
        <div className="flex flex-wrap gap-1.5">
          {allUsers.map((user) => {
            const isActive = currentUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className={`transition-all duration-200 text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-immersive-accent text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] border border-immersive-accent/40 font-semibold'
                    : 'bg-immersive-surface hover:bg-immersive-surface-bright text-immersive-text-secondary border border-immersive-border'
                }`}
              >
                {getIcon(user.avatar)}
                <span>{user.name}</span>
                <span className={`text-[10px] px-1 rounded uppercase tracking-tight py-0.2 ${
                  isActive 
                    ? 'bg-immersive-accent/50 text-white'
                    : user.role === 'client' ? 'bg-blue-950/40 text-blue-300' : 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/20'
                }`}>
                  {user.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
