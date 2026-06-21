import React, { useState } from 'react';
import { User, JobPost, Proposal } from '../types';
import { 
  Plus, Calendar, DollarSign, Tag, Briefcase, ChevronRight, CheckCircle, 
  XCircle, Award, Hourglass, Activity, FileText, FileSpreadsheet, ArrowUpRight, ChevronDown, Star
} from 'lucide-react';

interface ClientDashboardProps {
  currentUser: User;
  jobPosts: JobPost[];
  proposals: Proposal[];
  onAddJob: (jobData: { title: string; description: string; budget: number; tags: string[] }) => Promise<void>;
  onRespondProposal: (proposalId: string, status: 'accepted' | 'declined') => Promise<void>;
  onUpdateJobStatus: (jobId: string, status: 'open' | 'in_progress' | 'completed') => Promise<void>;
  openChatWithFreelancer: (freelancerId: string, jobPostId: string) => void;
}

export default function ClientDashboard({
  currentUser,
  jobPosts,
  proposals,
  onAddJob,
  onRespondProposal,
  onUpdateJobStatus,
  openChatWithFreelancer
}: ClientDashboardProps) {
  // Local state
  const [activeTab, setActiveTab] = useState<'listings' | 'proposals' | 'contracts'>('listings');
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering data for current client
  const clientJobs = jobPosts.filter(j => j.clientId === currentUser.id);
  const clientJobIds = clientJobs.map(j => j.id);
  const incomingProposals = proposals.filter(p => clientJobIds.includes(p.jobPostId));

  // Count helper stats
  const totalBudgetSpent = clientJobs
    .filter(j => j.status === 'completed')
    .reduce((sum, j) => sum + j.budget, 0);
  
  const activeContractsCount = clientJobs.filter(j => j.status === 'in_progress').length;
  const pendingPropsCount = incomingProposals.filter(p => p.status === 'pending').length;

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newBudget) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const budgetNum = Number(newBudget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        throw new Error('Please enter a valid numeric budget.');
      }
      const tagArray = newTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await onAddJob({
        title: newTitle,
        description: newDesc,
        budget: budgetNum,
        tags: tagArray
      });

      // Clear state
      setNewTitle('');
      setNewDesc('');
      setNewBudget('');
      setNewTags('');
      setIsCreatingJob(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Overview Card & Header Info */}
      <div className="bg-immersive-surface border border-immersive-border rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-immersive-accent/10 rounded-xl flex items-center justify-center border border-immersive-accent/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
              <Briefcase className="w-5 h-5 text-immersive-accent" />
            </div>
            <div>
              <p className="text-xs font-mono text-immersive-text-secondary font-semibold tracking-wider uppercase">CLIENT PORTAL</p>
              <h1 className="font-display font-bold text-2xl text-immersive-text-primary tracking-tight leading-none">
                {currentUser.company || currentUser.name} Workspace
              </h1>
            </div>
          </div>
          <p className="text-sm text-immersive-text-secondary mt-2.5 max-w-xl">
            {currentUser.bio}
          </p>
        </div>

        {/* Create Job CTA */}
        <button
          onClick={() => setIsCreatingJob(true)}
          className="bg-immersive-accent hover:opacity-90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.4)] cursor-pointer select-none border border-immersive-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Project</span>
        </button>
      </div>

      {/* Quick Dashboard Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">Approved Expenditure</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">${totalBudgetSpent.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-950/40 border border-emerald-800/20 rounded-lg flex items-center justify-center text-immersive-success shadow-[0_0_10px_rgba(35,134,54,0.15)]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">Active Contracts</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">{activeContractsCount} Hiring Leads</p>
          </div>
          <div className="w-10 h-10 bg-immersive-accent/10 border border-immersive-accent/20 rounded-lg flex items-center justify-center text-immersive-accent shadow-[0_0_10px_rgba(59,130,246,0.15)]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">Pending Applications</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">{pendingPropsCount} Proposals</p>
          </div>
          <div className="w-10 h-10 bg-amber-950/40 border border-amber-800/20 rounded-lg flex items-center justify-center text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <Hourglass className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">All Listed Postings</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">{clientJobs.length} Jobs Posted</p>
          </div>
          <div className="w-10 h-10 bg-blue-950/40 border border-blue-900/20 rounded-lg flex items-center justify-center text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.15)]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MODAL - Create Job Post */}
      {isCreatingJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-immersive-surface rounded-2xl shadow-2xl max-w-2xl w-full border border-immersive-border overflow-hidden animate-fade-in text-immersive-text-primary">
            <div className="bg-immersive-surface-bright border-b border-immersive-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-immersive-text-primary">Post a New Freelance Project</h2>
              <button 
                onClick={() => setIsCreatingJob(false)}
                className="text-immersive-text-secondary hover:text-immersive-text-primary transition-colors cursor-pointer text-sm"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-950/40 text-red-400 border border-red-800/20 text-xs px-3.5 py-2.5 rounded-lg font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Build Real-Time Collaborative Financial Dashboard"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-immersive-bg border border-immersive-border rounded-xl px-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">Rich Text Description</label>
                <textarea
                  placeholder="Clearly outline the project scope, technical specifications, and expected high-fidelity outcomes."
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-sm bg-immersive-bg border border-immersive-border rounded-xl px-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">Project Budget ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-immersive-text-secondary text-sm">$</span>
                    <input
                      type="number"
                      placeholder="e.g., 5000"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full text-sm bg-immersive-bg border border-immersive-border rounded-xl pl-8 pr-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">Technical Tag Requirements</label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Tailwind (comma-separated)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-sm bg-immersive-bg border border-immersive-border rounded-xl px-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-immersive-border">
                <button
                  type="button"
                  onClick={() => setIsCreatingJob(false)}
                  className="text-immersive-text-secondary hover:text-immersive-text-primary text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-immersive-accent hover:opacity-90 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-[0_4px_12px_rgba(59,130,246,0.4)]"
                >
                  {isSubmitting ? 'Posting...' : 'Create Listing'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB CONTROLS */}
      <div className="bg-immersive-surface p-1.5 rounded-xl inline-flex gap-1.5 border border-immersive-border">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'listings' ? 'bg-immersive-bg text-immersive-text-primary border border-immersive-border/30 shadow-inner' : 'text-immersive-text-secondary hover:text-immersive-text-primary'
          }`}
        >
          My Listed Jobs ({clientJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'proposals' ? 'bg-immersive-bg text-immersive-text-primary border border-immersive-border/30 shadow-inner' : 'text-immersive-text-secondary hover:text-immersive-text-primary'
          }`}
        >
          Incoming Proposals ({incomingProposals.length})
          {pendingPropsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'contracts' ? 'bg-immersive-bg text-immersive-text-primary border border-immersive-border/30 shadow-inner' : 'text-immersive-text-secondary hover:text-immersive-text-primary'
          }`}
        >
          Active Contracts ({clientJobs.filter(j => j.status === 'in_progress' || j.status === 'completed').length})
        </button>
      </div>

      {/* TAB 1: JOB LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {clientJobs.length === 0 ? (
            <div className="bg-immersive-surface border border-immersive-border rounded-xl p-10 text-center text-immersive-text-secondary">
              <FileText className="w-10 h-10 mx-auto text-immersive-text-secondary/40 mb-2" />
              <p className="font-medium text-sm text-immersive-text-primary">No job posts listed yet.</p>
              <p className="text-xs text-immersive-text-secondary/80 mt-1">Get started by creating your very first project post.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {clientJobs.map((job) => (
                <div key={job.id} className="bg-immersive-surface border border-immersive-border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between hover:border-immersive-accent/40 transition-colors">
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-display font-semibold text-immersive-text-primary text-sm hover:text-immersive-accent transition-colors">
                        {job.title}
                      </h3>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold border ${
                        job.status === 'open' 
                          ? 'bg-sky-950/40 text-sky-400 border-sky-800/30'
                          : job.status === 'in_progress'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-800/30'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30'
                      }`}>
                        {job.status === 'in_progress' ? 'Hired' : job.status}
                      </span>
                    </div>

                    <p className="text-xs text-immersive-text-secondary mt-2 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {job.tags.map(t => (
                        <span key={t} className="bg-immersive-surface-bright text-[10px] text-immersive-accent border border-immersive-border px-2 py-0.5 rounded font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-immersive-border mt-5 pt-3.5 flex items-center justify-between text-xs text-immersive-text-secondary">
                    <span className="font-semibold text-immersive-text-primary font-mono">${job.budget.toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING PROPOSALS */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          {incomingProposals.length === 0 ? (
            <div className="bg-immersive-surface border border-immersive-border rounded-xl p-10 text-center text-immersive-text-secondary">
              <Hourglass className="w-10 h-10 mx-auto text-immersive-text-secondary/40 mb-2" />
              <p className="font-medium text-sm text-immersive-text-primary">No incoming proposals yet.</p>
              <p className="text-xs text-immersive-text-secondary/80 mt-1">Simulate application flow by switching roles to a freelancer and submitting a pitch!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingProposals.map((prop) => (
                <div key={prop.id} className="bg-immersive-surface border border-immersive-border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] space-y-4 hover:border-immersive-accent/40 transition-colors">
                  {/* Proposal Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-immersive-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-immersive-surface-bright text-immersive-text-primary flex items-center justify-center font-display font-semibold border border-immersive-border shadow-inner">
                        {prop.freelancer?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-display font-semibold text-immersive-text-primary text-sm">
                          <span>{prop.freelancer?.name}</span>
                          <span className="text-xs font-normal text-immersive-text-secondary flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {prop.freelancer?.rating}
                          </span>
                        </div>
                        <p className="text-xs text-immersive-text-secondary">{prop.freelancer?.title}</p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs font-mono text-immersive-text-secondary">PROPOSAL BID</p>
                      <p className="font-display font-bold text-immersive-text-primary text-base">
                        ${prop.bidAmount.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-immersive-text-secondary">in {prop.estimatedDays} days</span>
                      </p>
                    </div>
                  </div>

                  {/* Pitch and Details */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider">
                      Applied For:{' '}
                      <span className="text-immersive-accent font-medium normal-case block sm:inline">
                        {prop.jobTitle}
                      </span>
                    </div>

                    <div className="bg-immersive-bg text-xs p-3.5 rounded-lg border border-immersive-border font-mono text-immersive-text-primary whitespace-pre-line leading-relaxed">
                      {prop.coverLetter}
                    </div>
                  </div>

                  {/* Actions & Chat Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      onClick={() => prop.freelancerId && openChatWithFreelancer(prop.freelancerId, prop.jobPostId)}
                      className="text-xs font-semibold text-immersive-accent hover:text-white flex items-center gap-1 border border-immersive-accent/30 hover:bg-immersive-accent/15 px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Chat / Negotiate Details
                    </button>

                    <div className="flex items-center gap-2">
                      {prop.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => onRespondProposal(prop.id, 'declined')}
                            className="bg-immersive-surface-bright hover:bg-immersive-border text-immersive-text-primary text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-immersive-border"
                          >
                            <XCircle className="w-3.5 h-3.5 text-immersive-text-secondary" />
                            Decline
                          </button>
                          <button
                            onClick={() => onRespondProposal(prop.id, 'accepted')}
                            className="bg-immersive-accent hover:opacity-90 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-immersive-accent/20 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept & Start Contract
                          </button>
                        </>
                      ) : (
                        <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 uppercase font-mono ${
                          prop.status === 'accepted'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/30'
                            : 'bg-immersive-surface-bright text-immersive-text-secondary border-immersive-border'
                        }`}>
                          {prop.status === 'accepted' ? (
                            <>
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              Hired & Working
                            </>
                          ) : (
                            'Declined'
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONTRACT STATUS MANAGER */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {clientJobs.filter(j => j.status === 'in_progress' || j.status === 'completed').length === 0 ? (
            <div className="bg-immersive-surface border border-immersive-border rounded-xl p-10 text-center text-immersive-text-secondary">
              <Award className="w-10 h-10 mx-auto text-immersive-text-secondary/40 mb-2" />
              <p className="font-medium text-sm text-immersive-text-primary">No active project contracts available.</p>
              <p className="text-xs text-immersive-text-secondary/80 mt-1">Accept a freelancer proposal to create and activate a project contract.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientJobs.filter(j => j.status === 'in_progress' || j.status === 'completed').map((job) => {
                // Find hired freelancer
                const acceptedProposal = proposals.find(p => p.jobPostId === job.id && p.status === 'accepted');
                const hiredUser = acceptedProposal?.freelancer;

                return (
                  <div key={job.id} className="bg-immersive-surface border border-immersive-border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-immersive-border">
                      <div>
                        <h4 className="font-display font-bold text-immersive-text-primary text-sm">{job.title}</h4>
                        <p className="text-xs text-immersive-text-secondary mt-1 flex items-center gap-2 font-mono">
                          <span>Budget: <strong className="text-immersive-text-primary">${job.budget.toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>Partner: <strong className="text-immersive-accent">{hiredUser?.name || 'Assigned Freelancer'}</strong></span>
                        </p>
                      </div>

                      {/* CONTRACT PROGRESS STAGES */}
                      <div className="flex items-center gap-1 bg-immersive-bg px-3 py-1.5 rounded-lg border border-immersive-border text-xs text-immersive-text-secondary font-mono font-semibold">
                        <span className={job.status === 'in_progress' ? 'text-immersive-accent' : 'text-immersive-text-secondary/60'}>Hired</span>
                        <ChevronRight className="w-3 h-3 text-immersive-border" />
                        <span className="text-immersive-text-secondary/60">Under Review</span>
                        <ChevronRight className="w-3 h-3 text-immersive-border" />
                        <span className={job.status === 'completed' ? 'text-immersive-success font-bold' : 'text-immersive-text-secondary/60'}>Approved & Paid</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="text-xs text-immersive-text-secondary leading-relaxed max-w-xl">
                        {job.status === 'in_progress' ? (
                          <span className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/30 p-3 rounded-lg font-mono">
                            <Hourglass className="w-4 h-4 text-amber-500 animate-spin" />
                            Developer is actively working on implementation. Leverage the chat window to receive direct source code updates or PDF brief review.
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 p-3 rounded-lg font-mono">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            This milestone has been approved, marked as completed, and secure funds have been disbursed to {hiredUser?.name || 'freelancer'}.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status === 'in_progress' ? (
                          <>
                            <button
                              onClick={() => hiredUser && openChatWithFreelancer(hiredUser.id, job.id)}
                              className="text-xs text-immersive-accent font-semibold border border-immersive-accent/30 px-3.5 py-2 rounded-lg hover:bg-immersive-accent/11 transition-colors cursor-pointer"
                            >
                              Message Developer
                            </button>
                            <button
                              onClick={() => onUpdateJobStatus(job.id, 'completed')}
                              className="bg-immersive-success hover:opacity-90 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/20 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve & Complete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onUpdateJobStatus(job.id, 'in_progress')}
                            className="bg-immersive-surface-bright hover:bg-immersive-border text-immersive-text-primary text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-immersive-border"
                          >
                            Re-Open Milestone
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
