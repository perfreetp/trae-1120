export interface User {
  id: string;
  name: string;
  role: 'admin' | 'street' | 'inspector';
  phone: string;
  avatar?: string;
}

export interface Community {
  id: string;
  name: string;
  street: string;
  grid: string;
  buildingCount: number;
  householdCount: number;
  inspectionRate: number;
}

export interface Building {
  id: string;
  communityId: string;
  name: string;
  address: string;
  householdCount: number;
  lat: number;
  lng: number;
  inspectionStatus: 'pending' | 'in_progress' | 'completed';
  hazardCount: number;
}

export interface Household {
  id: string;
  buildingId: string;
  roomNumber: string;
  ownerName: string;
  phone: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastInspectionDate?: string;
  nextInspectionDate?: string;
}

export interface TaskTimelineItem {
  id: string;
  status: 'assigned' | 'started' | 'checked_in' | 'photo_added' | 'inspection_submitted' | 'completed';
  statusLabel: string;
  description: string;
  operatorName: string;
  timestamp: string;
}

export interface Task {
  id: string;
  taskNo: string;
  type: 'routine' | 'recheck' | 'special';
  typeLabel: string;
  householdId: string;
  householdName: string;
  address: string;
  inspectorId?: string;
  inspectorName?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'overdue';
  statusLabel: string;
  scheduledDate: string;
  completedDate?: string;
  priority: 'low' | 'medium' | 'high';
  checkInStatus?: 'pending' | 'checked_in';
  checkInStatusLabel?: string;
  checkInTime?: string;
  photoCount?: number;
  photos?: string[];
  timeline?: TaskTimelineItem[];
  hazardIds?: string[];
}

export interface InspectionRecord {
  id: string;
  taskId: string;
  inspectorId: string;
  inspectorName: string;
  householdId: string;
  householdName: string;
  address: string;
  checkDate: string;
  meterReading: number;
  hoseStatus: 'good' | 'aging' | 'damaged';
  hoseStatusLabel: string;
  hoseAge?: number;
  alarmStatus: 'working' | 'faulty' | 'none';
  alarmStatusLabel: string;
  ventilation: 'good' | 'poor';
  ventilationLabel: string;
  remarks?: string;
  photos: string[];
  userSignature?: string;
}

export interface Hazard {
  id: string;
  inspectionRecordId?: string;
  taskId?: string;
  householdId: string;
  householdName: string;
  address: string;
  level: 'general' | 'major' | 'critical';
  levelLabel: string;
  type: string;
  description: string;
  photos: string[];
  status: 'pending' | 'rectifying' | 'rechecking' | 'closed';
  statusLabel: string;
  assigneeId?: string;
  assigneeName?: string;
  deadline?: string;
  rectificationPlan?: string;
  recheckDate?: string;
  recheckResult?: string;
  createDate: string;
  closedDate?: string;
}

export interface WorkOrder {
  id: string;
  orderNo: string;
  type: 'leak' | 'shutdown' | 'repair' | 'other';
  typeLabel: string;
  title: string;
  description: string;
  address: string;
  contactName: string;
  contactPhone: string;
  status: 'pending' | 'processing' | 'completed' | 'closed';
  statusLabel: string;
  priority: 'normal' | 'urgent' | 'emergency';
  priorityLabel: string;
  assigneeId?: string;
  assigneeName?: string;
  createDate: string;
  completedDate?: string;
  arrivalTime?: string;
  handlingNotes?: string;
  photos: string[];
  progress: WorkOrderProgress[];
  followUp?: FollowUpRecord;
}

export interface WorkOrderProgress {
  id: string;
  workOrderId: string;
  status: string;
  description: string;
  operatorName: string;
  timestamp: string;
  photos?: string[];
}

export interface FollowUpRecord {
  id: string;
  workOrderId: string;
  operatorName: string;
  date: string;
  satisfaction: number;
  feedback: string;
}

export interface Statistics {
  totalHouseholds: number;
  inspectedHouseholds: number;
  inspectionRate: number;
  overdueCount: number;
  pendingHazards: number;
  completedTasks: number;
  hazardLevelDistribution: {
    general: number;
    major: number;
    critical: number;
  };
  rectificationTrend: {
    date: string;
    completed: number;
    new: number;
  }[];
  streetRanking: {
    street: string;
    inspectionRate: number;
    rank: number;
    communityCount: number;
  }[];
}

export interface GasFacility {
  id: string;
  type: 'pipeline' | 'valve' | 'regulator';
  typeLabel: string;
  name: string;
  lat: number;
  lng: number;
  status: 'normal' | 'maintenance' | 'fault';
  installDate: string;
  lastCheckDate: string;
}
