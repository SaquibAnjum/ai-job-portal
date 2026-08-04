const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Application = require('../models/Application');
const Skill = require('../models/Skill');
const Notification = require('../models/Notification');
const Interview = require('../models/Interview');
const Offer = require('../models/Offer');
const Subscription = require('../models/Subscription');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_job_portal';
    console.log(`[Seeding Engine]: Connecting to MongoDB Cluster at ${mongoUri.substring(0, 35)}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seeding Engine]: Clearing existing collections...');
    await User.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await CandidateProfile.deleteMany();
    await RecruiterProfile.deleteMany();
    await Application.deleteMany();
    await Skill.deleteMany();
    await Notification.deleteMany();
    await Interview.deleteMany();
    await Offer.deleteMany();
    await Subscription.deleteMany();

    console.log('[Seeding Engine]: Collections reset successfully.');

    // 1. Seed Skills List
    const skills = [
      'React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'TypeScript',
      'Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS',
      'GCP', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL', 'REST API', 'Java',
      'Spring Boot', 'C++', 'Go', 'Rust', 'Flutter', 'React Native', 'Redis',
      'Kafka', 'PyTorch', 'TensorFlow', 'System Design', 'CI/CD', 'Git'
    ];

    const skillDocs = skills.map((s) => ({
      name: s,
      category: s.includes('React') || s.includes('Tailwind') ? 'Frontend' : s.includes('Node') || s.includes('Python') || s.includes('Java') ? 'Backend' : 'DevOps/Tools',
      popular: true,
    }));
    await Skill.insertMany(skillDocs);

    // 2. Hash default password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 3. Seed Primary Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@aijobportal.com',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    // 4. Seed 30 Companies & 30 Recruiters
    const companyNames = [
      'Nexus AI Technologies', 'CloudScale Systems', 'ByteDynamics', 'QuantumCode Labs',
      'DataMesh Analytics', 'CyberGuard Security', 'Apex Systems Group', 'Horizon Softworks',
      'NextGen FinTech', 'Vector Health AI', 'OmniCloud Networks', 'Pulse Digital',
      'SynthMind AI', 'Stratum Cloud', 'Apex Robotics', 'HyperScale Data',
      'AeroTech Labs', 'Vanguard Software', 'InfiniTech Solutions', 'Starlight Media',
      'NeuralNet Inc', 'BlueShift Systems', 'Cobalt DevOps', 'Zenith AI',
      'Ironclad Security', 'Krypton Interactive', 'NovaPay Financial', 'Orbital Media',
      'Prism Analytics', 'Summit Tech Ventures'
    ];

    const companyDocs = [];
    const recruiterUsers = [];
    const recruiterProfiles = [];

    for (let i = 0; i < 30; i++) {
      const name = companyNames[i];
      const recUser = await User.create({
        name: `Recruiter ${i + 1} (${name.split(' ')[0]})`,
        email: `recruiter${i + 1}@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        password: 'password123',
        role: 'recruiter',
        isVerified: true,
        avatar: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150`,
        phone: `+1 415 555 01${i.toString().padStart(2, '0')}`,
      });

      const company = await Company.create({
        name,
        logo: `https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150`,
        website: `https://${name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        industry: i % 2 === 0 ? 'Artificial Intelligence & Cloud' : 'Enterprise Software & FinTech',
        companySize: '50-500 employees',
        location: i % 3 === 0 ? 'San Francisco, CA (Remote)' : i % 3 === 1 ? 'New York, NY (Hybrid)' : 'Austin, TX (Remote)',
        description: `${name} is a leading technology company building scalable enterprise solutions and modern software applications.`,
        isVerified: i % 2 === 0,
        createdRecruiter: recUser._id,
      });

      await RecruiterProfile.create({
        user: recUser._id,
        company: company._id,
        designation: 'Senior Talent Acquisition Lead',
        department: 'Engineering Hiring',
        workEmail: recUser.email,
      });

      companyDocs.push(company);
      recruiterUsers.push(recUser);
    }

    console.log(`[Seeding Engine]: Seeded 30 Companies & Recruiters.`);

    // 5. Seed 100 Candidates & Profiles
    const candidateUsers = [];
    const candidateProfiles = [];

    const candidateRoles = [
      'Full Stack MERN Developer', 'Senior React Engineer', 'Backend Node.js & Python Engineer',
      'DevOps & Cloud Specialist', 'Data Scientist & ML Engineer', 'Frontend UI/UX Developer',
      'FastAPI & Microservices Architect', 'Mobile App Engineer (Flutter)', 'Systems Software Engineer'
    ];

    for (let i = 0; i < 100; i++) {
      const candUser = await User.create({
        name: `Candidate Candidate_${i + 1}`,
        email: `candidate${i + 1}@gmail.com`,
        password: 'password123',
        role: 'candidate',
        isVerified: true,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150`,
        phone: `+1 650 555 10${i.toString().padStart(2, '0')}`,
      });

      const selectedRole = candidateRoles[i % candidateRoles.length];
      const selectedSkills = skills.slice(i % 10, (i % 10) + 6);

      const candProf = await CandidateProfile.create({
        user: candUser._id,
        headline: selectedRole,
        bio: `Passionate ${selectedRole} with 3+ years of experience building modern web services and high-scale software architectures.`,
        location: i % 2 === 0 ? 'New York, NY (Remote)' : 'San Francisco, CA (Hybrid)',
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeOriginalName: `Resume_Candidate_${i + 1}.pdf`,
        resumeSummary: `Highly skilled ${selectedRole} proficient in ${selectedSkills.join(', ')}.`,
        skills: selectedSkills.map(s => ({ name: s, level: 'Expert' })),
        experience: [
          {
            title: selectedRole,
            company: 'Tech Solutions LLC',
            startDate: '2022-01',
            endDate: 'Present',
            current: true,
            description: 'Engineered web services, microservices, and client dashboards.',
          },
        ],
        education: [
          {
            institution: 'State Computer Science Institute',
            degree: 'B.S.',
            fieldOfStudy: 'Computer Engineering',
            startYear: '2018',
            endYear: '2022',
          },
        ],
        projects: [
          {
            title: `Project ${i + 1}: Automated Tech Platform`,
            description: 'Full stack web application built with modern architecture.',
            technologies: selectedSkills.slice(0, 3),
          },
        ],
        socialLinks: {
          github: `https://github.com/candidate${i + 1}`,
          linkedin: `https://linkedin.com/in/candidate${i + 1}`,
          portfolio: `https://candidate${i + 1}.dev`,
        },
      });

      candidateUsers.push(candUser);
      candidateProfiles.push(candProf);
    }

    console.log(`[Seeding Engine]: Seeded 100 Candidates & Profiles.`);

    // 6. Seed 100 Jobs
    const jobTitles = [
      'Senior Full-Stack MERN Engineer', 'Backend Node.js & Express Specialist',
      'React.js UI & Dashboard Developer', 'Python & FastAPI Backend Architect',
      'DevOps & Cloud Security Engineer', 'Data Science & Machine Learning Lead',
      'Software Development Engineer (SDE-2)', 'TypeScript & GraphQL Developer',
      'System Design & Microservices Architect', 'Mobile Engineer (Flutter / React Native)'
    ];

    const jobDocs = [];

    for (let i = 0; i < 100; i++) {
      const title = `${jobTitles[i % jobTitles.length]} #${i + 1}`;
      const comp = companyDocs[i % companyDocs.length];
      const rec = recruiterUsers[i % recruiterUsers.length];

      const reqSkills = skills.slice((i * 2) % 20, ((i * 2) % 20) + 5);

      const job = await Job.create({
        title,
        company: comp._id,
        recruiter: rec._id,
        description: `We are hiring a **${title}** at **${comp.name}**. Join our high-performance engineering team to build state-of-the-art web products and Cloud API infrastructure.
        
### Responsibilities:
- Design and deploy scalable services using ${reqSkills.join(', ')}.
- Write testable, maintainable, and clean code.
- Collaborate with product managers and UX designers to deliver enterprise features.

### Requirements:
- Hands-on proficiency in: ${reqSkills.join(', ')}.
- Strong foundation in Git, REST API design, and system architecture.`,
        roleCategory: i % 2 === 0 ? 'Full Stack Development' : 'Backend Development',
        jobType: i % 3 === 0 ? 'Full-Time' : i % 3 === 1 ? 'Remote' : 'Contract',
        workMode: i % 3 === 0 ? 'Remote' : i % 3 === 1 ? 'Hybrid' : 'On-site',
        experienceLevel: i % 2 === 0 ? 'Senior Level' : 'Mid Level',
        location: comp.location,
        requiredSkills: reqSkills,
        salaryMin: 90000 + (i % 10) * 8000,
        salaryMax: 130000 + (i % 10) * 10000,
        status: i % 10 === 0 ? 'Draft' : 'Active',
        applicationsCount: (i % 5),
      });

      jobDocs.push(job);
    }

    console.log(`[Seeding Engine]: Seeded 100 Jobs across 30 Companies.`);

    // 7. Seed Applications, Interviews, Offers
    for (let i = 0; i < 20; i++) {
      const job = jobDocs[i];
      const cand = candidateUsers[i];

      const app = await Application.create({
        job: job._id,
        candidate: cand._id,
        resumeUrl: candidateProfiles[i].resumeUrl,
        coverLetter: `I am excited to apply for ${job.title}. My technical skills closely match your requirements.`,
        status: i % 3 === 0 ? 'Interviewing' : i % 3 === 1 ? 'Offered' : 'Shortlisted',
        aiMatchAnalysis: {
          matchScore: 85 + (i % 12),
          matchedSkills: job.requiredSkills.slice(0, 3),
          missingSkills: job.requiredSkills.slice(3),
          matchReason: `Candidate displays strong technical match (${85 + (i % 12)}%) for ${job.title}.`,
          analyzedAt: new Date(),
        },
      });

      if (app.status === 'Interviewing') {
        await Interview.create({
          application: app._id,
          candidate: cand._id,
          recruiter: job.recruiter,
          scheduledAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
          type: 'Technical',
          meetingLink: `https://meet.google.com/interview-call-${i + 1}`,
          status: 'Scheduled',
          aiGeneratedQuestions: [
            { question: 'How do you optimize REST API response times for high-concurrency endpoints?', category: 'Performance' },
          ],
        });
      }

      if (app.status === 'Offered') {
        await Offer.create({
          application: app._id,
          candidate: cand._id,
          recruiter: job.recruiter,
          company: job.company,
          jobTitle: job.title,
          salary: job.salaryMax,
          joiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'Pending',
        });
      }
    }

    console.log('========================================================');
    console.log('✅ DATABASE SEEDED WITH 100 JOBS, 30 COMPANIES, 100 CANDIDATES!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seeding Error]:', err);
    process.exit(1);
  }
};

seedData();
