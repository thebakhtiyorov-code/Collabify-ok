import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { JobPost, Proposal, Message, ChatRoom, User } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enlarge payload size to support base64 document attachments in Chat
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- PRE-SEEDED MEMORY DATABASE ---
  
  const users: User[] = [
    {
      id: 'c1',
      name: 'TechStart Inc.',
      role: 'client',
      email: 'hiring@techstart.io',
      company: 'TechStart Inc.',
      avatar: 'Briefcase',
      bio: 'Fast-growing high-tech startup building next-gen SaaS platforms for the developer tools space.',
      rating: 4.9,
      completedJobs: 14
    },
    {
      id: 'c2',
      name: 'AURA Digital & Design',
      role: 'client',
      email: 'partners@auradigital.co',
      company: 'AURA Digital Studio',
      avatar: 'Palette',
      bio: 'Bespoke design and brand agency working with Fortune 500 companies to build premium user experiences.',
      rating: 4.8,
      completedJobs: 32
    },
    {
      id: 'f1',
      name: 'Alex Rivera',
      role: 'freelancer',
      email: 'alex.rivera@fullstack.dev',
      title: 'Lead Full-Stack React & Node Engineer',
      avatar: 'Code',
      bio: 'Ex-Stripe Senior Engineer specializing in ultra-performant React architectures, Node.js state coordination, and real-time dashboard systems.',
      rating: 5.0,
      completedJobs: 27
    },
    {
      id: 'f2',
      name: 'Sarah Chen',
      role: 'freelancer',
      email: 'sarah.ux@designstudio.com',
      title: 'Senior Product Designer & Interaction Specialist',
      avatar: 'Layers',
      bio: 'Award-winning product designer focused on bespoke Tailwind branding, clean typography grids, and micro-interactions with Framer Motion.',
      rating: 4.9,
      completedJobs: 41
    },
    {
      id: 'f3',
      name: 'Liam Vance',
      role: 'freelancer',
      email: 'liam.vance@techcopy.io',
      title: 'Technical Copywriter & SEO Strategist',
      avatar: 'FileText',
      bio: 'Expert B2B and SaaS copywriter writing polished developer documentation, whitepapers, and customer-facing landing page copies.',
      rating: 4.7,
      completedJobs: 19
    }
  ];

  let jobPosts: JobPost[] = [
    {
      id: 'job1',
      clientId: 'c1',
      title: 'Build Real-Time Collaborative Financial Dashboard',
      description: 'We are seeking an expert React/TypeScript developer to architect a robust dashboard. The ideal build supports multi-user tracking, synchronized charts (via recharts or d3), high-fidelity transaction timelines, and smooth state updates. Needs to be extremely responsive and support real-time data streaming simulation.',
      budget: 8500,
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
      status: 'open',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() // 3 days ago
    },
    {
      id: 'job2',
      clientId: 'c2',
      title: 'High-Fidelity Tailwind Marketing Brand Redesign',
      description: 'Looking for a premium web designer with high attention to detail who can construct a stunning responsive homepage. Must leverage custom Tailwind designs, gorgeous spacing, fluid motion/spring-based animations, and responsive typography hierarchies. Deliverables include final code files and source assets.',
      budget: 4200,
      tags: ['Tailwind CSS', 'Framer Motion', 'Web Design'],
      status: 'open',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() // 1 day ago
    },
    {
      id: 'job3',
      clientId: 'c1',
      title: 'Express REST & SSE Communication Gateway Server',
      description: 'Need a developer to design and optimize a super high-performing in-memory cache and Server-Sent Events dispatch mechanism using Node.js/Express. Must include comprehensive integration testing and clean API standards.',
      budget: 3500,
      tags: ['Node.js', 'Express', 'API Design'],
      status: 'completed',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() // 10 days ago
    }
  ];

  let proposals: Proposal[] = [
    {
      id: 'prop1',
      jobPostId: 'job1',
      freelancerId: 'f1',
      bidAmount: 8000,
      coverLetter: 'Hi team! This project aligns perfectly with my background. I spent 4 years as a Lead Engineer on financial interfaces. I can deliver a clean, componentized React application adhering to your spec. I will structure it modularly to support easy real-time syncing using SSE/WebSockets, complete with beautiful Recharts components or smooth state updates. I can start immediately.',
      estimatedDays: 14,
      status: 'pending'
    },
    {
      id: 'prop2',
      jobPostId: 'job1',
      freelancerId: 'f2',
      bidAmount: 9000,
      coverLetter: 'Hello! While I am primarily a UI/UX speciallist, I have extensive experience building dynamic web dashboards using TypeScript and Tailwind CSS. I would love to pair with a back-end developer or take the front-end layout to the next level with customized grids, bento sections, and beautiful interactive feedback systems.',
      estimatedDays: 20,
      status: 'pending'
    },
    {
      id: 'prop3',
      jobPostId: 'job2',
      freelancerId: 'f2',
      bidAmount: 4200,
      coverLetter: 'Greetings Aura team! I specialize in bespoke corporate web redesigns. I have built over 25 responsive landing pages using Tailwind and spring-based transition motion. Please look at my portfolio. I will focus deeply on typographic rhythms, generous negative spacing, and ultra-smooth layouts that match your premium design aesthetic.',
      estimatedDays: 10,
      status: 'pending'
    }
  ];

  let chatRooms: ChatRoom[] = [
    {
      id: 'room1',
      clientId: 'c1',
      freelancerId: 'f1',
      jobPostId: 'job1',
      jobTitle: 'Build Real-Time Collaborative Financial Dashboard',
      clientName: 'TechStart Inc.',
      freelancerName: 'Alex Rivera'
    }
  ];

  let messages: Message[] = [
    {
      id: 'm1',
      chatRoomId: 'room1',
      senderId: 'c1',
      text: 'Hi Alex! We loved your proposal for the Financial Dashboard. Your background at Stripe is very impressive.',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() // 2 hours ago
    },
    {
      id: 'm2',
      chatRoomId: 'room1',
      senderId: 'f1',
      text: 'Thanks! I appreciate that. I have built several financial dashboards and understand how vital smooth state charts and instant responsiveness are for transactional data.',
      timestamp: new Date(Date.now() - 1 * 3600 * 1000 - 45 * 60 * 1000).toISOString() // 1h 45m ago
    },
    {
      id: 'm3',
      chatRoomId: 'room1',
      senderId: 'c1',
      text: 'Fantastic! I uploaded the PDF specifications files for security review. Let us coordinate budget specifics here.',
      timestamp: new Date(Date.now() - 1 * 3600 * 1000 - 30 * 60 * 1000).toISOString(),
      attachments: [
        { name: 'Financial_Spec_v2.pdf', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=100', size: '1.4 MB' }
      ]
    }
  ];

  // --- REALTIME STREAM MECHANISM (Server-Sent Events) ---
  let sseClients: { id: string; res: express.Response }[] = [];

  function broadcast(event: { type: string; payload: any }) {
    console.log(`[SSE Broadcast] Event: ${event.type}`);
    const data = `data: ${JSON.stringify(event)}\n\n`;
    sseClients.forEach(client => {
      try {
        client.res.write(data);
      } catch (err) {
        console.error('Failed to write to client event-stream', err);
      }
    });
  }

  // SSE endpoint
  app.get('/api/realtime/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    // Send initial keep-alive comment
    res.write(':ok\n\n');

    const clientId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4);
    sseClients.push({ id: clientId, res });
    console.log(`[SSE Connect] Client ${clientId} connected. Total active: ${sseClients.length}`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
      console.log(`[SSE Disconnect] Client ${clientId} disconnected. Total active: ${sseClients.length}`);
    });
  });

  // --- API ROUTE RESTRUCTURING ---

  // Get users catalog
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  // Job feeds (CRUD)
  app.get('/api/jobs', (req, res) => {
    res.json(jobPosts);
  });

  app.post('/api/jobs', (req, res) => {
    const { title, description, budget, tags, clientId } = req.body;
    if (!title || !description || !budget || !clientId) {
      return res.status(400).json({ error: 'Title, description, budget, and clientId are required.' });
    }

    const newJob: JobPost = {
      id: 'job' + (jobPosts.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      clientId,
      title,
      description,
      budget: Number(budget),
      tags: Array.isArray(tags) ? tags : [],
      status: 'open',
      createdAt: new Date().toISOString()
    };

    jobPosts.unshift(newJob);
    
    // Broadcast creation to all connected web clients in real-time
    broadcast({ type: 'job_created', payload: newJob });

    res.status(201).json(newJob);
  });

  app.put('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    const { status, title, description, budget, tags } = req.body;
    
    const index = jobPosts.findIndex(j => j.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const updatedJob = {
      ...jobPosts[index],
      ...(status && { status }),
      ...(title && { title }),
      ...(description && { description }),
      ...(budget && { budget: Number(budget) }),
      ...(tags && { tags })
    };

    jobPosts[index] = updatedJob;

    broadcast({ type: 'job_updated', payload: updatedJob });
    res.json(updatedJob);
  });

  // Proposal management
  app.get('/api/proposals', (req, res) => {
    // Decorate proposals with freelancer info
    const fullProposals = proposals.map(p => {
      const freelancer = users.find(u => u.id === p.freelancerId);
      const job = jobPosts.find(j => j.id === p.jobPostId);
      return {
        ...p,
        freelancer,
        jobTitle: job?.title || 'Unknown Job'
      };
    });
    res.json(fullProposals);
  });

  app.post('/api/proposals', (req, res) => {
    const { jobPostId, freelancerId, bidAmount, coverLetter, estimatedDays } = req.body;
    
    if (!jobPostId || !freelancerId || !bidAmount || !coverLetter || !estimatedDays) {
      return res.status(400).json({ error: 'Incomplete proposal details.' });
    }

    // Check if proposal already exists from this freelancer for this job
    const existing = proposals.find(p => p.jobPostId === jobPostId && p.freelancerId === freelancerId);
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this job.' });
    }

    const newProposal: Proposal = {
      id: 'prop' + (proposals.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      jobPostId,
      freelancerId,
      bidAmount: Number(bidAmount),
      coverLetter,
      estimatedDays: Number(estimatedDays),
      status: 'pending'
    };

    proposals.push(newProposal);

    // Decorate it
    const freelancerInfo = users.find(u => u.id === freelancerId);
    const jobInfo = jobPosts.find(j => j.id === jobPostId);
    const decoratedProposal = {
      ...newProposal,
      freelancer: freelancerInfo,
      jobTitle: jobInfo?.title || 'Unknown Job'
    };

    // Broadcast in real-time
    broadcast({ type: 'proposal_created', payload: decoratedProposal });

    res.status(201).json(decoratedProposal);
  });

  app.put('/api/proposals/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' | 'declined'

    if (!['accepted', 'declined', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid proposal status.' });
    }

    const index = proposals.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Proposal not found.' });
    }

    const originalProposal = proposals[index];
    originalProposal.status = status;

    // Decorate
    const freelancerInfo = users.find(u => u.id === originalProposal.freelancerId);
    const jobInfo = jobPosts.find(j => j.id === originalProposal.jobPostId);
    const updatedDecorated = {
      ...originalProposal,
      freelancer: freelancerInfo,
      jobTitle: jobInfo?.title || 'Unknown Job'
    };

    // Side effect check: If accepted, set job's status to 'in_progress' and decline other proposals for the same job
    if (status === 'accepted' && jobInfo) {
      const jobIdx = jobPosts.findIndex(j => j.id === jobInfo.id);
      if (jobIdx !== -1) {
        jobPosts[jobIdx].status = 'in_progress';
        broadcast({ type: 'job_updated', payload: jobPosts[jobIdx] });
      }

      // Automatically decline peer proposals
      proposals = proposals.map(p => {
        if (p.jobPostId === originalProposal.jobPostId && p.id !== originalProposal.id && p.status === 'pending') {
          const updatedPeer = { ...p, status: 'declined' as const };
          // Broadcast each update
          setTimeout(() => {
            const fPeer = users.find(u => u.id === p.freelancerId);
            broadcast({
              type: 'proposal_updated',
              payload: { ...updatedPeer, freelancer: fPeer, jobTitle: jobInfo.title }
            });
          }, 50);
          return updatedPeer;
        }
        return p;
      });
    }

    broadcast({ type: 'proposal_updated', payload: updatedDecorated });
    res.json(updatedDecorated);
  });

  // Chat Rooms and Real-Time Messages
  app.get('/api/chat/rooms', (req, res) => {
    const { userId } = req.query;
    
    // Filter rooms involving targeted user
    let filteredRooms = chatRooms;
    if (userId) {
      filteredRooms = chatRooms.filter(r => r.clientId === userId || r.freelancerId === userId);
    }
    
    res.json(filteredRooms);
  });

  app.post('/api/chat/rooms', (req, res) => {
    const { clientId, freelancerId, jobPostId } = req.body;

    if (!clientId || !freelancerId) {
      return res.status(400).json({ error: 'clientId and freelancerId are required to establish chat room.' });
    }

    // Check if standard text room already exists
    let room = chatRooms.find(r => 
      r.clientId === clientId && 
      r.freelancerId === freelancerId && 
      (!jobPostId || r.jobPostId === jobPostId)
    );

    if (room) {
      return res.json(room);
    }

    const client = users.find(u => u.id === clientId);
    const freelancer = users.find(u => u.id === freelancerId);
    const job = jobPostId ? jobPosts.find(j => j.id === jobPostId) : undefined;

    const newRoom: ChatRoom = {
      id: 'room-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      clientId,
      freelancerId,
      jobPostId,
      jobTitle: job?.title,
      clientName: client?.name || 'Client',
      freelancerName: freelancer?.name || 'Freelancer'
    };

    chatRooms.push(newRoom);
    broadcast({ type: 'room_created', payload: newRoom });

    res.status(201).json(newRoom);
  });

  app.get('/api/chat/rooms/:roomId/messages', (req, res) => {
    const { roomId } = req.params;
    const roomMessages = messages.filter(m => m.chatRoomId === roomId);
    res.json(roomMessages);
  });

  app.post('/api/chat/rooms/:roomId/messages', (req, res) => {
    const { roomId } = req.params;
    const { senderId, text, attachments } = req.body;

    if (!senderId || (!text && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ error: 'Sender ID and text or attachments required.' });
    }

    const newMessage: Message = {
      id: 'msg-' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      chatRoomId: roomId,
      senderId,
      text: text || '',
      attachments: attachments || [],
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    broadcast({ type: 'message_created', payload: newMessage });

    res.status(201).json(newMessage);
  });

  // Generic document or base64 file helper
  app.post('/api/upload', (req, res) => {
    const { fileName, size, fileData } = req.body;
    
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Filename and base64 file data required' });
    }

    // Simulate clean visual storage link
    const assetUrl = `https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500`; // Just a standard vector visual
    
    res.json({
      status: 'uploaded',
      name: fileName,
      size: size || '212 KB',
      url: fileData.startsWith('data:') ? fileData : `data:application/octet-stream;base64,${fileData}`
    });
  });

  // --- INTEGRATE VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Collabify Core] Server successfully bound and running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Collabify Launch Fail]', err);
});
