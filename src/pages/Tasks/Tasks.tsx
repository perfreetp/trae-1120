import { useState, useRef } from 'react';
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
  Eye,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Send,
  Play,
  Image as ImageIcon,
  Trash2,
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

const progressSteps = [
  { key: 'assigned', label: '派单', icon: Send },
  { key: 'started', label: '开始', icon: Play },
  { key: 'checked_in', label: '签到', icon: MapPinned },
  { key: 'photo_added', label: '拍照', icon: Camera },
  { key: 'inspection_submitted', label: '检查', icon: FileText },
  { key: 'completed', label: '完成', icon: CheckCircle2 },
];

export default function Tasks() {
  const { tasks, households, inspections, hazards, updateTask, batchUpdateTasks, addTaskTimelineItem, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentTaskForPhoto, setCurrentTaskForPhoto] = useState<Task | null>(null);
  const [currentTaskForDetail, setCurrentTaskForDetail] = useState<Task | null>(null);
  const [taskPhotos, setTaskPhotos] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

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

  const getTaskProgress = (task: Task) => {
    const statusOrder = ['pending', 'assigned', 'in_progress', 'completed', 'overdue'];
    const currentIndex = statusOrder.indexOf(task.status);
    
    const completedSteps: string[] = [];
    if (currentIndex >= statusOrder.indexOf('assigned') && task.inspectorId) {
      completedSteps.push('assigned');
    }
    if (currentIndex >= statusOrder.indexOf('in_progress')) {
      completedSteps.push('started');
    }
    if (task.checkInStatus === 'checked_in') {
      completedSteps.push('checked_in');
    }
    if ((task.photoCount || 0) > 0) {
      completedSteps.push('photo_added');
    }
    const hasInspection = inspections.some((r) => r.taskId === task.id);
    if (hasInspection) {
      completedSteps.push('inspection_submitted');
    }
    if (task.status === 'completed') {
      completedSteps.push('completed');
    }
    return completedSteps;
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
    const now = new Date();
    const timeStr = formatDateTime(now);
    
    selectedTasks.forEach((taskId) => {
      addTaskTimelineItem(taskId, {
        status: 'assigned',
        statusLabel: '已派单',
        description: '任务已派单给 ' + inspector?.name,
        operatorName: currentUser?.name || '管理员',
        timestamp: timeStr,
      });
    });
    
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

  const getReassignableTasks = () => {
    return selectedTasks.filter((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      return task && (task.status === 'assigned' || task.status === 'in_progress');
    });
  };

  const handleBatchReassign = () => {
    if (!selectedInspector) return;
    const inspector = inspectors.find((i) => i.id === selectedInspector);
    const reassignableTasks = getReassignableTasks();
    const taskCount = reassignableTasks.length;
    
    reassignableTasks.forEach((taskId) => {
      addTaskTimelineItem(taskId, {
        status: 'assigned',
        statusLabel: '已转派',
        description: '任务已转派给 ' + inspector?.name,
        operatorName: currentUser?.name || '管理员',
        timestamp: formatDateTime(new Date()),
      });
    });
    
    batchUpdateTasks(reassignableTasks, {
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
    addTaskTimelineItem(task.id, {
      status: 'checked_in',
      statusLabel: '已签到',
      description: '已到达现场完成签到',
      operatorName: currentUser?.name || task.inspectorName || '安检员',
      timestamp: timeStr,
    });
    showSuccessMessage('签到成功！');
  };

  const handleStartTask = (task: Task) => {
    const now = new Date();
    updateTask(task.id, {
      status: 'in_progress',
      statusLabel: '进行中',
      checkInStatus: 'pending',
      checkInStatusLabel: '未签到',
    });
    addTaskTimelineItem(task.id, {
      status: 'started',
      statusLabel: '开始执行',
      description: '安检员开始执行任务',
      operatorName: currentUser?.name || task.inspectorName || '安检员',
      timestamp: formatDateTime(now),
    });
  };

  const openPhotoModal = (task: Task) => {
    setCurrentTaskForPhoto(task);
    setTaskPhotos(task.photos || []);
    setShowPhotoModal(true);
  };

  const openDetailModal = (task: Task) => {
    setCurrentTaskForDetail(task);
    setShowDetailModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setTaskPhotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    
    if (taskPhotos.length > 0) {
      addTaskTimelineItem(currentTaskForPhoto.id, {
        status: 'photo_added',
        statusLabel: '拍照留痕',
        description: '上传了 ' + taskPhotos.length + ' 张现场照片',
        operatorName: currentUser?.name || currentTaskForPhoto.inspectorName || '安检员',
        timestamp: formatDateTime(new Date()),
      });
    }
    
    setShowPhotoModal(false);
    setCurrentTaskForPhoto(null);
    setTaskPhotos([]);
    showSuccessMessage('照片保存成功！');
  };

  const getTaskHousehold = (task: Task) => {
    return households.find((h) => h.id === task.householdId);
  };

  const getTaskInspection = (task: Task) => {
    return inspections.find((r) => r.taskId === task.id);
  };

  const getTaskHazards = (task: Task) => {
    return hazards.filter((h) => h.taskId === task.id || (task.hazardIds || []).includes(h.id));
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          {showSuccess}
        </div>
      )}

      {previewPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => setPreviewPhoto(null)}>
          <button onClick={() => setPreviewPhoto(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
            <X className="w-6 h-6" />
          </button>
          <img src={previewPhoto} alt="预览" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" />
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
          {filteredTasks.map((task) => {
            const completedSteps = getTaskProgress(task);
            return (
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
                      {typeof task.photoCount === 'number' && task.photoCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="w-4 h-4" />
                          已留痕 {task.photoCount} 张
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-3">
                      {progressSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isCompleted = completedSteps.includes(step.key);
                        const isCurrent = completedSteps[completedSteps.length - 1] === step.key;
                        return (
                          <div key={step.key} className="flex items-center">
                            <div className={`flex flex-col items-center ${
                              isCompleted ? 'text-blue-600' : 'text-gray-300'
                            }`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                isCompleted 
                                  ? isCurrent ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100'
                              }`}>
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-xs mt-1 ${
                                isCompleted ? 'text-blue-600 font-medium' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                            {index < progressSteps.length - 1 && (
                              <div className={`w-8 h-0.5 mx-0.5 ${
                                isCompleted && completedSteps.includes(progressSteps[index + 1].key)
                                  ? 'bg-blue-600'
                                  : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetailModal(task)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      详情
                    </button>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => {
                          updateTask(task.id, { status: 'assigned', statusLabel: '已派单', inspectorId: '3', inspectorName: '王安检员' });
                          addTaskTimelineItem(task.id, {
                            status: 'assigned',
                            statusLabel: '已派单',
                            description: '任务已派单给王安检员',
                            operatorName: currentUser?.name || '管理员',
                            timestamp: formatDateTime(new Date()),
                          });
                        }}
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
                    {task.status === 'completed' && (
                      <Link
                        to={`/inspection/${task.id}`}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        查看记录
                      </Link>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">批量转派</h3>
              <button onClick={() => setShowReassignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              已选择 <span className="font-semibold text-blue-600">{selectedTasks.length}</span> 个任务，其中可转派（已派单/进行中）<span className="font-semibold text-green-600">{getReassignableTasks().length}</span> 个：
            </p>
            
            <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3">
              {selectedTasks.map((taskId) => {
                const task = tasks.find((t) => t.id === taskId);
                const canReassign = task && (task.status === 'assigned' || task.status === 'in_progress');
                return (
                  <div key={taskId} className={`flex items-center justify-between py-2 ${
                    !canReassign ? 'opacity-50' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-500">{task?.taskNo}</span>
                      <span className="text-sm text-gray-700">{task?.householdName}</span>
                    </div>
                    {canReassign ? (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        可转派
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {task?.statusLabel}，跳过
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-3">请选择新的安检员：</p>
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
                disabled={!selectedInspector || getReassignableTasks().length === 0}
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">现场照片 ({taskPhotos.length})</h4>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  上传照片
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {taskPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`现场照片 ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90"
                      onClick={() => setPreviewPhoto(photo)}
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">点击上传</span>
                </button>
                {taskPhotos.length === 0 && (
                  <div className="col-span-3 py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">点击上传按钮或左侧区域添加现场照片</p>
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

      {showDetailModal && currentTaskForDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">任务详情</h3>
                <p className="text-sm text-gray-500 mt-1">{currentTaskForDetail.taskNo} - {currentTaskForDetail.householdName}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">任务状态</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentTaskForDetail.status)}`}>
                    {currentTaskForDetail.statusLabel}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">任务类型</p>
                  <p className="text-sm font-medium text-gray-900">{currentTaskForDetail.typeLabel}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">安检员</p>
                  <p className="text-sm font-medium text-gray-900">{currentTaskForDetail.inspectorName || '未分配'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">计划日期</p>
                  <p className="text-sm font-medium text-gray-900">{currentTaskForDetail.scheduledDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">签到状态</p>
                  <p className="text-sm font-medium text-gray-900">{currentTaskForDetail.checkInStatusLabel || '未签到'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">照片数量</p>
                  <p className="text-sm font-medium text-gray-900">{currentTaskForDetail.photoCount || 0} 张</p>
                </div>
              </div>
              
              {getTaskHousehold(currentTaskForDetail) && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    住户信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">姓名：</span>
                      {getTaskHousehold(currentTaskForDetail)?.ownerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">联系电话：</span>
                      {getTaskHousehold(currentTaskForDetail)?.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">地址：</span>
                      {currentTaskForDetail.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">风险等级：</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        getTaskHousehold(currentTaskForDetail)?.riskLevel === 'high'
                          ? 'bg-red-100 text-red-700'
                          : getTaskHousehold(currentTaskForDetail)?.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {getTaskHousehold(currentTaskForDetail)?.riskLevel === 'high' ? '高风险' : getTaskHousehold(currentTaskForDetail)?.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              {(currentTaskForDetail.photos || []).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    现场照片 ({(currentTaskForDetail.photos || []).length})
                  </h4>
                  <div className="grid grid-cols-5 gap-3">
                    {(currentTaskForDetail.photos || []).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`现场照片 ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {getTaskInspection(currentTaskForDetail) && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    检查记录
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-600">
                      <span className="text-gray-500">检查日期：</span>
                      {getTaskInspection(currentTaskForDetail)?.checkDate}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">表具读数：</span>
                      {getTaskInspection(currentTaskForDetail)?.meterReading} m³
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">软管状态：</span>
                      {getTaskInspection(currentTaskForDetail)?.hoseStatusLabel}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">报警器状态：</span>
                      {getTaskInspection(currentTaskForDetail)?.alarmStatusLabel}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">通风条件：</span>
                      {getTaskInspection(currentTaskForDetail)?.ventilationLabel}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-500">安检员：</span>
                      {getTaskInspection(currentTaskForDetail)?.inspectorName}
                    </p>
                  </div>
                  {getTaskInspection(currentTaskForDetail)?.remarks && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="text-gray-500">备注：</span>
                      {getTaskInspection(currentTaskForDetail)?.remarks}
                    </p>
                  )}
                  <Link
                    to={`/inspection/${currentTaskForDetail.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    查看完整记录
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
              {getTaskHazards(currentTaskForDetail).length > 0 && (
                <div className="p-4 bg-orange-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    关联隐患 ({getTaskHazards(currentTaskForDetail).length})
                  </h4>
                  <div className="space-y-2">
                    {getTaskHazards(currentTaskForDetail).map((hazard) => (
                      <div key={hazard.id} className="p-3 bg-white rounded-lg border border-orange-100">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            hazard.level === 'critical' ? 'bg-red-100 text-red-700' :
                            hazard.level === 'major' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {hazard.levelLabel}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            hazard.status === 'closed' ? 'bg-green-100 text-green-700' :
                            hazard.status === 'rectifying' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {hazard.statusLabel}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-2">{hazard.type}</p>
                        <p className="text-xs text-gray-500 mt-1">{hazard.description}</p>
                        {hazard.status === 'closed' && hazard.recheckResult && (
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            整改结果：{hazard.recheckResult}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  任务时间线
                </h4>
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />
                  {(currentTaskForDetail.timeline || []).slice().reverse().map((item, index) => (
                    <div key={item.id} className="relative pl-10 pb-4">
                      <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          index === 0 ? 'bg-white' : 'bg-white'
                        }`} />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.statusLabel}</span>
                          <span className="text-xs text-gray-500">{item.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-1">操作人：{item.operatorName}</p>
                      </div>
                    </div>
                  ))}
                  {(currentTaskForDetail.timeline || []).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">暂无时间线记录</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
