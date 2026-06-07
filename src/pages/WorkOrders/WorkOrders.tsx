import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  Search,
  Clock,
  User,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  Star,
  MoreHorizontal,
  Plus,
  Filter,
  CheckCircle,
  Camera,
  X,
  Image as ImageIcon,
  MapPinned,
  FileText,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { WorkOrder, WorkOrderProgress } from '@/types';

const typeTabs = [
  { key: 'all', label: '全部' },
  { key: 'leak', label: '泄漏报修' },
  { key: 'repair', label: '维修工单' },
  { key: 'shutdown', label: '停气通知' },
  { key: 'other', label: '其他' },
];

export default function WorkOrders() {
  const location = useLocation();
  const { workOrders, updateWorkOrder, addWorkOrderProgress, currentUser } = useStore();
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState('');

  useEffect(() => {
    const state = location.state as { selectedOrderId?: string } | null;
    if (state?.selectedOrderId) {
      setSelectedOrderId(state.selectedOrderId);
      window.setTimeout(() => {
        const element = document.getElementById('order-' + state.selectedOrderId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location.state]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [handlingNotes, setHandlingNotes] = useState('');
  const [orderPhotos, setOrderPhotos] = useState<string[]>([]);
  const [arrivalTime, setArrivalTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedOrder = workOrders.find((wo) => wo.id === selectedOrderId) || null;

  const filteredOrders = workOrders.filter((order) => {
    const matchesType = activeTypeTab === 'all' || order.type === activeTypeTab;
    const matchesSearch =
      order.orderNo.includes(searchQuery) ||
      order.title.includes(searchQuery) ||
      order.address.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: WorkOrder['type']) => {
    const icons = {
      leak: AlertTriangle,
      shutdown: Wrench,
      repair: Wrench,
      other: Wrench,
    };
    return icons[type];
  };

  const getTypeColor = (type: WorkOrder['type']) => {
    const colors = {
      leak: 'bg-red-100 text-red-700',
      shutdown: 'bg-orange-100 text-orange-700',
      repair: 'bg-blue-100 text-blue-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[type];
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    const colors = {
      normal: 'bg-gray-100 text-gray-700',
      urgent: 'bg-orange-100 text-orange-700',
      emergency: 'bg-red-100 text-red-700',
    };
    return colors[priority];
  };

  const getStatusColor = (status: WorkOrder['status']) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-600',
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setOrderPhotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setOrderPhotos(orderPhotos.filter((_, i) => i !== index));
  };

  const handleAcceptOrder = () => {
    if (!selectedOrder || !currentUser) return;
    
    const now = new Date();
    const timeStr = formatDateTime(now);

    updateWorkOrder(selectedOrder.id, {
      status: 'processing',
      statusLabel: '处理中',
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      arrivalTime: timeStr,
    });

    addWorkOrderProgress(selectedOrder.id, {
      status: '接单处理',
      description: currentUser.name + ' 已接单，正在赶往现场',
      operatorName: currentUser.name,
      timestamp: timeStr,
    });

    showSuccessMessage('接单成功！');
  };

  const handleOpenCompleteModal = () => {
    if (!selectedOrder) return;
    setHandlingNotes(selectedOrder.handlingNotes || '');
    setOrderPhotos(selectedOrder.photos || []);
    setArrivalTime(selectedOrder.arrivalTime || '');
    setShowCompleteModal(true);
  };

  const handleCompleteOrder = () => {
    if (!selectedOrder || !currentUser) return;
    
    const now = new Date();
    const timeStr = formatDateTime(now);
    const dateStr = formatDate(now);
    const finalArrivalTime = arrivalTime || selectedOrder.arrivalTime || timeStr;

    updateWorkOrder(selectedOrder.id, {
      status: 'completed',
      statusLabel: '已完成',
      completedDate: dateStr,
      arrivalTime: finalArrivalTime,
      handlingNotes: handlingNotes,
      photos: orderPhotos,
    });

    const progressDescription = '到场时间：' + finalArrivalTime + '。' + (handlingNotes || '工单已处理完成');
    addWorkOrderProgress(selectedOrder.id, {
      status: '完成工单',
      description: progressDescription,
      operatorName: currentUser.name,
      timestamp: timeStr,
      photos: orderPhotos.length > 0 ? orderPhotos : undefined,
    });

    setShowCompleteModal(false);
    setHandlingNotes('');
    setOrderPhotos([]);
    setArrivalTime('');
    showSuccessMessage('工单已完成！');
  };

  const getAllProgressPhotos = (order: WorkOrder) => {
    const photos: string[] = [];
    order.progress.forEach((p) => {
      if (p.photos) {
        photos.push(...p.photos);
      }
    });
    return photos;
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

      {showCompleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">完成工单</h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工单信息
                </label>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedOrder.orderNo}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  到场时间
                </label>
                <div className="relative">
                  <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => {
                      setArrivalTime(e.target.value);
                      if (selectedOrder) {
                        updateWorkOrder(selectedOrder.id, { arrivalTime: e.target.value });
                      }
                    }}
                    placeholder="请输入到场时间，如：2026-06-07 10:30:00"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">可以手动修改到场时间，格式：YYYY-MM-DD HH:MM:SS</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  处理说明
                </label>
                <textarea
                  value={handlingNotes}
                  onChange={(e) => setHandlingNotes(e.target.value)}
                  placeholder="请输入处理说明，描述问题原因和解决方案..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    现场照片 ({orderPhotos.length})
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Camera className="w-4 h-4" />
                    上传
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

                <div className="grid grid-cols-4 gap-3">
                  {orderPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={'现场照片 ' + (index + 1)}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                        onClick={() => setPreviewPhoto(photo)}
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
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
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCompleteOrder}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工单管理</h1>
          <p className="text-gray-500 mt-1">处理泄漏报修、停气通知和抢修工单</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建工单
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待处理</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {workOrders.filter(function(o) { return o.status === 'pending'; }).length}
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
              <p className="text-sm text-gray-500">处理中</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {workOrders.filter(function(o) { return o.status === 'processing'; }).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">紧急工单</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {workOrders.filter(function(o) { return o.priority === 'emergency'; }).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {workOrders.filter(function(o) { return o.status === 'completed' || o.status === 'closed'; }).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {typeTabs.map(function(tab) {
                  return (
                    <button
                      key={tab.key}
                      onClick={function() { setActiveTypeTab(tab.key); }}
                      className={activeTypeTab === tab.key
                        ? 'px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-600'
                        : 'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50'}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索工单..."
                  value={searchQuery}
                  onChange={function(e) { setSearchQuery(e.target.value); }}
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredOrders.map(function(order) {
              const TypeIcon = getTypeIcon(order.type);
              const isSelected = selectedOrder?.id === order.id;
              const rowClass = isSelected
                ? 'p-4 cursor-pointer transition-colors bg-blue-50 ring-2 ring-blue-200'
                : 'p-4 cursor-pointer transition-colors hover:bg-gray-50';
              return (
                <div
                  key={order.id}
                  id={'order-' + order.id}
                  onClick={function() { setSelectedOrderId(order.id); }}
                  className={rowClass}
                >
                  <div className="flex items-start gap-4">
                    <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + getTypeColor(order.type)}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">{order.orderNo}</span>
                        <span className={'px-2 py-0.5 rounded-lg text-xs font-medium ' + getPriorityColor(order.priority)}>
                          {order.priorityLabel}
                        </span>
                        <span className={'px-2 py-0.5 rounded-lg text-xs font-medium ' + getStatusColor(order.status)}>
                          {order.statusLabel}
                        </span>
                      </div>
                      <h4 className="text-base font-medium text-gray-900 mt-1 truncate">
                        {order.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{order.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {order.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {order.createDate}
                        </span>
                        {order.photos && order.photos.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-4 h-4" />
                            {order.photos.length} 张照片
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {selectedOrder ? (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">工单详情</h3>
                    <span className={'px-3 py-1 rounded-lg text-sm font-medium ' + getStatusColor(selectedOrder.status)}>
                      {selectedOrder.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.orderNo}</p>
                </div>

                <div>
                  <h4 className="text-base font-medium text-gray-900">{selectedOrder.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{selectedOrder.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedOrder.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedOrder.contactName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedOrder.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">创建时间：{selectedOrder.createDate}</span>
                  </div>
                  {selectedOrder.arrivalTime && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPinned className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">到场时间：{selectedOrder.arrivalTime}</span>
                    </div>
                  )}
                  {selectedOrder.assigneeName && (
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">处理人：{selectedOrder.assigneeName}</span>
                    </div>
                  )}
                </div>

                {selectedOrder.handlingNotes && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">处理说明</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedOrder.handlingNotes}</p>
                  </div>
                )}

                {getAllProgressPhotos(selectedOrder).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-purple-600" />
                      现场照片 ({getAllProgressPhotos(selectedOrder).length})
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {getAllProgressPhotos(selectedOrder).slice(0, 8).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={'现场照片 ' + (index + 1)}
                          className="w-full h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                          onClick={() => setPreviewPhoto(photo)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.progress.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">处理进度</h4>
                    <div className="space-y-4">
                      {selectedOrder.progress.map(function(progress, index) {
                        const isLast = index === selectedOrder.progress.length - 1;
                        return (
                          <div key={progress.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={isLast ? 'w-3 h-3 rounded-full bg-blue-500' : 'w-3 h-3 rounded-full bg-green-500'} />
                              {!isLast && (
                                <div className="w-0.5 h-full bg-gray-200 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="text-sm font-medium text-gray-900">{progress.status}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{progress.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {progress.operatorName} · {progress.timestamp}
                              </p>
                              {progress.photos && progress.photos.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {progress.photos.slice(0, 3).map((photo, pIndex) => (
                                    <img
                                      key={pIndex}
                                      src={photo}
                                      alt={'进度照片 ' + (pIndex + 1)}
                                      className="w-12 h-12 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-90"
                                      onClick={() => setPreviewPhoto(photo)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedOrder.followUp && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">回访记录</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map(function(_, i) {
                        const filled = i < selectedOrder.followUp!.satisfaction;
                        return (
                          <Star
                            key={i}
                            className={filled ? 'w-4 h-4 fill-yellow-400 text-yellow-400' : 'w-4 h-4 text-gray-300'}
                          />
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-600">{selectedOrder.followUp.feedback}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {selectedOrder.followUp.operatorName} · {selectedOrder.followUp.date}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={handleAcceptOrder}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-5 h-5" />
                    接单处理
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={handleOpenCompleteModal}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    完成工单
                  </button>
                )}
                <button className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  添加备注
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-500">选择一个工单查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
