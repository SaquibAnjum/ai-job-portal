import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedInfo, setParsedInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a PDF or DOCX file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/v1/candidate/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setUploading(false);
      setParsedInfo(res.data.parsedData);
      if (onUploadSuccess) onUploadSuccess(res.data.profile);
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Upload & Parse Resume
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Google Gemini AI will automatically extract your skills, experience, and project profile.
          </p>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-colors bg-slate-50/50 dark:bg-slate-950/40">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload-input"
        />
        <label htmlFor="resume-upload-input" className="cursor-pointer block">
          <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2 animate-bounce" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {file ? file.name : 'Click to upload or drag & drop PDF / DOCX'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Maximum file size 10MB</p>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {file && !parsedInfo && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Parsing Resume with Gemini AI...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" /> Start AI Resume Extraction
            </>
          )}
        </button>
      )}

      {parsedInfo && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Resume Parsed & Profile Updated!
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Extracted <span className="font-bold text-slate-900 dark:text-white">{parsedInfo.skills?.length || 0} skills</span> and{' '}
            <span className="font-bold text-slate-900 dark:text-white">{parsedInfo.totalExperienceYears || 2} years of experience</span>.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {parsedInfo.skills?.slice(0, 8).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
