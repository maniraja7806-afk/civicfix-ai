import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { aiService } from '../services/aiService';
import { CivicMap } from '../components/map/CivicMap';
import { AiImageAnalyzer } from '../components/ai/AiImageAnalyzer';
import { saveComplaintDraft, getComplaintDraft, clearComplaintDraft } from '../utils/idbStorage';
import { AiAnalysis, ComplaintPriority } from '../types';
import {
  UploadCloud,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  FileText,
  Camera,
  Trash2,
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';

const CATEGORIES = [
  'Roads & Potholes',
  'Garbage & Sanitation',
  'Water Leakage & Supply',
  'Streetlight & Electrical',
  'Drainage & Sewerage',
  'Public Health & Hygiene',
  'Public Safety & Parks',
  'Other Infrastructure'
];

export const ReportIssuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [reportedPriority, setReportedPriority] = useState<ComplaintPriority>('Medium');

  // Location: [lat, lng]
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>([28.6328, 77.2185]); // Default New Delhi Connaught Place
  const [isLocating, setIsLocating] = useState(false);

  // Files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [aiAnalysisData, setAiAnalysisData] = useState<AiAnalysis | null>(null);

  // Duplicate Check
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  // Check for saved offline draft on load
  useEffect(() => {
    const draft = getComplaintDraft();
    if (draft && draft.title) {
      setTitle(draft.title);
      setDescription(draft.description);
      setCategory(draft.category || CATEGORIES[0]);
      setAddress(draft.address || '');
      setLandmark(draft.landmark || '');
      if (draft.latitude && draft.longitude) {
        setSelectedCoords([draft.latitude, draft.longitude]);
      }
      setDraftRestored(true);
    }
  }, []);

  // Auto-save draft on changes
  useEffect(() => {
    if (title || description || address) {
      saveComplaintDraft({
        title,
        description,
        category,
        address,
        landmark,
        latitude: selectedCoords ? selectedCoords[0] : null,
        longitude: selectedCoords ? selectedCoords[1] : null,
        reportedPriority
      });
    }
  }, [title, description, category, address, landmark, selectedCoords, reportedPriority]);

  // Handle Image File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const combined = [...selectedFiles, ...newFiles].slice(0, 5); // max 5
      setSelectedFiles(combined);

      // Create previews
      const previews = combined.map(f => URL.createObjectURL(f));
      setFilePreviews(previews);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setFilePreviews(updatedPreviews);
  };

  // AI Suggestions application
  const handleApplyAiSuggestions = (suggestions: {
    title: string;
    description: string;
    category: string;
    priority: ComplaintPriority;
    aiAnalysis: AiAnalysis;
  }) => {
    setTitle(suggestions.title);
    setDescription(suggestions.description);
    if (CATEGORIES.includes(suggestions.category)) {
      setCategory(suggestions.category);
    }
    setReportedPriority(suggestions.priority);
    setAiAnalysisData(suggestions.aiAnalysis);
  };

  // GPS Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords([latitude, longitude]);
        setIsLocating(false);
        if (!address) {
          setAddress(`GPS Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (Exact Location Pinned)`);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not retrieve GPS coordinates. Please pin your location manually on the map.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Map pin placement
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedCoords([lat, lng]);
  };

  // Run duplicate check whenever coords and category change
  useEffect(() => {
    if (!selectedCoords || !category) return;

    const runDuplicateCheck = async () => {
      try {
        setIsCheckingDuplicates(true);
        const [lat, lng] = selectedCoords;
        const res = await aiService.detectDuplicates({
          category,
          title: title || 'Civic Issue',
          description,
          latitude: lat,
          longitude: lng,
          maxDistanceMeters: 150
        });

        if (res.hasDuplicates && res.duplicates.length > 0) {
          setDuplicateWarning(res.duplicates[0]);
        } else {
          setDuplicateWarning(null);
        }
      } catch (err) {
        // ignore duplicate check error
      } finally {
        setIsCheckingDuplicates(false);
      }
    };

    const timer = setTimeout(runDuplicateCheck, 600);
    return () => clearTimeout(timer);
  }, [selectedCoords, category, title]);

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCoords) {
      setErrorMessage('Please select or pin the civic issue location on the map.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a title and detailed description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('address', address.trim() || 'Pinned map location');
      formData.append('landmark', landmark.trim());
      formData.append('latitude', selectedCoords[0].toString());
      formData.append('longitude', selectedCoords[1].toString());
      formData.append('reportedPriority', reportedPriority);

      if (aiAnalysisData) {
        formData.append('aiAnalysisData', JSON.stringify(aiAnalysisData));
      }

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await complaintService.createComplaint(formData);
      clearComplaintDraft();

      // Navigate directly to the complaint tracking details page!
      navigate(`/complaint/${response.complaint._id}`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit complaint. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
          <Link to="/dashboard/citizen" className="hover:text-civic-600">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-800">Report an Issue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Problem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload photo evidence, inspect with Gemini AI vision, drop your location pin, and submit directly to municipal authorities.
        </p>
      </div>

      {draftRestored && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Restored unfinished complaint draft from your local device.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              clearComplaintDraft();
              setTitle('');
              setDescription('');
              setAddress('');
              setLandmark('');
              setDraftRestored(false);
            }}
            className="text-amber-900 font-bold hover:underline"
          >
            Clear Draft
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Duplicate Alert Banner */}
      {duplicateWarning && (
        <div className="bg-amber-50/90 border border-amber-300 text-amber-900 p-4 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-600 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Potential Duplicate Civic Issue Detected ({duplicateWarning.distanceMeters}m away)
            </h4>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Another citizen previously reported an issue in this category: <strong>"{duplicateWarning.complaintRef?.title}"</strong> ({duplicateWarning.complaintRef?.complaintId}).
          </p>
          <div className="flex items-center space-x-3 text-xs pt-1">
            <Link
              to={`/complaint/${duplicateWarning.complaintRef?._id}`}
              target="_blank"
              className="font-bold text-civic-700 hover:underline flex items-center space-x-1"
            >
              <span>View existing complaint</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-amber-600">• You can still submit if this is a distinct issue.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Photo Evidence & AI Inspection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Upload Issue Photograph</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">JPG, PNG, WebP (Max 5 photos)</span>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-civic-400 rounded-xl p-6 text-center transition bg-slate-50/50">
            <input
              type="file"
              id="file-upload"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-full bg-civic-50 text-civic-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop photographs
              </p>
              <p className="text-xs text-slate-400">
                High-resolution photos allow AI to accurately assess pothole depth, waste volume, and hazards
              </p>
            </label>
          </div>

          {/* Image Previews */}
          {filePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {filePreviews.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Image Analyzer Widget */}
          {selectedFiles.length > 0 && (
            <AiImageAnalyzer
              imageFile={selectedFiles[0]}
              onApplySuggestions={handleApplyAiSuggestions}
            />
          )}
        </div>

        {/* Step 2: Location & Map Pin */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">Pin Issue Location</h3>
            </div>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-civic-50 hover:bg-civic-100 text-civic-700 text-xs font-semibold border border-civic-200 transition"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Use My Current GPS'}</span>
            </button>
          </div>

          {/* Leaflet Picker Map */}
          <CivicMap
            height="320px"
            isPickerMode={true}
            selectedLocation={selectedCoords}
            onLocationSelect={handleLocationSelect}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street / Area Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Inner Circle Exit 3, Rajiv Chowk, New Delhi"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nearby Landmark (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Regal Cinema Gate 4"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Issue Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">Complaint Specification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complaint Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Dangerous Pothole on High-Speed Lane"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Civic Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the visible extent of damage, risk to commuters, and approximate duration..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perceived Severity / Urgency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as ComplaintPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReportedPriority(p)}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    reportedPriority === p
                      ? p === 'Critical'
                        ? 'bg-red-600 text-white border-red-600'
                        : p === 'High'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : p === 'Medium'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Note: CivicFix AI Priority Engine evaluates this along with safety hazards, traffic density, and school proximity.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/dashboard/citizen"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-sm font-bold shadow-md shadow-civic-600/20 transition flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting & Processing AI...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
