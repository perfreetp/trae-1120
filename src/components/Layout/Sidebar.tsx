import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  FileCheck,
  AlertTriangle,
  Wrench,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const menuItems = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/map', label: '地图', icon: Map },
  { path: '/tasks', label: '任务', icon: ClipboardList },
  { path: '/inspection/new', label: '入户检查', icon: FileCheck },
  { path: '/hazards', label: '隐患', icon: AlertTriangle },
  { path: '/workorders', label: '工单', icon: Wrench },
  { path: '/reports', label: '报表', icon: BarChart3 },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-950 text-white transition-all duration-300 z-40 shadow-xl ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-bold">燃气巡检</h1>
              <p className="text-xs text-blue-300">安全管理平台</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-blue-800 border-2 border-white flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-md"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
          <div className="bg-blue-800/50 rounded-lg p-3">
            <p className="text-xs text-blue-300">今日待办</p>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-orange-300 mt-1">3项紧急任务</p>
          </div>
        </div>
      )}
    </aside>
  );
}
