import { useState } from 'react';
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
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { WorkOrder } from '@/types';

const typeTabs = [
  { key: 'all', label: '全部' },
  { key: 'leak', label: '泄漏报修' },
  { key: 'repair', label: '维修工单' },
  { key: 'shutdown', label: '停气通知' },
  { key: 'other', label: '其他' },
];

export default function WorkOrders() {
  const { workOrders, updateWorkOrder, addWorkOrderProgress, currentUser } = useStore();
  const [activeTypeTab, setActiveTypeTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState('');

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

  const handleAcceptOrder = () => {
    if (!selectedOrder || !currentUser) return;
    
    const now = new Date();
    const timeStr = formatDateTime(now);

    updateWorkOrder(selectedOrder.id, {
      status: 'processing',
      statusLabel: '处理中',
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
    });

    addWorkOrderProgress(selectedOrder.id, {
      status: '接单处理',
      description: currentUser.name + ' 已接单，开始处理工单',
      operatorName: currentUser.name,
      timestamp: timeStr,
    });

    showSuccessMessage('接单成功！');
  };

  const handleCompleteOrder = () => {
    if (!selectedOrder || !currentUser) return;
    
    const now = new Date();
    const timeStr = formatDateTime(now);
    const dateStr = formatDate(now);

    updateWorkOrder(selectedOrder.id, {
      status: 'completed',
      statusLabel: '已完成',
      completedDate: dateStr,
    });

    addWorkOrderProgress(selectedOrder.id, {
      status: '完成工单',
      description: '工单已处理完成，等待回访',
      operatorName: currentUser.name,
      timestamp: timeStr,
    });

    showSuccessMessage('工单已完成！');
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
                ? 'p-4 cursor-pointer transition-colors bg-blue-50'
                : 'p-4 cursor-pointer transition-colors hover:bg-gray-50';
              return (
                <div
                  key={order.id}
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
            <div className="space-y-6">
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
                {selectedOrder.assigneeName && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">处理人：{selectedOrder.assigneeName}</span>
                  </div>
                )}
              </div>

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

              <div className="space-y-2 pt-4 border-t border-gray-100">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={handleAcceptOrder}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    接单处理
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={handleCompleteOrder}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
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
