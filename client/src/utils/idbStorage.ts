// Offline draft helper for civic complaint reporting
const DRAFT_KEY = 'civicfix_complaint_draft_v1';

export interface ComplaintDraft {
  title: string;
  description: string;
  category: string;
  address: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  reportedPriority?: string;
  savedAt: string;
}

export const saveComplaintDraft = (draft: Partial<ComplaintDraft>) => {
  try {
    const payload: ComplaintDraft = {
      title: draft.title || '',
      description: draft.description || '',
      category: draft.category || 'Roads & Potholes',
      address: draft.address || '',
      landmark: draft.landmark || '',
      latitude: draft.latitude ?? null,
      longitude: draft.longitude ?? null,
      reportedPriority: draft.reportedPriority || 'Medium',
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save complaint draft locally:', err);
  }
};

export const getComplaintDraft = (): ComplaintDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ComplaintDraft;
  } catch {
    return null;
  }
};

export const clearComplaintDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    // ignore
  }
};
