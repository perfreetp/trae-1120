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
  X,
  Camera,
  MapPinned,
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

const inspectors = [
  { id: '3', name: '王安检员' },
  { id: '4', name: '赵安检员' },
  { id: '5', name: '刘安检员' },
];

export default function Tasks() {
  const { tasks, updateTask, batchUpdateTasks } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentTaskForPhoto, setCurrentTaskForPhoto] = useState<Task | null>(null);
  const [taskPhotos, setTaskPhotos] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState('');

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

  const selectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id));
    }
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

  const formatDateTime = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s;
  };

  const showSuccessMessage = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(''), 2000);
  };

  const handleBatchAssign = () => {
    if (!selectedInspector) return;
    const inspector = inspectors.find((i) => i.id === selectedInspector);
    const taskCount = selectedTasks.length;
    batchUpdateTasks(selectedTasks, {
      status: 'assigned',
      statusLabel: '已派单',
      inspectorId: selectedInspector,
      inspectorName: inspector?.name,
    });
    setShowAssignModal(false);
    setSelectedTasks([]);
    setSelectedInspector('');
    showSuccessMessage('已成功派单 ' + taskCount + ' 个任务给 ' + inspector?.name);
  };

  const handleBatchReschedule = () => {
    if (!selectedDate) return;
    const taskCount = selectedTasks.length;
    batchUpdateTasks(selectedTasks, {
      scheduledDate: selectedDate,
    });
    setShowRescheduleModal(false);
    setSelectedTasks([]);
    setSelectedDate('');
    showSuccessMessage('已成功改期 ' + taskCount + ' 个任务');
  };

  const handleBatchReassign = () => {
    if (!selectedInspector) return;
    const inspector = inspectors.find((i) => i.id === selectedInspector);
    const taskCount = selectedTasks.length;
    batchUpdateTasks(selectedTasks, {
      inspectorId: selectedInspector,
      inspectorName: inspector?.name,
    });
    setShowReassignModal(false);
    setSelectedTasks([]);
    setSelectedInspector('');
    showSuccessMessage('已成功转派 ' + taskCount + ' 个任务给 ' + inspector?.name);
  };

  const handleCheckIn = (task: Task) => {
    const now = new Date();
    const timeStr = formatDateTime(now);
    updateTask(task.id, {
      checkInStatus: 'checked_in',
      checkInStatusLabel: '已签到',
      checkInTime: timeStr,
    });
    showSuccessMessage('签到成功！');
  };

  const handleStartTask = (task: Task) => {
    updateTask(task.id, {
      status: 'in_progress',
      statusLabel: '进行中',
      checkInStatus: 'pending',
      checkInStatusLabel: '未签到',
    });
  };

  const openPhotoModal = (task: Task) => {
    setCurrentTaskForPhoto(task);
    setTaskPhotos(task.photos || []);
    setShowPhotoModal(true);
  };

  const handleAddPhoto = () => {
    const photoNum = taskPhotos.length + 1;
    const timeStr = new Date().toLocaleString('zh-CN');
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="#e5e7eb" width="300" height="200"/><text x="150" y="110" text-anchor="middle" fill="#6b7280" font-size="16">现场照片 ' + photoNum + '</text><text x="150" y="140" text-anchor="middle" fill="#9ca3af" font-size="12">' + timeStr + '</text></svg>';
    const newPhoto = 'data:image/svg+xml,' + encodeURIComponent(svgContent);
    setTaskPhotos([...taskPhotos, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setTaskPhotos(taskPhotos.filter((_, i) => i !== index));
  };

  const savePhotos = () => {
    if (!currentTaskForPhoto) return;
    updateTask(currentTaskForPhoto.id, {
      photos: taskPhotos,
      photoCount: taskPhotos.length,
    });
    setShowPhotoModal(false);
    setCurrentTaskForPhoto(null);
    setTaskPhotos([]);
    showSuccessMessage('照片保存成功！');
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          {showSuccess}
        </div>
      )}

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
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                批量派单
              </button>
              <button
                onClick={() => setShowRescheduleModal(true)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                批量改期
              </button>
              <button
                onClick={() => setShowReassignModal(true)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                批量转派
              </button>
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                取消选择
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {filteredTasks.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                onChange={selectAllTasks}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">全选当前列表</span>
            </div>
          )}
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
                    {task.checkInStatus && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.checkInStatus === 'checked_in'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.checkInStatusLabel}
                      </span>
                    )}
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
                    {task.checkInTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        签到时间：{task.checkInTime}
                      </span>
                    )}
                    {typeof task.photoCount === 'number' && task.photoCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        已留痕 {task.photoCount} 张
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
                      onClick={() => handleStartTask(task)}
                      className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                      开始执行
                    </button>
                  )}
                  {task.status === 'in_progress' && task.checkInStatus !== 'checked_in' && (
                    <button
                      onClick={() => handleCheckIn(task)}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
                    >
                      <MapPinned className="w-4 h-4" />
                      签到
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => openPhotoModal(task)}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center gap-1"
                    >
                      <Camera className="w-4 h-4" />
                      拍照留痕
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

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">批量派单</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              已选择 <span className="font-semibold text-blue-600">{selectedTasks.length}</span> 个任务，请选择安检员：
            </p>
            <div className="space-y-2 mb-6">
              {inspectors.map((inspector) => (
                <button
                  key={inspector.id}
                  onClick={() => setSelectedInspector(inspector.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    selectedInspector === inspector.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{inspector.name}</p>
                      <p className="text-sm text-gray-500">安检员</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchAssign}
                disabled={!selectedInspector}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认派单
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">批量改期</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              已选择 <span className="font-semibold text-blue-600">{selectedTasks.length}</span> 个任务，请选择新的计划日期：
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">计划日期</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchReschedule}
                disabled={!selectedDate}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认改期
              </button>
            </div>
          </div>
        </div>
      )}

      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">批量转派</h3>
              <button onClick={() => setShowReassignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              已选择 <span className="font-semibold text-blue-600">{selectedTasks.length}</span> 个任务，请选择新的安检员：
            </p>
            <div className="space-y-2 mb-6">
              {inspectors.map((inspector) => (
                <button
                  key={inspector.id}
                  onClick={() => setSelectedInspector(inspector.id)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    selectedInspector === inspector.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{inspector.name}</p>
                      <p className="text-sm text-gray-500">安检员</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchReassign}
                disabled={!selectedInspector}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                确认转派
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && currentTaskForPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">拍照留痕</h3>
                <p className="text-sm text-gray-500 mt-1">
                  任务：{currentTaskForPhoto.taskNo} - {currentTaskForPhoto.householdName}
                </p>
              </div>
              <button onClick={() => setShowPhotoModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">现场照片 ({taskPhotos.length})</h4>
                <button
                  onClick={handleAddPhoto}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  添加照片
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {taskPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`现场照片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {taskPhotos.length === 0 && (
                  <div className="col-span-4 py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">点击上方按钮添加现场照片</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={savePhotos}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                保存照片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
