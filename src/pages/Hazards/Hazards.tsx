import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Search,
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  Camera,
  Image as ImageIcon,
  FileText,
  Wrench,
  Send,
  CheckSquare,
  ArrowLeft,
  Bell,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Hazard } from '@/types';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待整改' },
  { key: 'rectifying', label: '整改中' },
  { key: 'rechecking', label: '待复查' },
  { key: 'closed', label: '已销号' },
];

const levelTabs = [
  { key: 'all', label: '全部等级' },
  { key: 'critical', label: '重大隐患' },
  { key: 'major', label: '较大隐患' },
  { key: 'general', label: '一般隐患' },
];

export default function Hazards() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hazards, updateHazard, addHazardTimelineItem, tasks, inspections, currentUser } = useStore();
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [activeLevelTab, setActiveLevelTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { selectedHazardId?: string } | null;
    if (state?.selectedHazardId) {
      setSelectedHazardId(state.selectedHazardId);
      window.setTimeout(() => {
        const element = document.getElementById('hazard-' + state.selectedHazardId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location.state]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRectifyModal, setShowRectifyModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState('');

  const [assignForm, setAssignForm] = useState({ assigneeName: '', deadline: '', rectificationPlan: '' });
  const [rectifyForm, setRectifyForm] = useState({ rectificationNotes: '' });
  const [rectifyPhotos, setRectifyPhotos] = useState<string[]>([]);
  const [recheckForm, setRecheckForm] = useState({ recheckResult: '合格', recheckNotes: '' });
  const [recheckPhotos, setRecheckPhotos] = useState<string[]>([]);

  const assignFileRef = useRef<HTMLInputElement>(null);
  const rectifyFileRef = useRef<HTMLInputElement>(null);
  const recheckFileRef = useRef<HTMLInputElement>(null);

  const selectedHazard = hazards.find((h) => h.id === selectedHazardId) || null;

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const dead = new Date(deadline);
    const diff = Math.ceil((dead.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isOverdue = (deadline?: string) => {
    const days = getDaysUntilDeadline(deadline);
    return days !== null && days < 0;
  };

  const isUrgent = (deadline?: string) => {
    const days = getDaysUntilDeadline(deadline);
    return days !== null && days >= 0 && days <= 3;
  };

  const getReminderText = (hazard: Hazard) => {
    if (hazard.status === 'closed') return null;
    if (isOverdue(hazard.deadline)) {
      const days = Math.abs(getDaysUntilDeadline(hazard.deadline)!);
      return '已超期 ' + days + ' 天';
    }
    if (isUrgent(hazard.deadline)) {
      const days = getDaysUntilDeadline(hazard.deadline)!;
      return days === 0 ? '今天到期' : '还剩 ' + days + ' 天';
    }
    return null;
  };

  const filteredHazards = hazards.filter((hazard) => {
    const matchesStatus = activeStatusTab === 'all' || hazard.status === activeStatusTab;
    const matchesLevel = activeLevelTab === 'all' || hazard.level === activeLevelTab;
    const matchesSearch =
      hazard.householdName.includes(searchQuery) ||
      hazard.address.includes(searchQuery) ||
      hazard.type.includes(searchQuery);
    return matchesStatus && matchesLevel && matchesSearch;
  });

  const getLevelColor = (level: Hazard['level']) => {
    const colors = {
      general: 'bg-green-100 text-green-700 border-green-200',
      major: 'bg-orange-100 text-orange-700 border-orange-200',
      critical: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[level];
  };

  const getLevelBadgeColor = (level: Hazard['level']) => {
    const colors = {
      general: 'bg-green-500',
      major: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[level];
  };

  const getStatusColor = (status: Hazard['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      rectifying: 'bg-blue-100 text-blue-700',
      rechecking: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-green-100 text-green-700',
    };
    return colors[status];
  };

  const showSuccessMessage = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(function() { setShowSuccess(''); }, 2000);
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

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhotos: React.Dispatch<React.SetStateAction<string[]>>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number, setPhotos: React.Dispatch<React.SetStateAction<string[]>>) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const openAssignModal = (hazard: Hazard) => {
    setSelectedHazardId(hazard.id);
    setAssignForm({
      assigneeName: hazard.assigneeName || '',
      deadline: hazard.deadline || '',
      rectificationPlan: hazard.rectificationPlan || '',
    });
    setShowAssignModal(true);
  };

  const handleAssign = () => {
    if (!selectedHazard || !currentUser) return;
    const now = new Date();
    const timeStr = formatDateTime(now);

    updateHazard(selectedHazard.id, {
      status: 'rectifying',
      statusLabel: '整改中',
      assigneeName: assignForm.assigneeName || '王安检员',
      deadline: assignForm.deadline,
      rectificationPlan: assignForm.rectificationPlan,
    });

    addHazardTimelineItem(selectedHazard.id, {
      status: 'assigned',
      statusLabel: '已分配',
      description: '隐患已分配给 ' + (assignForm.assigneeName || '王安检员') + '，整改计划：' + (assignForm.rectificationPlan || '无'),
      operatorName: currentUser.name,
      timestamp: timeStr,
    });

    setShowAssignModal(false);
    showSuccessMessage('整改已分配！');
  };

  const openRectifyModal = (hazard: Hazard) => {
    setSelectedHazardId(hazard.id);
    setRectifyForm({
      rectificationNotes: hazard.rectificationNotes || '',
    });
    setRectifyPhotos(hazard.rectificationPhotos || []);
    setShowRectifyModal(true);
  };

  const handleRectify = () => {
    if (!selectedHazard || !currentUser) return;
    const now = new Date();
    const timeStr = formatDateTime(now);

    updateHazard(selectedHazard.id, {
      status: 'rechecking',
      statusLabel: '待复查',
      rectificationNotes: rectifyForm.rectificationNotes,
      rectificationPhotos: rectifyPhotos,
    });

    addHazardTimelineItem(selectedHazard.id, {
      status: 'rectifying',
      statusLabel: '整改完成',
      description: '整改已完成，申请复查。整改说明：' + (rectifyForm.rectificationNotes || '无'),
      operatorName: currentUser.name,
      timestamp: timeStr,
      photos: rectifyPhotos.length > 0 ? rectifyPhotos : undefined,
    });

    setShowRectifyModal(false);
    setRectifyPhotos([]);
    showSuccessMessage('整改已提交，等待复查！');
  };

  const openRecheckModal = (hazard: Hazard) => {
    setSelectedHazardId(hazard.id);
    setRecheckForm({
      recheckResult: '合格',
      recheckNotes: hazard.recheckNotes || '',
    });
    setRecheckPhotos(hazard.recheckPhotos || []);
    setShowRecheckModal(true);
  };

  const handleRecheck = () => {
    if (!selectedHazard || !currentUser) return;
    const now = new Date();
    const timeStr = formatDateTime(now);
    const dateStr = formatDate(now);

    const isClosed = recheckForm.recheckResult === '合格';

    updateHazard(selectedHazard.id, {
      status: isClosed ? 'closed' : 'rectifying',
      statusLabel: isClosed ? '已销号' : '整改中',
      recheckDate: dateStr,
      recheckResult: recheckForm.recheckResult,
      recheckNotes: recheckForm.recheckNotes,
      recheckPhotos: recheckPhotos,
      closedDate: isClosed ? dateStr : undefined,
    });

    addHazardTimelineItem(selectedHazard.id, {
      status: isClosed ? 'closed' : 'rectifying',
      statusLabel: isClosed ? '已销号' : '复查不合格',
      description: '复查' + recheckForm.recheckResult + '。复查说明：' + (recheckForm.recheckNotes || '无'),
      operatorName: currentUser.name,
      timestamp: timeStr,
      photos: recheckPhotos.length > 0 ? recheckPhotos : undefined,
    });

    setShowRecheckModal(false);
    setRecheckPhotos([]);
    showSuccessMessage(isClosed ? '隐患已销号！' : '已退回整改！');
  };

  const getSourceTask = (hazard: Hazard) => {
    return tasks.find((t) => t.id === hazard.taskId);
  };

  const getSourceInspection = (hazard: Hazard) => {
    return inspections.find((i) => i.id === hazard.inspectionRecordId);
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
          <h1 className="text-2xl font-bold text-gray-900">隐患管理</h1>
          <p className="text-gray-500 mt-1">管理安全隐患的整改、复查和销号</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            高级筛选
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待整改</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {hazards.filter((h) => h.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">整改中</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {hazards.filter((h) => h.status === 'rectifying').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待复查</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {hazards.filter((h) => h.status === 'rechecking').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已销号</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {hazards.filter((h) => h.status === 'closed').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatusTab(tab.key)}
                  className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + (activeStatusTab === tab.key ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索隐患..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {levelTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveLevelTab(tab.key)}
                className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + (activeLevelTab === tab.key ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredHazards.map((hazard) => {
            const reminder = getReminderText(hazard);
            return (
              <div
                key={hazard.id}
                id={'hazard-' + hazard.id}
                className={'p-4 hover:bg-gray-50 transition-colors cursor-pointer ' + (selectedHazardId === hazard.id ? 'bg-blue-50 ring-2 ring-blue-200' : '')}
                onClick={() => setSelectedHazardId(hazard.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={'w-1 h-full min-h-[80px] rounded-full ' + getLevelBadgeColor(hazard.level)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={'px-2 py-0.5 rounded-lg text-xs font-medium border ' + getLevelColor(hazard.level)}>
                        {hazard.levelLabel}
                      </span>
                      <span className={'px-2 py-0.5 rounded-lg text-xs font-medium ' + getStatusColor(hazard.status)}>
                        {hazard.statusLabel}
                      </span>
                      {isOverdue(hazard.deadline) && hazard.status !== 'closed' && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          已超期
                        </span>
                      )}
                      {isUrgent(hazard.deadline) && !isOverdue(hazard.deadline) && hazard.status !== 'closed' && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          即将到期
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-medium text-gray-900 mt-2">
                      {hazard.type}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{hazard.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hazard.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {hazard.householdName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        创建于 {hazard.createDate}
                      </span>
                      {hazard.deadline && (
                        <span className={'flex items-center gap-1 ' + (isOverdue(hazard.deadline) ? 'text-red-600 font-medium' : '')}>
                          <Clock className="w-4 h-4" />
                          截止 {hazard.deadline}
                          {reminder && <span className="ml-1">({reminder})</span>}
                        </span>
                      )}
                      {hazard.assigneeName && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          整改人：{hazard.assigneeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hazard.status === 'pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openAssignModal(hazard); }}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        分配整改
                      </button>
                    )}
                    {hazard.status === 'rectifying' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openRectifyModal(hazard); }}
                        className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1"
                      >
                        <CheckSquare className="w-4 h-4" />
                        整改完成
                      </button>
                    )}
                    {hazard.status === 'rechecking' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openRecheckModal(hazard); }}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        复查销号
                      </button>
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

      {selectedHazard && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedHazardId(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">隐患详情</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  隐患编号：{selectedHazard.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={'px-3 py-1 rounded-lg text-sm font-medium border ' + getLevelColor(selectedHazard.level)}>
                {selectedHazard.levelLabel}
              </span>
              <span className={'px-3 py-1 rounded-lg text-sm font-medium ' + getStatusColor(selectedHazard.status)}>
                {selectedHazard.statusLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  隐患信息
                </h4>
                <div className="space-y-2">
                  <p className="text-base font-medium text-gray-900">{selectedHazard.type}</p>
                  <p className="text-sm text-gray-600">{selectedHazard.description}</p>
                </div>
              </div>

              {selectedHazard.photos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-500" />
                    整改前照片 ({selectedHazard.photos.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedHazard.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={'整改前照片 ' + (index + 1)}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedHazard.rectificationPhotos && selectedHazard.rectificationPhotos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-green-500" />
                    整改后照片 ({selectedHazard.rectificationPhotos.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedHazard.rectificationPhotos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={'整改后照片 ' + (index + 1)}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-200 cursor-pointer hover:opacity-90"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(selectedHazard.taskId || selectedHazard.inspectionRecordId) && (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    来源信息
                  </h4>
                  <div className="space-y-2">
                    {getSourceTask(selectedHazard) && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">来源任务</span>
                        <button
                          onClick={() => navigate('/tasks')}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {getSourceTask(selectedHazard)?.taskNo} - {getSourceTask(selectedHazard)?.typeLabel}
                        </button>
                      </div>
                    )}
                    {getSourceInspection(selectedHazard) && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">来源检查记录</span>
                        <span className="text-gray-900 font-medium">
                          {getSourceInspection(selectedHazard)?.checkDate} 检查
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedHazard.rectificationPlan && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-green-500" />
                    整改计划
                  </h4>
                  <p className="text-sm text-gray-600">{selectedHazard.rectificationPlan}</p>
                </div>
              )}

              {selectedHazard.rectificationNotes && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    整改说明
                  </h4>
                  <p className="text-sm text-gray-600">{selectedHazard.rectificationNotes}</p>
                  {selectedHazard.rectificationPhotos && selectedHazard.rectificationPhotos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">整改后照片</p>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedHazard.rectificationPhotos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={'整改照片 ' + (index + 1)}
                            className="w-full h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90"
                            onClick={() => setPreviewPhoto(photo)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedHazard.recheckResult && (
                <div className="p-4 bg-green-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    复查结果
                  </h4>
                  <p className="text-sm text-gray-900 font-medium">复查结论：{selectedHazard.recheckResult}</p>
                  {selectedHazard.recheckNotes && (
                    <p className="text-sm text-gray-600 mt-1">{selectedHazard.recheckNotes}</p>
                  )}
                  {selectedHazard.recheckPhotos && selectedHazard.recheckPhotos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">复查照片</p>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedHazard.recheckPhotos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={'复查照片 ' + (index + 1)}
                            className="w-full h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90"
                            onClick={() => setPreviewPhoto(photo)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedHazard.timeline && selectedHazard.timeline.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">整改时间线</h4>
                  <div className="space-y-4">
                    {selectedHazard.timeline.map((item, index) => {
                      const isLast = index === selectedHazard.timeline!.length - 1;
                      const isRectifying = item.status === 'rectifying';
                      const isRechecking = item.status === 'rechecking';
                      const isClosed = item.status === 'closed';
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={'w-3 h-3 rounded-full ' + (
                              isClosed ? 'bg-green-500' :
                              isRechecking ? 'bg-purple-500' :
                              isRectifying ? 'bg-yellow-500' :
                              isLast ? 'bg-blue-500' : 'bg-gray-400'
                            )} />
                            {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{item.statusLabel}</p>
                              {isRectifying && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">整改后</span>}
                              {isRechecking && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">复查</span>}
                              {isClosed && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">销号</span>}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.operatorName} · {item.timestamp}
                            </p>
                            {item.photos && item.photos.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {item.photos.slice(0, 3).map((photo, pIndex) => (
                                  <div key={pIndex} className="relative">
                                    <img
                                      src={photo}
                                      alt={'时间线照片 ' + (pIndex + 1)}
                                      className={'w-12 h-12 object-cover rounded cursor-pointer hover:opacity-90 ' + (
                                        isRectifying ? 'border-2 border-green-200' :
                                        isRechecking ? 'border-2 border-purple-200' :
                                        'border border-gray-200'
                                      )}
                                      onClick={() => setPreviewPhoto(photo)}
                                    />
                                  </div>
                                ))}
                                {item.photos.length > 3 && (
                                  <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                    +{item.photos.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-white border border-gray-100 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">住户信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedHazard.householdName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedHazard.address}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-100 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">整改信息</h4>
                <div className="space-y-2 text-sm">
                  {selectedHazard.assigneeName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">整改人：</span>
                      <span className="text-gray-900">{selectedHazard.assigneeName}</span>
                    </div>
                  )}
                  {selectedHazard.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">整改期限：</span>
                      <span className={isOverdue(selectedHazard.deadline) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                        {selectedHazard.deadline}
                        {getReminderText(selectedHazard) && <span className="ml-1">({getReminderText(selectedHazard)})</span>}
                      </span>
                    </div>
                  )}
                  {selectedHazard.recheckDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">复查日期：</span>
                      <span className="text-gray-900">{selectedHazard.recheckDate}</span>
                    </div>
                  )}
                  {selectedHazard.closedDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">销号日期：</span>
                      <span className="text-green-600">{selectedHazard.closedDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {selectedHazard.status === 'pending' && (
                  <button
                    onClick={() => openAssignModal(selectedHazard)}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    分配整改
                  </button>
                )}
                {selectedHazard.status === 'rectifying' && (
                  <button
                    onClick={() => openRectifyModal(selectedHazard)}
                    className="w-full px-4 py-2.5 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-5 h-5" />
                    提交整改
                  </button>
                )}
                {selectedHazard.status === 'rechecking' && (
                  <button
                    onClick={() => openRecheckModal(selectedHazard)}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    复查销号
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedHazard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">分配整改</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改负责人</label>
                <input
                  type="text"
                  value={assignForm.assigneeName}
                  onChange={(e) => setAssignForm({ ...assignForm, assigneeName: e.target.value })}
                  placeholder="请输入整改负责人姓名"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改期限</label>
                <input
                  type="date"
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改计划</label>
                <textarea
                  value={assignForm.rectificationPlan}
                  onChange={(e) => setAssignForm({ ...assignForm, rectificationPlan: e.target.value })}
                  placeholder="请输入整改计划和要求"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                确认分配
              </button>
            </div>
          </div>
        </div>
      )}

      {showRectifyModal && selectedHazard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">提交整改</h3>
              <button onClick={() => setShowRectifyModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">整改说明</label>
                <textarea
                  value={rectifyForm.rectificationNotes}
                  onChange={(e) => setRectifyForm({ ...rectifyForm, rectificationNotes: e.target.value })}
                  placeholder="请详细描述整改措施和完成情况"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {selectedHazard.photos.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">整改前照片 ({selectedHazard.photos.length})</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {selectedHazard.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={'整改前照片 ' + (index + 1)}
                        className="w-full h-16 object-cover rounded-lg border border-gray-200 cursor-pointer opacity-80"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">整改后照片 ({rectifyPhotos.length})</label>
                  <button
                    onClick={() => rectifyFileRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Camera className="w-4 h-4" />
                    上传
                  </button>
                </div>
                <input
                  ref={rectifyFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, setRectifyPhotos)}
                  className="hidden"
                />
                <div className="grid grid-cols-4 gap-3">
                  {rectifyPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={'整改后照片 ' + (index + 1)}
                        className="w-full h-20 object-cover rounded-lg border-2 border-green-200 cursor-pointer"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                      <button
                        onClick={() => handleRemovePhoto(index, setRectifyPhotos)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => rectifyFileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">添加</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRectifyModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRectify}
                className="flex-1 px-4 py-2.5 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
              >
                申请复查
              </button>
            </div>
          </div>
        </div>
      )}

      {showRecheckModal && selectedHazard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">复查销号</h3>
              <button onClick={() => setShowRecheckModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">复查结论</label>
                <select
                  value={recheckForm.recheckResult}
                  onChange={(e) => setRecheckForm({ ...recheckForm, recheckResult: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="合格">整改合格，予以销号</option>
                  <option value="不合格">整改不合格，退回重改</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">复查说明</label>
                <textarea
                  value={recheckForm.recheckNotes}
                  onChange={(e) => setRecheckForm({ ...recheckForm, recheckNotes: e.target.value })}
                  placeholder="请输入复查说明和意见"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">复查照片 ({recheckPhotos.length})</label>
                  <button
                    onClick={() => recheckFileRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Camera className="w-4 h-4" />
                    上传
                  </button>
                </div>
                <input
                  ref={recheckFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, setRecheckPhotos)}
                  className="hidden"
                />
                <div className="grid grid-cols-4 gap-3">
                  {recheckPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={'复查照片 ' + (index + 1)}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                      <button
                        onClick={() => handleRemovePhoto(index, setRecheckPhotos)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => recheckFileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">添加</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRecheckModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRecheck}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                确认复查
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
