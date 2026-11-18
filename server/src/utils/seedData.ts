import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Complaint } from '../models/Complaint';
import { ComplaintUpdate } from '../models/ComplaintUpdate';
import { Notification } from '../models/Notification';
import { DuplicateGroup } from '../models/DuplicateGroup';
import { getInMemoryStore } from './inMemoryStore';
import { logger } from './logger';
import { config } from '../config/env';

export const seedDatabaseIfEmpty = async () => {
  try {
    const isMongo = getInMemoryStore().isConnectedToMongo;
    let existingCount = 0;

    if (isMongo) {
      existingCount = await Complaint.countDocuments();
    } else {
      existingCount = getInMemoryStore().complaints.size;
    }

    if (existingCount > 0) {
      logger.info(`Database already populated (${existingCount} complaints present).`);
      return;
    }

    logger.info('Populating CivicFix AI with rich civic seed data...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('CivicFix@2026', salt);

    // 1. Seed Departments
    const depts = [
      {
        name: 'Public Works Department (PWD)',
        code: 'PWD',
        description: 'Responsible for arterial roads, bridges, potholes, pavements, and civil infrastructure maintenance.',
        categoryMappings: ['Roads & Potholes', 'Other Infrastructure'],
        headOfficerName: 'Er. Rajesh Kumar',
        contactEmail: 'pwd.helpdesk@civicfix.gov.in',
        contactPhone: '+91 11 2345 6789',
        slaHours: { critical: 6, high: 24, medium: 72, low: 168 },
        isActive: true
      },
      {
        name: 'Sanitation & Solid Waste Management',
        code: 'SWM',
        description: 'Municipal garbage collection, secondary transfer stations, street sweeping, and sanitary landfill operations.',
        categoryMappings: ['Garbage & Sanitation', 'Public Health & Hygiene'],
        headOfficerName: 'Sunita Rao',
        contactEmail: 'sanitation@civicfix.gov.in',
        contactPhone: '+91 11 2345 6790',
        slaHours: { critical: 4, high: 12, medium: 48, low: 96 },
        isActive: true
      },
      {
        name: 'Water Supply & Sewerage Board',
        code: 'WSSB',
        description: 'Potable water distribution pipelines, reservoir pressure management, and underground sewerage trunk lines.',
        categoryMappings: ['Water Leakage & Supply'],
        headOfficerName: 'Er. Arvind Mehta',
        contactEmail: 'waterboard@civicfix.gov.in',
        contactPhone: '+91 11 2345 6791',
        slaHours: { critical: 4, high: 18, medium: 48, low: 120 },
        isActive: true
      },
      {
        name: 'Electrical & Street Lighting Wing',
        code: 'ESL',
        description: 'Public illumination, LED energy management, transformer safety, and high-mast lamp pole maintenance.',
        categoryMappings: ['Streetlight & Electrical'],
        headOfficerName: 'Vikram Singh',
        contactEmail: 'electrical@civicfix.gov.in',
        contactPhone: '+91 11 2345 6792',
        slaHours: { critical: 3, high: 16, medium: 48, low: 96 },
        isActive: true
      },
      {
        name: 'Stormwater Drainage & Flood Control',
        code: 'DRN',
        description: 'Monsoon canal desilting, culverts, catchment basins, and urban flood prevention network.',
        categoryMappings: ['Drainage & Sewerage', 'Public Safety & Parks'],
        headOfficerName: 'Deepak Chawla',
        contactEmail: 'drainage@civicfix.gov.in',
        contactPhone: '+91 11 2345 6793',
        slaHours: { critical: 6, high: 24, medium: 60, low: 144 },
        isActive: true
      }
    ];

    const createdDepts: any[] = [];
    for (const d of depts) {
      if (isMongo) {
        const item = await Department.create(d);
        createdDepts.push(item);
      } else {
        const item = getInMemoryStore().saveDepartment(d);
        createdDepts.push(item);
      }
    }

    const pwdDept = createdDepts[0];
    const swmDept = createdDepts[1];
    const wssDept = createdDepts[2];
    const eslDept = createdDepts[3];
    const drnDept = createdDepts[4];

    // 2. Seed Users
    const usersData = [
      {
        name: 'Pooja Verma (City Commissioner)',
        email: 'admin@civicfix.gov.in',
        passwordHash: demoPasswordHash,
        role: 'admin',
        phone: '+91 99999 88888',
        address: 'Municipal Corporation Headquarters, Civic Centre, New Delhi',
        designation: 'Chief Municipal Commissioner',
        isActive: true
      },
      {
        name: 'Rajesh Kumar (Senior Road Works Engineer)',
        email: 'officer@civicfix.gov.in', // Main demo officer
        passwordHash: demoPasswordHash,
        role: 'officer',
        phone: '+91 98111 22334',
        address: 'PWD Central Division Office, Barakhamba Road',
        departmentId: pwdDept._id,
        designation: 'Executive Engineer - Road Infrastructure',
        isActive: true
      },
      {
        name: 'Sunita Rao (Chief Sanitation Inspector)',
        email: 'sanitation.officer@civicfix.gov.in',
        passwordHash: demoPasswordHash,
        role: 'officer',
        phone: '+91 98222 33445',
        address: 'South Zone Waste Management Center',
        departmentId: swmDept._id,
        designation: 'Chief Sanitation Officer',
        isActive: true
      },
      {
        name: 'Vikram Singh (Electrical Engineer)',
        email: 'electrical.officer@civicfix.gov.in',
        passwordHash: demoPasswordHash,
        role: 'officer',
        phone: '+91 98333 44556',
        address: 'Power Grid Substations Wing, North Zone',
        departmentId: eslDept._id,
        designation: 'Assistant Electrical Inspector',
        isActive: true
      },
      {
        name: 'Aarav Sharma (Verified Citizen)',
        email: 'citizen@civicfix.gov.in', // Main demo citizen
        passwordHash: demoPasswordHash,
        role: 'citizen',
        phone: '+91 98765 43210',
        address: 'B-42, Connaught Circus, New Delhi - 110001',
        isActive: true
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        passwordHash: demoPasswordHash,
        role: 'citizen',
        phone: '+91 97123 45678',
        address: 'Block C, Lajpat Nagar II, New Delhi',
        isActive: true
      },
      {
        name: 'Rohit Verma',
        email: 'rohit.sharma@gmail.com',
        passwordHash: demoPasswordHash,
        role: 'citizen',
        phone: '+91 98987 65432',
        address: 'Pocket 3, Mayur Vihar Phase 1, New Delhi',
        isActive: true
      }
    ];

    const createdUsers: any[] = [];
    for (const u of usersData) {
      if (isMongo) {
        const item = await User.create(u);
        createdUsers.push(item);
      } else {
        const item = getInMemoryStore().saveUser(u);
        createdUsers.push(item);
      }
    }

    const adminUser = createdUsers[0];
    const roadOfficer = createdUsers[1];
    const citizenUser = createdUsers[4];
    const priyaCitizen = createdUsers[5];

    // 3. Seed Realistic Civic Complaints
    const complaintsSeed = [
      {
        complaintId: 'CFA-2026-000101',
        citizenId: citizenUser._id,
        title: 'Deep Hazardous Pothole near Inner Circle Exit 3',
        description: 'Large crater of around 15cm depth on the asphalt road right outside Metro Gate 4. Two-wheelers swerving drastically during peak hours.',
        category: 'Roads & Potholes',
        images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [77.2185, 28.6328] }, // Connaught Place, New Delhi
        address: 'Inner Circle, Exit 3 near Rajiv Chowk Metro Gate 4, Connaught Place, New Delhi',
        landmark: 'Opposite Regal Cinema Building',
        priority: 'High',
        priorityReason: 'Elevated risk priority (Score 72/100): Significant traffic disruption and accident risk on high-density arterial corridor.',
        priorityScore: 72,
        priorityFactors: { safetyRisk: 22, publicHealthRisk: 4, trafficDisruption: 20, recurrenceBonus: 16, populationDensity: 10 },
        status: 'In Progress',
        assignedDepartmentId: pwdDept._id,
        assignedOfficerId: roadOfficer._id,
        aiAnalysis: {
          detectedIssue: 'Severe Road Pothole and Asphalt Cavity',
          suggestedCategory: 'Roads & Potholes',
          suggestedPriority: 'High',
          suggestedDepartment: 'Public Works Department (PWD)',
          confidenceScore: 94,
          visualDamage: 'Exposed road ballast with fractured perimeter approx 1.2m diameter.',
          urgencyExplanation: 'High risk of two-wheeler skidding and vehicular deceleration on primary arterial road.',
          safetyAdvisory: 'Motorists advised to maintain low speed in right lane.',
          isAiGenerated: true,
          modelUsed: 'gemini-2.5-flash',
          analyzedAt: new Date(Date.now() - 36 * 3600 * 1000)
        },
        createdAt: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        complaintId: 'CFA-2026-000102',
        citizenId: priyaCitizen._id,
        title: 'Dangerous Road Crater opposite Regal Connaught Place',
        description: 'Pothole right near Exit 3 metro gate causing huge traffic slowdown and near misses for bikers.',
        category: 'Roads & Potholes',
        images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [77.2188, 28.6329] }, // 35m from previous complaint!
        address: 'Radha Cinema Road, near Connaught Place Exit 3',
        landmark: 'Beside Regal Bus Stop',
        priority: 'High',
        priorityReason: 'Proximity cluster detected (Score 76/100): Duplicate report within 35 meters of CFA-2026-000101.',
        priorityScore: 76,
        priorityFactors: { safetyRisk: 22, publicHealthRisk: 4, trafficDisruption: 20, recurrenceBonus: 20, populationDensity: 10 },
        status: 'Under Review',
        assignedDepartmentId: pwdDept._id,
        assignedOfficerId: roadOfficer._id,
        aiAnalysis: {
          detectedIssue: 'Severe Road Pothole and Asphalt Cavity',
          suggestedCategory: 'Roads & Potholes',
          suggestedPriority: 'High',
          suggestedDepartment: 'Public Works Department (PWD)',
          confidenceScore: 95,
          visualDamage: 'Visible road surface breakdown with sharp asphalt margins.',
          urgencyExplanation: 'Repeated citizen reports indicate immediate repair urgency.',
          safetyAdvisory: 'Caution signs recommended.',
          isAiGenerated: true,
          modelUsed: 'gemini-2.5-flash',
          analyzedAt: new Date(Date.now() - 24 * 3600 * 1000)
        },
        createdAt: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        complaintId: 'CFA-2026-000103',
        citizenId: citizenUser._id,
        title: 'Overflowing Municipal Garbage Dump at Central Market',
        description: 'Large dumpster overflowing onto the sidewalk for over 3 days. Foul smell and stray animals scattering refuse across walking path.',
        category: 'Garbage & Sanitation',
        images: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [77.2435, 28.5685] }, // Lajpat Nagar
        address: 'Central Market Lane 4, Lajpat Nagar II, New Delhi',
        landmark: 'Near Government Girls Senior Secondary School',
        priority: 'High',
        priorityReason: 'Public health hazard (Score 70/100): High solid waste accumulation within 50 meters of educational institution.',
        priorityScore: 70,
        priorityFactors: { safetyRisk: 12, publicHealthRisk: 25, trafficDisruption: 10, recurrenceBonus: 13, populationDensity: 10 },
        status: 'Assigned',
        assignedDepartmentId: swmDept._id,
        aiAnalysis: {
          detectedIssue: 'Unregulated Municipal Solid Waste Overflow',
          suggestedCategory: 'Garbage & Sanitation',
          suggestedPriority: 'High',
          suggestedDepartment: 'Sanitation & Solid Waste Management',
          confidenceScore: 96,
          visualDamage: 'Decomposed organic waste and unsegregated plastic litter spilled over pedestrian pavement.',
          urgencyExplanation: 'Severe vector breeding and airborne foul odor risk near public school.',
          safetyAdvisory: 'Sanitation truck and chemical disinfectant spray deployed.',
          isAiGenerated: true,
          modelUsed: 'gemini-2.5-flash',
          analyzedAt: new Date(Date.now() - 18 * 3600 * 1000)
        },
        createdAt: new Date(Date.now() - 18 * 3600 * 1000)
      },
      {
        complaintId: 'CFA-2026-000104',
        citizenId: priyaCitizen._id,
        title: 'Pressurized Water Main Pipeline Breach Flooding Main Road',
        description: 'Major underground pipe burst. Fresh clean potable water gushing onto the road at high speed, eroding the pavement and flooding two lanes.',
        category: 'Water Leakage & Supply',
        images: ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [77.1906, 28.6517] }, // Karol Bagh
        address: 'Pusa Road near Karol Bagh Metro Pillar 114, New Delhi',
        landmark: 'In front of Metro Pillar 114',
        priority: 'Critical',
        priorityReason: 'Critical risk detected (Score 88/100): Severe infrastructure breach causing massive potable water loss and road foundation erosion.',
        priorityScore: 88,
        priorityFactors: { safetyRisk: 26, publicHealthRisk: 15, trafficDisruption: 20, recurrenceBonus: 17, populationDensity: 10 },
        status: 'In Progress',
        assignedDepartmentId: wssDept._id,
        aiAnalysis: {
          detectedIssue: 'Severe High-Pressure Water Main Burst',
          suggestedCategory: 'Water Leakage & Supply',
          suggestedPriority: 'Critical',
          suggestedDepartment: 'Water Supply & Sewerage Board',
          confidenceScore: 98,
          visualDamage: 'High-velocity water geyser causing structural asphalt cavitation and surface submersion.',
          urgencyExplanation: 'Massive loss of treated city water pressure and danger of foundation collapse under heavy traffic.',
          safetyAdvisory: 'Traffic police divert heavy vehicles. Valve isolation crew dispatched.',
          isAiGenerated: true,
          modelUsed: 'gemini-2.5-flash',
          analyzedAt: new Date(Date.now() - 12 * 3600 * 1000)
        },
        createdAt: new Date(Date.now() - 12 * 3600 * 1000)
      },
      {
        complaintId: 'CFA-2026-000105',
        citizenId: citizenUser._id,
        title: 'Damaged Streetlight Pole with Exposed Live Electric Wire',
        description: 'Streetlight pole hit by a truck and tilted at 45 degrees. Base electrical junction box is completely broken open with naked copper wires hanging near walkway.',
        category: 'Streetlight & Electrical',
        images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [77.1932, 28.7032] }, // Model Town
        address: 'Ring Road Service Lane, Block C, Model Town III, New Delhi',
        landmark: 'Opposite Model Town Community Park Gate',
        priority: 'Critical',
        priorityReason: 'Critical risk detected (Score 96/100): Imminent life safety electrocution hazard with exposed 230V cabling in public pedestrian zone.',
        priorityScore: 96,
        priorityFactors: { safetyRisk: 30, publicHealthRisk: 6, trafficDisruption: 20, recurrenceBonus: 20, populationDensity: 10 },
        status: 'Resolved',
        assignedDepartmentId: eslDept._id,
        resolutionEvidence: {
          images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
          description: 'Power grid technician disconnected feed, replaced broken junction box with waterproof IP65 enclosure, straightened pole anchor, and restored LED luminaire.',
          resolvedAt: new Date(Date.now() - 4 * 3600 * 1000),
          resolvedBy: roadOfficer._id
        },
        citizenFeedback: {
          rating: 5,
          comment: 'Outstanding and swift response! The electrical team arrived within 2 hours and fixed the hanging wire. Excellent civic work.',
          verifiedAt: new Date(Date.now() - 2 * 3600 * 1000),
          isSatisfied: true
        },
        aiAnalysis: {
          detectedIssue: 'Damaged Streetlight Pole and Exposed Live Cable',
          suggestedCategory: 'Streetlight & Electrical',
          suggestedPriority: 'Critical',
          suggestedDepartment: 'Electrical & Street Lighting Wing',
          confidenceScore: 97,
          visualDamage: 'Crushed galvanized junction panel and exposed insulated copper conductor.',
          urgencyExplanation: 'Extremely high risk of fatal electrocution, especially during humid or rainy weather.',
          safetyAdvisory: 'Cordon off 5-meter radius immediately. Do not touch metal pole.',
          isAiGenerated: true,
          modelUsed: 'gemini-2.5-flash',
          analyzedAt: new Date(Date.now() - 30 * 3600 * 1000)
        },
        createdAt: new Date(Date.now() - 30 * 3600 * 1000)
      },
      {
        complaintId: 'CFA-2026-000106',
        citizenId: citizenUser._id,
        title: 'Clogged Stormwater Drain with Plastic Debris Causing Backflow',
        description: 'Main monsoon drain running along South Extension Part 1 is completely jammed with construction rubble and single-use plastic. Dirty water overflowing into market plaza.',
        category: 'Drainage & Sewerage',
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'],
        location: { type: 'Point', coordinates: [77.2215, 28.5728] }, // South Extension
        address: 'NDSE Part 1 Ring Road Service Lane, New Delhi',
        landmark: 'Behind Main Footover Bridge',
        priority: 'High',
        priorityReason: 'Public health and drainage impact (Score 68/100): High likelihood of waterlogging across commercial market district.',
        priorityScore: 68,
        priorityFactors: { safetyRisk: 16, publicHealthRisk: 22, trafficDisruption: 12, recurrenceBonus: 10, populationDensity: 8 },
        status: 'Citizen Verification',
        assignedDepartmentId: drnDept._id,
        resolutionEvidence: {
          images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80'],
          description: 'Suction jetting machine cleared 450kg of silt and plastic blockage. Grating replaced and water flow restored completely.',
          resolvedAt: new Date(Date.now() - 6 * 3600 * 1000),
          resolvedBy: roadOfficer._id
        },
        aiAnalysis: {
          detectedIssue: 'Severe Stormwater Drain Clog and Backwater Siltation',
          suggestedCategory: 'Drainage & Sewerage',
          suggestedPriority: 'High',
          suggestedDepartment: 'Stormwater Drainage & Flood Control',
          confidenceScore: 92,
          visualDamage: 'Stagnant wastewater pooling above drain culvert with floating debris.',
          urgencyExplanation: 'Urgent desilting required to avoid flash waterlogging on adjacent Ring Road.',
          safetyAdvisory: 'Do not attempt to open drain grates without safety harness.',
          isAiGenerated: true,
          modelUsed: 'gemini-2.5-flash',
          analyzedAt: new Date(Date.now() - 40 * 3600 * 1000)
        },
        createdAt: new Date(Date.now() - 40 * 3600 * 1000)
      }
    ];

    const createdComplaints: any[] = [];
    for (const c of complaintsSeed) {
      if (isMongo) {
        const item = await Complaint.create(c);
        createdComplaints.push(item);
      } else {
        const item = getInMemoryStore().saveComplaint(c);
        createdComplaints.push(item);
      }
    }

    // 4. Create Duplicate Group for CFA-2026-000101 and CFA-2026-000102
    const c1 = createdComplaints[0];
    const c2 = createdComplaints[1];
    const dupGroupData = {
      primaryComplaintId: c1._id,
      complaintIds: [c1._id, c2._id],
      similarityScore: 92,
      geographicalDistance: 35, // 35 meters
      status: 'suggested',
      reviewNotes: 'High spatial proximity (35m) and identical issue description regarding Connaught Place Exit 3 road pothole.'
    };

    let dupGroup: any;
    if (isMongo) {
      dupGroup = await DuplicateGroup.create(dupGroupData);
      c1.duplicateGroupId = dupGroup._id;
      c2.duplicateGroupId = dupGroup._id;
      await c1.save();
      await c2.save();
    } else {
      dupGroup = getInMemoryStore().saveDuplicateGroup(dupGroupData);
      c1.duplicateGroupId = dupGroup._id;
      c2.duplicateGroupId = dupGroup._id;
    }

    // 5. Seed Timeline Updates for complaints
    const updatesData = [
      {
        complaintId: c1._id,
        updatedBy: citizenUser._id,
        previousStatus: 'Submitted',
        newStatus: 'Submitted',
        comment: 'Complaint registered by citizen Aarav Sharma with GPS location.',
        actionType: 'status_change',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000)
      },
      {
        complaintId: c1._id,
        updatedBy: adminUser._id,
        previousStatus: 'Submitted',
        newStatus: 'Assigned',
        comment: 'AI Priority Engine assigned priority HIGH (Score 72/100). Auto-assigned to PWD Division.',
        actionType: 'assignment',
        createdAt: new Date(Date.now() - 32 * 3600 * 1000)
      },
      {
        complaintId: c1._id,
        updatedBy: roadOfficer._id,
        previousStatus: 'Assigned',
        newStatus: 'In Progress',
        comment: 'Officer Rajesh Kumar accepted task. Asphalt cold-mix patching truck and compaction crew dispatched.',
        actionType: 'status_change',
        createdAt: new Date(Date.now() - 16 * 3600 * 1000)
      },
      // Complaint 5 (Resolved & Verified)
      {
        complaintId: createdComplaints[4]._id,
        updatedBy: citizenUser._id,
        previousStatus: 'Submitted',
        newStatus: 'Submitted',
        comment: 'Urgent electrical hazard reported with live wire photograph.',
        actionType: 'status_change',
        createdAt: new Date(Date.now() - 30 * 3600 * 1000)
      },
      {
        complaintId: createdComplaints[4]._id,
        updatedBy: roadOfficer._id,
        previousStatus: 'Submitted',
        newStatus: 'In Progress',
        comment: 'Immediate emergency crew dispatched to isolate 230V feed and secure perimeter.',
        actionType: 'status_change',
        createdAt: new Date(Date.now() - 26 * 3600 * 1000)
      },
      {
        complaintId: createdComplaints[4]._id,
        updatedBy: roadOfficer._id,
        previousStatus: 'In Progress',
        newStatus: 'Resolved',
        comment: 'Resolution evidence uploaded. Pole stabilized, waterproof junction box installed, LED lamp functional.',
        actionType: 'evidence_upload',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000)
      },
      {
        complaintId: createdComplaints[4]._id,
        updatedBy: citizenUser._id,
        previousStatus: 'Resolved',
        newStatus: 'Closed',
        comment: 'Citizen confirmed resolution with 5/5 stars rating.',
        actionType: 'citizen_feedback',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000)
      }
    ];

    for (const u of updatesData) {
      if (isMongo) {
        await ComplaintUpdate.create(u);
      } else {
        getInMemoryStore().saveUpdate(u);
      }
    }

    // 6. Seed Notifications
    const notifs = [
      {
        userId: citizenUser._id,
        title: 'Action Initiated on Pothole Report',
        message: 'Officer Rajesh Kumar has commenced repairs on complaint CFA-2026-000101 at Connaught Place.',
        type: 'status_update',
        relatedComplaintId: c1._id,
        isRead: false,
        createdAt: new Date(Date.now() - 16 * 3600 * 1000)
      },
      {
        userId: citizenUser._id,
        title: 'Issue Resolved: Model Town Streetlight',
        message: 'Your report CFA-2026-000105 regarding damaged streetlight has been marked Resolved. Thank you for your feedback!',
        type: 'resolution',
        relatedComplaintId: createdComplaints[4]._id,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000)
      },
      {
        userId: roadOfficer._id,
        title: 'New High Priority Assignment',
        message: 'You have been assigned to CFA-2026-000101: Hazardous Pothole near Connaught Place.',
        type: 'assignment',
        relatedComplaintId: c1._id,
        isRead: false,
        createdAt: new Date(Date.now() - 32 * 3600 * 1000)
      }
    ];

    for (const n of notifs) {
      if (isMongo) {
        await Notification.create(n);
      } else {
        getInMemoryStore().saveNotification(n);
      }
    }

    logger.info('CivicFix AI seed data populated successfully!');
  } catch (err: any) {
    logger.error('Failed to populate seed data:', err);
  }
};
