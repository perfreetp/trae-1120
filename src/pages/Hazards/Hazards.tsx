import { useState } from 'react';
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
  const { hazards, updateHazard } = useStore();
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [activeLevelTab, setActiveLevelTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);

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

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStatusTab === tab.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeLevelTab === tab.key
                    ? 'bg-gray-100 text-gray-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredHazards.map((hazard) => (
            <div
              key={hazard.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedHazard(hazard)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-1 h-full min-h-[80px] rounded-full ${getLevelBadgeColor(hazard.level)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getLevelColor(hazard.level)}`}>
                      {hazard.levelLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getStatusColor(hazard.status)}`}>
                      {hazard.statusLabel}
                    </span>
                    {isOverdue(hazard.deadline) && hazard.status !== 'closed' && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        已超期
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mt-2">
                    {hazard.type}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{hazard.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
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
                      <span className={`flex items-center gap-1 ${isOverdue(hazard.deadline) ? 'text-red-600 font-medium' : ''}`}>
                        <Clock className="w-4 h-4" />
                        截止 {hazard.deadline}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        updateHazard(hazard.id, { status: 'rectifying', statusLabel: '整改中', assigneeId: '3', assigneeName: '王安检员' });
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      分配整改
                    </button>
                  )}
                  {hazard.status === 'rectifying' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateHazard(hazard.id, { status: 'rechecking', statusLabel: '待复查' });
                      }}
                      className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                      申请复查
                    </button>
                  )}
                  {hazard.status === 'rechecking' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateHazard(hazard.id, { status: 'closed', statusLabel: '已销号', recheckDate: '2026-06-07', recheckResult: '整改合格' });
                      }}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      复查销号
                    </button>
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
