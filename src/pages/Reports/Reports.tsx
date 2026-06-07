import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  Download,
  Calendar,
  Filter,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const dimensionTabs = [
  { key: 'street', label: '按街道' },
  { key: 'grid', label: '按网格' },
  { key: 'inspector', label: '按安检员' },
];

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Reports() {
  const { communities, statistics, hazards, tasks } = useStore();
  const [activeDimension, setActiveDimension] = useState('street');
  const [dateRange, setDateRange] = useState('month');
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const streetData = [
    { name: '建设街道', inspectionRate: 84.5, completed: 1450, total: 1716, hazards: 18 },
    { name: '和平街道', inspectionRate: 78.5, completed: 1085, total: 1380, hazards: 15 },
    { name: '西湖街道', inspectionRate: 76.5, completed: 1489, total: 1946, hazards: 22 },
  ];

  const gridData = [
    { name: '网格01', inspectionRate: 80.5, completed: 956, total: 1187, hazards: 12 },
    { name: '网格02', inspectionRate: 84.5, completed: 1450, total: 1716, hazards: 18 },
    { name: '网格03', inspectionRate: 76.5, completed: 1489, total: 1946, hazards: 22 },
  ];

  const inspectorData = [
    { name: '王安检员', completed: 156, passRate: 92, hazards: 8 },
    { name: '赵安检员', completed: 142, passRate: 88, hazards: 12 },
    { name: '刘安检员', completed: 138, passRate: 95, hazards: 5 },
    { name: '陈安检员', completed: 128, passRate: 90, hazards: 10 },
  ];

  const monthlyData = [
    { month: '1月', inspected: 420, newHazards: 18, rectified: 15 },
    { month: '2月', inspected: 380, newHazards: 15, rectified: 12 },
    { month: '3月', inspected: 450, newHazards: 22, rectified: 20 },
    { month: '4月', inspected: 520, newHazards: 25, rectified: 23 },
    { month: '5月', inspected: 480, newHazards: 20, rectified: 18 },
    { month: '6月', inspected: 350, newHazards: 16, rectified: 14 },
  ];

  const hazardTypeData = [
    { name: '软管问题', value: 15 },
    { name: '报警器故障', value: 10 },
    { name: '表具问题', value: 8 },
    { name: '通风不良', value: 12 },
    { name: '其他', value: 5 },
  ];

  const currentData = activeDimension === 'street' ? streetData : activeDimension === 'grid' ? gridData : inspectorData;

  const getDateRangeLabel = () => {
    const labels: Record<string, string> = {
      week: '本周',
      month: '本月',
      quarter: '本季度',
      year: '本年',
    };
    return labels[dateRange] || '本月';
  };

  const getDimensionLabel = () => {
    const labels: Record<string, string> = {
      street: '街道',
      grid: '网格',
      inspector: '安检员',
    };
    return labels[activeDimension] || '街道';
  };

  const exportToCSV = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const fileName = `燃气巡检报表_${getDimensionLabel()}维度_${dateStr}.csv`;

    let csvContent = '\uFEFF';
    
    csvContent += '城市燃气安全巡检统计报表\n';
    csvContent += `统计维度：${getDimensionLabel()}\n`;
    csvContent += `时间范围：${getDateRangeLabel()}\n`;
    csvContent += `导出时间：${now.toLocaleString('zh-CN')}\n\n`;

    csvContent += '总体统计\n';
    csvContent += `总安检户数,${statistics.inspectedHouseholds}\n`;
    csvContent += `安检覆盖率,${statistics.inspectionRate}%\n`;
    const totalHazards = statistics.hazardLevelDistribution.general +
                        statistics.hazardLevelDistribution.major +
                        statistics.hazardLevelDistribution.critical;
    csvContent += `发现隐患总数,${totalHazards}\n`;
    csvContent += `重大隐患数,${statistics.hazardLevelDistribution.critical}\n`;
    csvContent += `较大隐患数,${statistics.hazardLevelDistribution.major}\n`;
    csvContent += `一般隐患数,${statistics.hazardLevelDistribution.general}\n`;
    csvContent += `整改完成率,85.7%\n\n`;

    csvContent += `${getDimensionLabel()}维度统计\n`;
    if (activeDimension === 'inspector') {
      csvContent += '安检员,已完成任务数,合格率(%),发现隐患数\n';
      currentData.forEach((item) => {
        csvContent += `${item.name},${item.completed},${item.passRate},${item.hazards}\n`;
      });
    } else {
      csvContent += `${getDimensionLabel()}名称,安检覆盖率(%),已安检户数,总户数,发现隐患数\n`;
      currentData.forEach((item) => {
        csvContent += `${item.name},${item.inspectionRate},${item.completed},${item.total},${item.hazards}\n`;
      });
    }
    csvContent += '\n';

    csvContent += '小区安检明细\n';
    csvContent += '小区名称,所属街道,网格,楼栋数,总户数,安检覆盖率(%),状态\n';
    communities.forEach((community) => {
      const status = community.inspectionRate >= 80 ? '良好' : community.inspectionRate >= 60 ? '一般' : '需改进';
      csvContent += `${community.name},${community.street},${community.grid},${community.buildingCount},${community.householdCount},${community.inspectionRate},${status}\n`;
    });
    csvContent += '\n';

    csvContent += '月度安检趋势\n';
    csvContent += '月份,安检户数,新增隐患,完成整改\n';
    monthlyData.forEach((item) => {
      csvContent += `${item.month},${item.inspected},${item.newHazards},${item.rectified}\n`;
    });
    csvContent += '\n';

    csvContent += '隐患类型分布\n';
    csvContent += '隐患类型,数量\n';
    hazardTypeData.forEach((item) => {
      csvContent += `${item.name},${item.value}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showExportSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          报表导出成功！
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计报表</h1>
          <p className="text-gray-500 mt-1">多维度统计分析燃气巡检数据</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm text-gray-700 bg-transparent focus:outline-none"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总安检户数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.inspectedHouseholds}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                较上月 +8.5%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">安检覆盖率</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{statistics.inspectionRate}%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                较上月 +3.2%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">发现隐患</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {statistics.hazardLevelDistribution.general +
                  statistics.hazardLevelDistribution.major +
                  statistics.hazardLevelDistribution.critical}
              </p>
              <p className="text-xs text-red-600 mt-1">其中重大隐患 {statistics.hazardLevelDistribution.critical} 处</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">整改完成率</p>
              <p className="text-2xl font-bold text-green-600 mt-1">85.7%</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                较上月 +5.1%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {dimensionTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveDimension(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeDimension === tab.key
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
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
              <Bar dataKey="inspectionRate" name="安检覆盖率(%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              {activeDimension !== 'inspector' && (
                <Bar dataKey="completed" name="已安检户数" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
              {activeDimension === 'inspector' && (
                <Bar dataKey="passRate" name="合格率(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月度安检趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
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
              <Area type="monotone" dataKey="inspected" name="安检户数" stroke="#3b82f6" fill="#93c5fd" />
              <Area type="monotone" dataKey="newHazards" name="新增隐患" stroke="#f97316" fill="#fdba74" />
              <Area type="monotone" dataKey="rectified" name="完成整改" stroke="#10b981" fill="#6ee7b7" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">隐患类型分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={hazardTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {hazardTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">小区安检详情</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  小区名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所属街道
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  网格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  楼栋数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总户数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  安检覆盖率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {communities.map((community, index) => (
                <tr key={community.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{community.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {community.street}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {community.grid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {community.buildingCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {community.householdCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            community.inspectionRate >= 80
                              ? 'bg-green-500'
                              : community.inspectionRate >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${community.inspectionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{community.inspectionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        community.inspectionRate >= 80
                          ? 'bg-green-100 text-green-700'
                          : community.inspectionRate >= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {community.inspectionRate >= 80 ? '良好' : community.inspectionRate >= 60 ? '一般' : '需改进'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
