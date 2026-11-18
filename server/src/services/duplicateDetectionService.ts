import { Complaint, IComplaint } from '../models/Complaint';
import { getInMemoryStore } from '../utils/inMemoryStore';
import { logger } from '../utils/logger';

// Calculate Haversine distance in meters between two lat/lng coordinates
export const calculateDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Calculate word token Jaccard & overlap similarity (0 to 1)
export const calculateTextSimilarity = (str1: string, str2: string): number => {
  const tokenize = (text: string) => {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2)
    );
  };

  const set1 = tokenize(str1);
  const set2 = tokenize(str2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
};

export interface DuplicateMatch {
  existingComplaintId: string;
  complaintRef: any;
  distanceMeters: number;
  textSimilarity: number;
  combinedConfidence: number; // 0 to 100
  isLikelyDuplicate: boolean;
}

export const detectDuplicates = async (params: {
  category: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  excludeId?: string;
  maxDistanceMeters?: number; // default 150m
}): Promise<DuplicateMatch[]> => {
  const { category, title, description, latitude, longitude, excludeId, maxDistanceMeters = 200 } = params;

  let candidates: any[] = [];

  try {
    // If Mongo is available, find open complaints in same category within radius
    candidates = await Complaint.find({
      category,
      status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    }).lean();
  } catch (err) {
    // In-memory fallback
    candidates = getInMemoryStore()
      .getAllComplaints()
      .filter(
        c =>
          c.category === category &&
          !['Resolved', 'Closed', 'Rejected'].includes(c.status) &&
          (!excludeId || c._id !== excludeId)
      );
  }

  const matches: DuplicateMatch[] = [];

  for (const candidate of candidates) {
    if (!candidate.location || !candidate.location.coordinates) continue;

    const [cLng, cLat] = candidate.location.coordinates;
    const distance = calculateDistanceMeters(latitude, longitude, cLat, cLng);

    if (distance <= maxDistanceMeters) {
      const titleSim = calculateTextSimilarity(title, candidate.title);
      const descSim = calculateTextSimilarity(description, candidate.description);
      const avgTextSim = titleSim * 0.6 + descSim * 0.4;

      // Distance score: 100 at 0m, decaying to 0 at maxDistanceMeters
      const distanceScore = Math.max(0, 1 - distance / maxDistanceMeters);

      // Combined confidence: 60% spatial proximity + 40% text semantic match
      const combinedConfidence = Math.round((distanceScore * 0.6 + avgTextSim * 0.4) * 100);

      const isLikelyDuplicate = distance <= 75 || combinedConfidence >= 65;

      matches.push({
        existingComplaintId: candidate._id.toString(),
        complaintRef: candidate,
        distanceMeters: distance,
        textSimilarity: Math.round(avgTextSim * 100),
        combinedConfidence,
        isLikelyDuplicate
      });
    }
  }

  return matches.sort((a, b) => b.combinedConfidence - a.combinedConfidence);
};
