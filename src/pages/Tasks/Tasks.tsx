import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Filter,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Task } from '@/types';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待执行' },
  { key: 'assigned', label: '已派单' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'overdue', label: '已逾期' },
];

export default function Tasks() {
  const { tasks, updateTask } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesTab = activeTab === 'all' || task.status === activeTab;
    const matchesSearch =
      task.taskNo.includes(searchQuery) ||
      task.householdName.includes(searchQuery) ||
      task.address.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      assigned: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500',
    };
    return colors[priority];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
          <p className="text-gray-500 mt-1">管理巡检任务的派单、改期和执行</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {selectedTasks.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm text-blue-700">
            已选择 <span className="font-semibold">{selectedTasks.length}</span> 项任务
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                批量派单
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                批量改期
              </button>
              <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                批量转派
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-500">{task.taskNo}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.statusLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {task.typeLabel}
                    </span>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mt-1">
                    {task.householdName}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {task.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      计划日期：{task.scheduledDate}
                    </span>
                    {task.inspectorName && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {task.inspectorName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() =>
                        updateTask(task.id, { status: 'assigned', statusLabel: '已派单', inspectorId: '3', inspectorName: '王安检员' })
                      }
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      派单
                    </button>
                  )}
                  {task.status === 'assigned' && (
                    <button
                      onClick={() =>
                        updateTask(task.id, { status: 'in_progress', statusLabel: '进行中' })
                      }
                      className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                      开始执行
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <Link
                      to={`/inspection/${task.id}`}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      录入检查
                    </Link>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
