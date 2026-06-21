import React, { useState, useMemo } from 'react';
import { User, JobPost, Proposal } from '../types';
import { 
  Search, SlidersHorizontal, ArrowUpRight, Award, Calendar, DollarSign, Tag, 
  ChevronRight, Filter, AlertCircle, FileText, CheckCircle2, ShieldAlert,
  Send, Sparkles, SendHorizontal, Star, Plus, Hourglass, XCircle
} from 'lucide-react';

interface FreelancerDashboardProps {
  currentUser: User;
  jobPosts: JobPost[];
  proposals: Proposal[];
  onSubmitProposal: (proposalData: {
    jobPostId: string;
    bidAmount: number;
    coverLetter: string;
    estimatedDays: number;
  }) => Promise<void>;
  openChatWithClient: (clientId: string, jobPostId: string) => void;
}

export default function FreelancerDashboard({
  currentUser,
  jobPosts,
  proposals,
  onSubmitProposal,
  openChatWithClient
}: FreelancerDashboardProps) {
  // Navigation states
  const [activeTab, setActiveTab ] = useState<'feed' | 'my_pitches'>('feed');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('all'); // 'all' | 'low' (<2000) | 'mid' (2000-5000) | 'high' (>5000)
  const [onlyOpen, setOnlyOpen] = useState(true);

  // Proposal Submission Form states
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 1. Gather all unique tag lists from available job posts for quick click-filtering
  const allUniqueTags = useMemo(() => {
    const tags = new Set<string>();
    jobPosts.forEach(j => j.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [jobPosts]);

  // 2. Filter Job Feed based on active sliders and keywords
  const filteredJobs = useMemo(() => {
    return jobPosts.filter(job => {
      // Filter status
      if (onlyOpen && job.status !== 'open') return false;

      // Filter text query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesDesc = job.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Filter target tech tags
      if (selectedTag && !job.tags?.includes(selectedTag)) {
        return false;
      }

      // Filter budget brackets
      if (budgetRange !== 'all') {
        if (budgetRange === 'low' && job.budget >= 2000) return false;
        if (budgetRange === 'mid' && (job.budget < 2000 || job.budget > 5000)) return false;
        if (budgetRange === 'high' && job.budget <= 5000) return false;
      }

      return true;
    });
  }, [jobPosts, searchQuery, selectedTag, budgetRange, onlyOpen]);

  // 3. Gather pitches submitted by this freelancer
  const myProposals = useMemo(() => {
    return proposals.filter(p => p.freelancerId === currentUser.id);
  }, [proposals, currentUser]);

  // Calculations for Stats Card
  const activeContractsCount = myProposals.filter(p => {
    const job = jobPosts.find(j => j.id === p.jobPostId);
    return p.status === 'accepted' && job?.status === 'in_progress';
  }).length;

  const totalEarningsEarned = myProposals
    .filter(p => {
      const job = jobPosts.find(j => j.id === p.jobPostId);
      return p.status === 'accepted' && job?.status === 'completed';
    })
    .reduce((sum, p) => sum + p.bidAmount, 0);

  // Apply workflow
  const handleOpenApply = (job: JobPost) => {
    // Populate default competitive bid matching listed budget
    setApplyingJob(job);
    setBidAmount(job.budget.toString());
    setCoverLetter('');
    setEstimatedDays('10');
    setFormError('');
    setSubmitSuccess(false);
  };

  const handlePostProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    if (!bidAmount || !coverLetter.trim() || !estimatedDays) {
      setFormError('Please complete all pricing and delivery timeline parameters.');
      return;
    }

    const bidNum = Number(bidAmount);
    const dayNum = Number(estimatedDays);

    if (isNaN(bidNum) || bidNum <= 0) {
      setFormError('Please enter a valid numeric bid amount.');
      return;
    }
    if (isNaN(dayNum) || dayNum <= 0) {
      setFormError('Please enter a valid amount of delivery days.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await onSubmitProposal({
        jobPostId: applyingJob.id,
        bidAmount: bidNum,
        coverLetter,
        estimatedDays: dayNum
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setApplyingJob(null);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Could not post proposal bid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Freelancer Profile Header Banner */}
      <div className="bg-immersive-surface border border-immersive-border rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-immersive-surface-bright rounded-xl flex items-center justify-center border border-immersive-border shadow-inner">
              <Award className="w-5 h-5 text-immersive-accent" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-immersive-text-secondary font-semibold tracking-wider uppercase">FREELANCER HUB</p>
              <h1 className="font-display font-bold text-2xl text-immersive-text-primary tracking-tight leading-none">
                {currentUser.name} Console
              </h1>
            </div>
          </div>
          <p className="text-sm font-semibold text-immersive-accent mt-2">{currentUser.title}</p>
          <p className="text-sm text-immersive-text-secondary mt-1 max-w-2xl leading-relaxed">
            {currentUser.bio}
          </p>
        </div>

        {/* Dynamic score summary */}
        <div className="flex items-center gap-4 bg-immersive-surface-bright border border-immersive-border p-4 rounded-xl self-stretch md:self-auto justify-around">
          <div className="text-center px-2">
            <span className="text-[10px] font-mono text-immersive-text-secondary font-semibold block uppercase">Rating</span>
            <span className="font-display font-bold text-immersive-text-primary text-lg">★ {currentUser.rating.toFixed(1)}</span>
          </div>
          <div className="w-px h-8 bg-immersive-border" />
          <div className="text-center px-2">
            <span className="text-[10px] font-mono text-immersive-text-secondary font-semibold block uppercase">Settled Projects</span>
            <span className="font-display font-bold text-immersive-text-primary text-lg">{currentUser.completedJobs}+ Done</span>
          </div>
        </div>
      </div>

      {/* FREELANCE PERFORMANCE COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">Settled Earnings</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">${totalEarningsEarned.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-950/40 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-850/30">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">Submitted Pitches</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">{myProposals.length} Proposals</p>
          </div>
          <div className="w-10 h-10 bg-immersive-surface-bright rounded-lg flex items-center justify-center text-immersive-accent border border-immersive-border">
            <SendHorizontal className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-immersive-surface border border-immersive-border p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-mono text-immersive-text-secondary font-semibold uppercase tracking-wider">Hired Milestones</span>
            <p className="text-2xl font-semibold font-display text-immersive-text-primary mt-1">{activeContractsCount} In Progress</p>
          </div>
          <div className="w-10 h-10 bg-amber-950/40 rounded-lg flex items-center justify-center text-amber-400 border border-amber-850/30">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="bg-immersive-surface p-1.5 rounded-xl inline-flex gap-1.5 border border-immersive-border">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'feed' ? 'bg-immersive-surface-bright text-immersive-accent border border-immersive-border' : 'text-immersive-text-secondary hover:text-immersive-text-primary'
          }`}
        >
          Explore Smart Job Feed ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('my_pitches')}
          className={`px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            activeTab === 'my_pitches' ? 'bg-immersive-surface-bright text-immersive-accent border border-immersive-border' : 'text-immersive-text-secondary hover:text-immersive-text-primary'
          }`}
        >
          My Active Pitches ({myProposals.length})
        </button>
      </div>

      {/* TAB 1: SMART JOB FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER CONTROLS BAR */}
          <div className="bg-immersive-surface border border-immersive-border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search inputs */}
            <div className="relative md:col-span-2">
              <span className="absolute left-3 top-3.5 text-immersive-text-secondary">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search jobs by keyword, tech, scope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-immersive-text-primary bg-immersive-bg border border-immersive-border rounded-lg pl-9 pr-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
              />
            </div>

            {/* Budget Brackets */}
            <div>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full text-xs text-immersive-text-primary bg-immersive-bg border border-immersive-border rounded-lg px-3 py-2.5 focus:border-immersive-accent focus:outline-hidden"
              >
                <option value="all" className="bg-immersive-bg text-immersive-text-primary">Any Budget Range</option>
                <option value="low" className="bg-immersive-bg text-immersive-text-primary">Low Venture (&lt; $2,000)</option>
                <option value="mid" className="bg-immersive-bg text-immersive-text-primary">Mid Scope ($2,000 - $5,000)</option>
                <option value="high" className="bg-immersive-bg text-immersive-text-primary">Enterprise Core (&gt; $5,000)</option>
              </select>
            </div>

            {/* Target Status Check Toggle */}
            <div className="flex items-center justify-end">
              <label className="flex items-center gap-2 text-xs font-medium text-immersive-text-secondary select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOpen}
                  onChange={(e) => setOnlyOpen(e.target.checked)}
                  className="rounded text-immersive-accent focus:ring-immersive-accent w-4 h-4 bg-immersive-bg border-immersive-border"
                />
                Show Only Open Jobs
              </label>
            </div>
          </div>

          {/* Quick Filter Tag Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase text-immersive-text-secondary tracking-wider">Quick Tag Filter:</span>
            <button
              onClick={() => setSelectedTag('')}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                selectedTag === '' 
                  ? 'bg-immersive-accent text-white' 
                  : 'bg-immersive-surface text-immersive-text-secondary hover:bg-immersive-surface-bright hover:text-immersive-text-primary border border-immersive-border'
              }`}
            >
              All Tech
            </button>
            {allUniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                  selectedTag === tag 
                    ? 'bg-immersive-accent text-white' 
                    : 'bg-immersive-surface text-immersive-text-secondary hover:bg-immersive-surface-bright hover:text-immersive-text-primary border border-immersive-border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* LATEST JOB INDEX LIST */}
          {filteredJobs.length === 0 ? (
            <div className="bg-immersive-surface border border-immersive-border rounded-xl p-10 text-center text-immersive-text-secondary">
              <AlertCircle className="w-10 h-10 mx-auto text-immersive-text-secondary/40 mb-2" />
              <p className="font-medium text-sm text-immersive-text-primary">No matching job posts found.</p>
              <p className="text-xs text-immersive-text-secondary/80 mt-1">Try broadening your search keywords or removing active tags.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                // Check if freelancer already applied
                const alreadyApplied = myProposals.some(p => p.jobPostId === job.id);
                const currentPitch = myProposals.find(p => p.jobPostId === job.id);

                return (
                  <div key={job.id} className="bg-immersive-surface border border-immersive-border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-immersive-accent/30 transition-colors">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-immersive-surface-bright text-immersive-accent border border-immersive-border px-2 py-0.5 rounded uppercase font-mono tracking-tight">
                          #{job.id}
                        </span>
                        <span className="text-xs text-immersive-text-secondary flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        {alreadyApplied && (
                          <span className={`text-[9px] font-bold uppercase tracking-tight py-0.5 px-2 rounded-md font-mono ${
                            currentPitch?.status === 'accepted'
                              ? 'bg-emerald-950/40 text-emerald-450 border border-emerald-800/30'
                              : currentPitch?.status === 'declined'
                                ? 'bg-red-950/40 text-red-400 border border-red-800/30'
                                : 'bg-immersive-surface-bright text-immersive-text-secondary border border-immersive-border'
                          }`}>
                            Applied • {currentPitch?.status}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-immersive-text-primary text-base leading-tight">
                        {job.title}
                      </h3>

                      <p className="text-xs text-immersive-text-secondary leading-relaxed max-w-3xl">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {job.tags?.map(t => (
                          <span key={t} className="bg-immersive-surface-bright border border-immersive-border text-[10px] text-immersive-text-secondary font-semibold px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Costing & Action column */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-immersive-border pt-4 md:pt-0 gap-3 min-w-[140px]">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-immersive-text-secondary">Budget Range</p>
                        <p className="text-lg font-display font-semibold text-immersive-text-primary">${job.budget.toLocaleString()}</p>
                      </div>

                      {alreadyApplied ? (
                        <button
                          onClick={() => currentPitch && openChatWithClient(job.clientId, job.id)}
                          className="text-xs font-semibold text-immersive-accent hover:text-white border border-immersive-accent/30 hover:bg-immersive-accent/15 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Chat Live Briefing
                        </button>
                      ) : job.status === 'open' ? (
                        <button
                          onClick={() => handleOpenApply(job)}
                          className="bg-immersive-accent hover:opacity-90 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          Submit Pitch
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="text-[10px] uppercase font-mono font-semibold py-1 px-2.5 rounded bg-immersive-surface-bright text-immersive-text-secondary border border-immersive-border">
                          Milestone Hired
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY COMPLETED PITCHES / PROPOSALS */}
      {activeTab === 'my_pitches' && (
        <div className="space-y-4">
          {myProposals.length === 0 ? (
            <div className="bg-immersive-surface border border-immersive-border rounded-xl p-10 text-center text-immersive-text-secondary">
              <FileText className="w-10 h-10 mx-auto text-immersive-text-secondary/40 mb-2" />
              <p className="font-medium text-sm text-immersive-text-primary">You haven't submitted any pitches yet.</p>
              <p className="text-xs text-immersive-text-secondary/80 mt-1">Check out open items in the Job Feed to apply.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myProposals.map((prop) => {
                const associatedJob = jobPosts.find(j => j.id === prop.jobPostId);

                return (
                  <div key={prop.id} className="bg-immersive-surface border border-immersive-border rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] space-y-3 hover:border-immersive-accent/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-immersive-border">
                      <div>
                        <span className="text-[10px] font-mono font-semibold bg-immersive-surface-bright border border-immersive-border text-immersive-accent rounded px-1.5 py-0.5">
                          Pitch ID #{prop.id}
                        </span>
                        <h4 className="font-display font-bold text-immersive-text-primary text-sm mt-1.5">
                          {prop.jobTitle}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded border ${
                          prop.status === 'accepted'
                            ? 'bg-emerald-950/40 text-emerald-450 border border-emerald-800/30'
                            : prop.status === 'declined'
                              ? 'bg-red-950/40 text-red-400 border border-red-800/30'
                              : 'bg-immersive-surface-bright text-immersive-text-secondary border-immersive-border'
                        }`}>
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono py-1.5 text-immersive-text-secondary">
                      <div>
                        <span>Bid Offer: <strong className="text-immersive-text-primary">${prop.bidAmount.toLocaleString()}</strong></span>
                      </div>
                      <div>
                        <span>Estimated Work: <strong className="text-immersive-text-primary">{prop.estimatedDays} Days</strong></span>
                      </div>
                      <div>
                        <span>Project Status: <strong className="text-immersive-accent">{associatedJob?.status || 'Active'}</strong></span>
                      </div>
                    </div>

                    <div className="bg-immersive-bg text-xs text-immersive-text-primary font-mono p-3 rounded-lg border border-immersive-border whitespace-pre-line leading-relaxed">
                      {prop.coverLetter}
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        onClick={() => associatedJob && openChatWithClient(associatedJob.clientId, associatedJob.id)}
                        className="text-xs font-semibold text-immersive-accent hover:text-white flex items-center gap-1 border border-immersive-accent/30 hover:bg-immersive-accent/15 px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Discuss inside workspace chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MULTI-STEP PROPOSAL MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 bg-immersive-bg/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-immersive-surface rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] max-w-2xl w-full border border-immersive-border overflow-hidden animate-fade-in">
            <div className="bg-immersive-surface-bright px-6 py-4 flex items-center justify-between border-b border-immersive-border text-white">
              <div>
                <p className="text-[10px] font-mono text-immersive-accent font-semibold uppercase tracking-widest">PROPOSAL BID ENGINE</p>
                <h2 className="font-display font-bold text-base text-immersive-text-primary line-clamp-1">{applyingJob.title}</h2>
              </div>
              <button 
                onClick={() => setApplyingJob(null)}
                className="text-immersive-text-secondary hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-850/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-medium text-immersive-text-primary">Proposal Transmitted Securely</h3>
                <p className="text-xs text-immersive-text-secondary">Your bid price and cover specs have been broadcast to the client dashboard.</p>
              </div>
            ) : (
              <form onSubmit={handlePostProposal} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-red-950/40 text-red-400 border border-red-800/30 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-0 shrink-0" />
                    <span className="font-medium">{formError}</span>
                  </div>
                )}

                <div className="p-4 bg-immersive-bg border border-immersive-border rounded-xl space-y-1 text-xs">
                  <p className="text-immersive-text-secondary font-sans tracking-tight">
                    You are applying to <strong className="text-immersive-text-primary">{applyingJob.title}</strong> with a listed budget range of <strong className="text-immersive-text-primary">${applyingJob.budget.toLocaleString()}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">My Bid Amount (USD $)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-immersive-text-secondary text-sm font-mono">$</span>
                      <input
                        type="number"
                        placeholder={applyingJob.budget.toString()}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full text-xs font-mono text-immersive-text-primary bg-immersive-bg border border-immersive-border rounded-lg pl-8 pr-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">Delivery Time (Days)</label>
                    <input
                      type="number"
                      placeholder="e.g., 10"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="w-full text-xs font-mono text-immersive-text-primary bg-immersive-bg border border-immersive-border rounded-lg px-4 py-2.5 focus:border-immersive-accent focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-immersive-text-secondary uppercase tracking-wider mb-1.5">Pitch Cover Letter</label>
                  <textarea
                    rows={5}
                    placeholder="Hello! Introduce yourself, explain your relevant expertise, outline your proposed technical stack details, and pitch why you are the best fit..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full text-xs text-immersive-text-primary bg-immersive-bg border border-immersive-border rounded-lg px-4 py-2.5 focus:border-immersive-accent focus:outline-hidden leading-relaxed"
                    required
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-immersive-border">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="text-immersive-text-secondary hover:text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-immersive-accent hover:opacity-90 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer text-center"
                  >
                    {isSubmitting ? 'Submitting Pitch...' : 'Transmit Proposal'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
