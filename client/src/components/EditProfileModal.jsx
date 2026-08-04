import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Award,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  DollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { updateUserInState } from '../redux/slices/authSlice';

const EditProfileModal = ({ isOpen, onClose, profileData, onProfileUpdated }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    headline: '',
    bio: '',
    location: '',
    profilePhotoUrl: '',
    preferredSalary: '$100,000 - $140,000',
    workMode: 'Remote',
    careerGoal: 'Senior Full Stack Software Engineer',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certificates: [],
    achievements: [],
    languages: [],
    socialLinks: {
      github: '',
      linkedin: '',
      portfolio: '',
    },
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.user?.name || '',
        phone: profileData.phone || profileData.user?.phone || '',
        headline: profileData.headline || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        profilePhotoUrl: profileData.profilePhotoUrl || profileData.user?.avatar || '',
        preferredSalary: profileData.preferredSalary || '$100,000 - $140,000',
        workMode: profileData.workMode || 'Remote',
        careerGoal: profileData.careerGoal || 'Senior Full Stack Software Engineer',
        skills: profileData.skills || [],
        experience: profileData.experience || [],
        education: profileData.education || [],
        projects: profileData.projects || [],
        certificates: profileData.certificates || [],
        achievements: profileData.achievements || [],
        languages: profileData.languages || [],
        socialLinks: {
          github: profileData.socialLinks?.github || '',
          linkedin: profileData.socialLinks?.linkedin || '',
          portfolio: profileData.socialLinks?.portfolio || '',
        },
      });
    }
  }, [profileData, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('photo', file);

    setUploadingPhoto(true);
    setErrorMsg('');
    try {
      const res = await axios.post('/api/v1/candidate/upload-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, profilePhotoUrl: res.data.photoUrl }));
      dispatch(updateUserInState({ user: { avatar: res.data.photoUrl } }));
      setSuccessMsg('Photo uploaded to Cloudinary successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload image to Cloudinary');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axios.put('/api/v1/candidate/profile', formData);
      const updated = res.data.data;

      dispatch(
        updateUserInState({
          user: { name: formData.name, phone: formData.phone, avatar: formData.profilePhotoUrl },
          profile: updated,
        })
      );

      setSuccessMsg('Profile updated successfully in MongoDB!');
      if (onProfileUpdated) onProfileUpdated(updated);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Helper Array Modifiers
  const addArrayItem = (field, emptyObj) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], emptyObj] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayField = (field, index, key, value) => {
    setFormData((prev) => {
      const list = [...prev[field]];
      if (typeof list[index] === 'object' && list[index] !== null) {
        list[index] = { ...list[index], [key]: value };
      } else {
        list[index] = value;
      }
      return { ...prev, [field]: list };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Edit Candidate Profile</h2>
              <p className="text-xs text-slate-400">Update your complete professional identity across NexHire.AI</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'personal', label: 'Personal & Contact', icon: User },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'skills', label: 'Skills & Languages', icon: Code },
            { id: 'education', label: 'Education & Certs', icon: GraduationCap },
            { id: 'projects', label: 'Projects & Links', icon: Globe },
            { id: 'preferences', label: 'Job Preferences', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Personal & Contact */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="relative">
                  <img
                    src={formData.profilePhotoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30"
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Profile Photo</h4>
                  <p className="text-xs text-slate-400">Upload to Cloudinary (JPG, PNG allowed, max 10MB)</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-indigo-600/20">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingPhoto ? 'Uploading to Cloudinary...' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">About / Bio</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summarize your technical background and engineering focus..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Work Experience</h4>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem('experience', {
                      title: '',
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      current: false,
                      description: '',
                    })
                  }
                  className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {formData.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('experience', idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <input
                      type="text"
                      placeholder="Job Title (e.g. Senior Frontend Engineer)"
                      value={exp.title || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'title', e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'company', e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Start Date (e.g. Jan 2022)"
                      value={exp.startDate || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'startDate', e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="End Date (e.g. Present)"
                      value={exp.endDate || ''}
                      onChange={(e) => updateArrayField('experience', idx, 'endDate', e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Key achievements and technical responsibilities..."
                    value={exp.description || ''}
                    onChange={(e) => updateArrayField('experience', idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Skills & Languages */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Technical Skills</h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem('skills', { name: '', level: 'Intermediate' })}
                    className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Skill
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                      <input
                        type="text"
                        placeholder="Skill Name (e.g. React.js)"
                        value={typeof skill === 'string' ? skill : skill.name || ''}
                        onChange={(e) => updateArrayField('skills', idx, 'name', e.target.value)}
                        className="flex-1 bg-transparent px-2 py-1 text-xs text-white outline-none"
                      />
                      <select
                        value={typeof skill === 'object' ? skill.level || 'Intermediate' : 'Intermediate'}
                        onChange={(e) => updateArrayField('skills', idx, 'level', e.target.value)}
                        className="bg-slate-900 text-xs text-slate-300 px-2 py-1 rounded-lg border border-slate-800 outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('skills', idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Languages</h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem('languages', '')}
                    className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Language
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                      <input
                        type="text"
                        placeholder="Language (e.g. English)"
                        value={lang || ''}
                        onChange={(e) => updateArrayField('languages', idx, null, e.target.value)}
                        className="bg-transparent text-xs text-white outline-none w-28"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('languages', idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Education & Certifications */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Education</h4>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem('education', { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' })
                    }
                    className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Education
                  </button>
                </div>

                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 mb-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('education', idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                      <input
                        type="text"
                        placeholder="Institution / University"
                        value={edu.institution || ''}
                        onChange={(e) => updateArrayField('education', idx, 'institution', e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Degree (e.g. Bachelor of Science)"
                        value={edu.degree || ''}
                        onChange={(e) => updateArrayField('education', idx, 'degree', e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study (e.g. Computer Science)"
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) => updateArrayField('education', idx, 'fieldOfStudy', e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Start Year"
                          value={edu.startYear || ''}
                          onChange={(e) => updateArrayField('education', idx, 'startYear', e.target.value)}
                          className="w-1/2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                        />
                        <input
                          type="text"
                          placeholder="End Year"
                          value={edu.endYear || ''}
                          onChange={(e) => updateArrayField('education', idx, 'endYear', e.target.value)}
                          className="w-1/2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Certifications</h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem('certificates', { name: '', issuer: '', issueDate: '' })}
                    className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certification
                  </button>
                </div>

                {formData.certificates.map((cert, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={cert.name || ''}
                      onChange={(e) => updateArrayField('certificates', idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Issuer (e.g. AWS)"
                      value={cert.issuer || ''}
                      onChange={(e) => updateArrayField('certificates', idx, 'issuer', e.target.value)}
                      className="w-36 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('certificates', idx)}
                      className="text-slate-500 hover:text-rose-400 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Projects & Links */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Featured Projects</h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem('projects', { title: '', description: '', link: '', github: '' })}
                    className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 mb-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('projects', idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title || ''}
                      onChange={(e) => updateArrayField('projects', idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none pr-8"
                    />
                    <textarea
                      rows={2}
                      placeholder="Project Description & technical impact..."
                      value={proj.description || ''}
                      onChange={(e) => updateArrayField('projects', idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Live Demo URL"
                        value={proj.link || ''}
                        onChange={(e) => updateArrayField('projects', idx, 'link', e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="GitHub Repository URL"
                        value={proj.github || ''}
                        onChange={(e) => updateArrayField('projects', idx, 'github', e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Social & Portfolio Links</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={formData.socialLinks.github}
                      onChange={(e) =>
                        setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })
                      }
                      placeholder="https://github.com/yourusername"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) =>
                        setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })
                      }
                      placeholder="https://linkedin.com/in/yourusername"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Portfolio URL</label>
                    <input
                      type="text"
                      value={formData.socialLinks.portfolio}
                      onChange={(e) =>
                        setFormData({ ...formData, socialLinks: { ...formData.socialLinks, portfolio: e.target.value } })
                      }
                      placeholder="https://yourportfolio.dev"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Job Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Career Goal</label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  placeholder="e.g. Senior Cloud Architect / Lead Full Stack Engineer"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Preferred Salary Range</label>
                  <input
                    type="text"
                    value={formData.preferredSalary}
                    onChange={(e) => setFormData({ ...formData, preferredSalary: e.target.value })}
                    placeholder="e.g. $120,000 - $160,000"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Work Mode</label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Profile to MongoDB
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
