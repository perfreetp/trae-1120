import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Flame,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const COLORS = ['#10b981', '#f97316', '#ef4444'];

export default function Dashboard() {
  const { statistics } = useStore();

  const hazardData = [
    { name: '一般隐患', value: statistics.hazardLevelDistribution.general, color: '#10b981' },
    { name: '较大隐患', value: statistics.hazardLevelDistribution.major, color: '#f97316' },
    { name: '重大隐患', value: statistics.hazardLevelDistribution.critical, color: '#ef4444' },
  ];

  const stats = [
    {
      title: '安检覆盖率',
      value: `${statistics.inspectionRate}%`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      description: `已检 ${statistics.inspectedHouseholds} / ${statistics.totalHouseholds} 户`,
    },
    {
      title: '逾期户数',
      value: statistics.overdueCount,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      description: '需尽快安排安检',
      highlight: true,
    },
    {
      title: '待整改隐患',
      value: statistics.pendingHazards,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      description: '含 5 项重大隐患',
      highlight: true,
    },
    {
      title: '本月完成任务',
      value: statistics.completedTasks,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      description: '较上月增长 12%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">总览概览</h1>
          <p className="text-gray-500 mt-1">城市燃气安全巡检数据总览</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">数据更新时间：2026-06-07 18:00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.highlight ? 'text-red-600' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">隐患等级分布</h3>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={hazardData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {hazardData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">整改进度趋势</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={statistics.rectificationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="new"
                name="新增隐患"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="完成整改"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">街道安检覆盖率排名</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {statistics.streetRanking.map((item, index) => (
              <div key={item.street} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-600'
                      : index === 1
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {item.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{item.street}</span>
                    <span className="text-sm font-semibold text-blue-600">{item.inspectionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.inspectionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">小区安检情况</h3>
            <Home className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statistics.streetRanking}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="street" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="inspectionRate" name="安检覆盖率(%)" radius={[4, 4, 0, 0]}>
                {statistics.streetRanking.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f97316'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
