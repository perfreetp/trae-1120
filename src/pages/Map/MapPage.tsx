import { useState } from 'react';
import {
  Layers,
  Building2,
  Droplets,
  Wind,
  AlertTriangle,
  Search,
  X,
  MapPin,
  Info,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function MapPage() {
  const { buildings, facilities, selectedBuilding, setSelectedBuilding } = useStore();
  const [activeLayers, setActiveLayers] = useState({
    buildings: true,
    valves: true,
    regulators: true,
    pipelines: true,
    highRisk: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getFacilityColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'fill-green-500';
      case 'maintenance':
        return 'fill-yellow-500';
      case 'fault':
        return 'fill-red-500';
      default:
        return 'fill-gray-400';
    }
  };

  const filteredBuildings = buildings.filter((b) =>
    b.name.includes(searchQuery) || b.address.includes(searchQuery)
  );

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">图层控制</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.buildings}
                onChange={() => toggleLayer('buildings')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Building2 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-700">楼栋</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.valves}
                onChange={() => toggleLayer('valves')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Droplets className="w-5 h-5 text-cyan-500" />
              <span className="text-sm text-gray-700">阀井</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.regulators}
                onChange={() => toggleLayer('regulators')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Wind className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-700">调压箱</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.pipelines}
                onChange={() => toggleLayer('pipelines')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h16" />
              </svg>
              <span className="text-sm text-gray-700">管线</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.highRisk}
                onChange={() => toggleLayer('highRisk')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-700">高风险住户</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索楼栋..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">楼栋列表</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredBuildings.map((building) => (
              <div
                key={building.id}
                onClick={() => setSelectedBuilding(building)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedBuilding?.id === building.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(building.inspectionStatus)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{building.name}</p>
                    <p className="text-xs text-gray-500">{building.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">图例</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">已完成安检</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">安检中</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600">待安检</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">高风险</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-2 flex flex-col gap-1">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 font-bold">
            +
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600 font-bold">
            −
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <svg className="w-full h-full" viewBox="0 0 800 600">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {activeLayers.pipelines && (
              <>
                <path
                  d="M 100 300 Q 200 280 300 300 T 500 290 T 700 300"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray="10,5"
                  opacity="0.6"
                />
                <path
                  d="M 300 200 L 300 400"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  opacity="0.5"
                />
              </>
            )}

            {activeLayers.buildings &&
              buildings.map((building, index) => {
                const x = 150 + (index % 3) * 200;
                const y = 150 + Math.floor(index / 3) * 180;
                return (
                  <g key={building.id} onClick={() => setSelectedBuilding(building)} className="cursor-pointer">
                    <rect
                      x={x}
                      y={y}
                      width="80"
                      height="100"
                      rx="4"
                      fill={building.inspectionStatus === 'completed' ? '#dcfce7' : building.inspectionStatus === 'in_progress' ? '#dbeafe' : '#f3f4f6'}
                      stroke={selectedBuilding?.id === building.id ? '#3b82f6' : '#d1d5db'}
                      strokeWidth={selectedBuilding?.id === building.id ? '3' : '1'}
                      className="transition-all hover:shadow-lg"
                    />
                    <rect x={x + 10} y={y + 15} width="15" height="15" rx="2" fill="#94a3b8" />
                    <rect x={x + 32} y={y + 15} width="15" height="15" rx="2" fill="#94a3b8" />
                    <rect x={x + 54} y={y + 15} width="15" height="15" rx="2" fill="#94a3b8" />
                    <rect x={x + 10} y={y + 40} width="15" height="15" rx="2" fill="#94a3b8" />
                    <rect x={x + 32} y={y + 40} width="15" height="15" rx="2" fill="#94a3b8" />
                    <rect x={x + 54} y={y + 40} width="15" height="15" rx="2" fill="#94a3b8" />
                    <rect x={x + 32} y={y + 75} width="16" height="25" rx="2" fill="#64748b" />
                    <text x={x + 40} y={y - 8} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="500">
                      {building.name}
                    </text>
                    <circle cx={x + 75} cy={y + 5} r="8" className={getStatusColor(building.inspectionStatus)} />
                    {building.hazardCount > 0 && (
                      <g>
                        <circle cx={x + 5} cy={y + 5} r="10" fill="#ef4444" />
                        <text x={x + 5} y={y + 9} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                          {building.hazardCount}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

            {activeLayers.valves &&
              facilities
                .filter((f) => f.type === 'valve')
                .map((facility) => (
                  <g key={facility.id}>
                    <circle
                      cx={200 + facilities.indexOf(facility) * 150}
                      cy={350}
                      r="12"
                      className={getFacilityColor(facility.status)}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={200 + facilities.indexOf(facility) * 150}
                      y={380}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                    >
                      {facility.name}
                    </text>
                  </g>
                ))}

            {activeLayers.regulators &&
              facilities
                .filter((f) => f.type === 'regulator')
                .map((facility, index) => (
                  <g key={facility.id}>
                    <rect
                      x={180 + index * 200}
                      y={220}
                      width="24"
                      height="24"
                      rx="4"
                      className={getFacilityColor(facility.status)}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text x={192 + index * 200} y={260} textAnchor="middle" fontSize="10" fill="#6b7280">
                      {facility.name}
                    </text>
                  </g>
                ))}

            {activeLayers.highRisk && (
              <>
                <g>
                  <MapPin className="w-6 h-6 text-red-500" x="220" y="190" />
                  <circle cx="230" cy="190" r="15" fill="#ef4444" opacity="0.2" className="animate-pulse" />
                </g>
                <g>
                  <MapPin className="w-6 h-6 text-red-500" x="420" y="370" />
                  <circle cx="430" cy="370" r="15" fill="#ef4444" opacity="0.2" className="animate-pulse" />
                </g>
              </>
            )}
          </svg>
        </div>

        {selectedBuilding && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedBuilding.name}</h4>
                  <p className="text-sm text-gray-500">{selectedBuilding.address}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{selectedBuilding.householdCount}</span> 户
                    </span>
                    <span className="text-sm text-gray-600">
                      隐患 <span className="font-medium text-red-600">{selectedBuilding.hazardCount}</span> 处
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedBuilding.inspectionStatus === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : selectedBuilding.inspectionStatus === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedBuilding.inspectionStatus === 'completed'
                        ? '已完成'
                        : selectedBuilding.inspectionStatus === 'in_progress'
                        ? '进行中'
                        : '待安检'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
