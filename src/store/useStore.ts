import { create } from 'zustand';
import type {
  User,
  Community,
  Building,
  Household,
  Task,
  InspectionRecord,
  Hazard,
  WorkOrder,
  Statistics,
  GasFacility,
} from '@/types';
import {
  mockUsers,
  mockCommunities,
  mockBuildings,
  mockHouseholds,
  mockTasks,
  mockInspectionRecords,
  mockHazards,
  mockWorkOrders,
  mockStatistics,
  mockFacilities,
} from '@/data/mockData';

interface AppState {
  currentUser: User | null;
  communities: Community[];
  buildings: Building[];
  households: Household[];
  tasks: Task[];
  inspections: InspectionRecord[];
  hazards: Hazard[];
  workOrders: WorkOrder[];
  facilities: GasFacility[];
  statistics: Statistics;
  sidebarCollapsed: boolean;
  loading: boolean;
  selectedBuilding: Building | null;
  fetchData: () => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  addHazard: (hazard: Hazard) => void;
  updateHazard: (id: string, data: Partial<Hazard>) => void;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  toggleSidebar: () => void;
  setSelectedBuilding: (building: Building | null) => void;
  setCurrentUser: (user: User) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: mockUsers[0],
  communities: mockCommunities,
  buildings: mockBuildings,
  households: mockHouseholds,
  tasks: mockTasks,
  inspections: mockInspectionRecords,
  hazards: mockHazards,
  workOrders: mockWorkOrders,
  facilities: mockFacilities,
  statistics: mockStatistics,
  sidebarCollapsed: false,
  loading: false,
  selectedBuilding: null,

  fetchData: () => {
    set({ loading: true });
    setTimeout(() => {
      set({ loading: false });
    }, 500);
  },

  updateTask: (id, data) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...data } : task
      ),
    })),

  addHazard: (hazard) =>
    set((state) => ({
      hazards: [...state.hazards, hazard],
    })),

  updateHazard: (id, data) =>
    set((state) => ({
      hazards: state.hazards.map((hazard) =>
        hazard.id === id ? { ...hazard, ...data } : hazard
      ),
    })),

  updateWorkOrder: (id, data) =>
    set((state) => ({
      workOrders: state.workOrders.map((wo) =>
        wo.id === id ? { ...wo, ...data } : wo
      ),
    })),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSelectedBuilding: (building) => set({ selectedBuilding: building }),

  setCurrentUser: (user) => set({ currentUser: user }),
}));
