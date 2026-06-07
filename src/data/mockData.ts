import type {
  User,
  Community,
  Building,
  Household,
  Task,
  Hazard,
  WorkOrder,
  Statistics,
  GasFacility,
  InspectionRecord,
} from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: '张管理员', role: 'admin', phone: '13800138001' },
  { id: '2', name: '李街道', role: 'street', phone: '13800138002' },
  { id: '3', name: '王安检员', role: 'inspector', phone: '13800138003' },
  { id: '4', name: '赵安检员', role: 'inspector', phone: '13800138004' },
];

export const mockCommunities: Community[] = [
  { id: '1', name: '阳光花园', street: '和平街道', grid: '网格01', buildingCount: 12, householdCount: 860, inspectionRate: 85 },
  { id: '2', name: '幸福里小区', street: '和平街道', grid: '网格01', buildingCount: 8, householdCount: 520, inspectionRate: 72 },
  { id: '3', name: '金城家园', street: '建设街道', grid: '网格02', buildingCount: 15, householdCount: 1200, inspectionRate: 91 },
  { id: '4', name: '东方明珠', street: '建设街道', grid: '网格02', buildingCount: 10, householdCount: 680, inspectionRate: 78 },
  { id: '5', name: '西湖花园', street: '西湖街道', grid: '网格03', buildingCount: 18, householdCount: 1350, inspectionRate: 65 },
  { id: '6', name: '南都雅苑', street: '西湖街道', grid: '网格03', buildingCount: 9, householdCount: 450, inspectionRate: 88 },
];

export const mockBuildings: Building[] = [
  { id: 'b1', communityId: '1', name: '1号楼', address: '阳光花园1号楼', householdCount: 72, lat: 30.2741, lng: 120.1551, inspectionStatus: 'completed', hazardCount: 2 },
  { id: 'b2', communityId: '1', name: '2号楼', address: '阳光花园2号楼', householdCount: 72, lat: 30.2743, lng: 120.1553, inspectionStatus: 'completed', hazardCount: 1 },
  { id: 'b3', communityId: '1', name: '3号楼', address: '阳光花园3号楼', householdCount: 72, lat: 30.2745, lng: 120.1555, inspectionStatus: 'in_progress', hazardCount: 3 },
  { id: 'b4', communityId: '1', name: '4号楼', address: '阳光花园4号楼', householdCount: 72, lat: 30.2747, lng: 120.1557, inspectionStatus: 'pending', hazardCount: 0 },
  { id: 'b5', communityId: '2', name: 'A栋', address: '幸福里A栋', householdCount: 65, lat: 30.2735, lng: 120.1545, inspectionStatus: 'completed', hazardCount: 0 },
  { id: 'b6', communityId: '2', name: 'B栋', address: '幸福里B栋', householdCount: 65, lat: 30.2737, lng: 120.1547, inspectionStatus: 'in_progress', hazardCount: 2 },
];

export const mockHouseholds: Household[] = [
  { id: 'h1', buildingId: 'b1', roomNumber: '101', ownerName: '张三', phone: '13900139001', riskLevel: 'low', lastInspectionDate: '2026-05-15', nextInspectionDate: '2026-11-15' },
  { id: 'h2', buildingId: 'b1', roomNumber: '102', ownerName: '李四', phone: '13900139002', riskLevel: 'medium', lastInspectionDate: '2026-04-20', nextInspectionDate: '2026-10-20' },
  { id: 'h3', buildingId: 'b1', roomNumber: '201', ownerName: '王五', phone: '13900139003', riskLevel: 'high', lastInspectionDate: '2026-03-10', nextInspectionDate: '2026-09-10' },
  { id: 'h4', buildingId: 'b2', roomNumber: '302', ownerName: '赵六', phone: '13900139004', riskLevel: 'low', lastInspectionDate: '2026-05-20', nextInspectionDate: '2026-11-20' },
  { id: 'h5', buildingId: 'b3', roomNumber: '501', ownerName: '钱七', phone: '13900139005', riskLevel: 'medium', lastInspectionDate: '2026-02-15', nextInspectionDate: '2026-08-15' },
];

export const mockTasks: Task[] = [
  { id: 't1', taskNo: 'RW202606001', type: 'routine', typeLabel: '例行安检', householdId: 'h1', householdName: '张三', address: '阳光花园1号楼101', inspectorId: '3', inspectorName: '王安检员', status: 'pending', statusLabel: '待执行', scheduledDate: '2026-06-08', priority: 'medium' },
  { id: 't2', taskNo: 'RW202606002', type: 'routine', typeLabel: '例行安检', householdId: 'h2', householdName: '李四', address: '阳光花园1号楼102', inspectorId: '3', inspectorName: '王安检员', status: 'in_progress', statusLabel: '进行中', scheduledDate: '2026-06-07', priority: 'high' },
  { id: 't3', taskNo: 'RW202606003', type: 'recheck', typeLabel: '复查', householdId: 'h3', householdName: '王五', address: '阳光花园1号楼201', inspectorId: '4', inspectorName: '赵安检员', status: 'assigned', statusLabel: '已派单', scheduledDate: '2026-06-10', priority: 'high' },
  { id: 't4', taskNo: 'RW202606004', type: 'special', typeLabel: '专项检查', householdId: 'h4', householdName: '赵六', address: '阳光花园2号楼302', inspectorId: '3', inspectorName: '王安检员', status: 'completed', statusLabel: '已完成', scheduledDate: '2026-06-05', completedDate: '2026-06-05', priority: 'low' },
  { id: 't5', taskNo: 'RW202606005', type: 'routine', typeLabel: '例行安检', householdId: 'h5', householdName: '钱七', address: '阳光花园3号楼501', status: 'overdue', statusLabel: '已逾期', scheduledDate: '2026-06-01', priority: 'medium' },
  { id: 't6', taskNo: 'RW202606006', type: 'routine', typeLabel: '例行安检', householdId: 'h1', householdName: '张三', address: '阳光花园1号楼101', status: 'pending', statusLabel: '待执行', scheduledDate: '2026-06-12', priority: 'low' },
];

export const mockInspectionRecords: InspectionRecord[] = [
  {
    id: 'ir1',
    taskId: 't4',
    inspectorId: '3',
    inspectorName: '王安检员',
    householdId: 'h4',
    householdName: '赵六',
    address: '阳光花园2号楼302',
    checkDate: '2026-06-05',
    meterReading: 1256.8,
    hoseStatus: 'good',
    hoseStatusLabel: '正常',
    hoseAge: 2,
    alarmStatus: 'working',
    alarmStatusLabel: '正常工作',
    ventilation: 'good',
    ventilationLabel: '良好',
    remarks: '用气环境良好，无安全隐患',
    photos: [],
    userSignature: 'signature_001',
  },
];

export const mockHazards: Hazard[] = [
  { id: 'hz1', inspectionRecordId: 'ir1', householdId: 'h3', householdName: '王五', address: '阳光花园1号楼201', level: 'critical', levelLabel: '重大隐患', type: '软管老化', description: '燃气软管使用超过5年，出现明显老化裂纹，需立即更换', photos: [], status: 'rectifying', statusLabel: '整改中', assigneeId: '3', assigneeName: '王安检员', deadline: '2026-06-15', rectificationPlan: '更换不锈钢波纹管', createDate: '2026-06-03' },
  { id: 'hz2', inspectionRecordId: 'ir1', householdId: 'h2', householdName: '李四', address: '阳光花园1号楼102', level: 'major', levelLabel: '较大隐患', type: '报警器故障', description: '燃气报警器无法正常报警，需检修或更换', photos: [], status: 'pending', statusLabel: '待整改', deadline: '2026-06-20', createDate: '2026-06-05' },
  { id: 'hz3', inspectionRecordId: 'ir1', householdId: 'h5', householdName: '钱七', address: '阳光花园3号楼501', level: 'general', levelLabel: '一般隐患', type: '通风不良', description: '厨房通风条件较差，建议加装排气扇', photos: [], status: 'rechecking', statusLabel: '待复查', assigneeId: '4', assigneeName: '赵安检员', recheckDate: '2026-06-08', createDate: '2026-05-28' },
  { id: 'hz4', inspectionRecordId: 'ir1', householdId: 'h1', householdName: '张三', address: '阳光花园1号楼101', level: 'general', levelLabel: '一般隐患', type: '软管超长', description: '燃气软管长度超过2米，存在安全隐患', photos: [], status: 'closed', statusLabel: '已销号', recheckDate: '2026-06-02', recheckResult: '已整改完成，软管长度符合要求', createDate: '2026-05-20' },
  { id: 'hz5', inspectionRecordId: 'ir1', householdId: 'b6', householdName: '幸福里B栋用户', address: '幸福里B栋301', level: 'major', levelLabel: '较大隐患', type: '表具锈蚀', description: '燃气表具严重锈蚀，需更换', photos: [], status: 'pending', statusLabel: '待整改', deadline: '2026-06-18', createDate: '2026-06-06' },
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo1',
    orderNo: 'GD202606001',
    type: 'leak',
    typeLabel: '泄漏报修',
    title: '厨房燃气泄漏',
    description: '用户反映厨房有明显燃气味，疑似管道接口泄漏',
    address: '阳光花园1号楼201',
    contactName: '王五',
    contactPhone: '13900139003',
    status: 'processing',
    statusLabel: '处理中',
    priority: 'emergency',
    priorityLabel: '紧急',
    assigneeId: '3',
    assigneeName: '王安检员',
    createDate: '2026-06-07 09:30:00',
    progress: [
      { id: 'p1', workOrderId: 'wo1', status: '已接单', description: '安检员已接单，正在赶往现场', operatorName: '系统', timestamp: '2026-06-07 09:35:00' },
      { id: 'p2', workOrderId: 'wo1', status: '到达现场', description: '已到达用户家中，开始检测泄漏点', operatorName: '王安检员', timestamp: '2026-06-07 10:00:00' },
      { id: 'p3', workOrderId: 'wo1', status: '检测中', description: '检测发现灶具接口处泄漏，正在处理', operatorName: '王安检员', timestamp: '2026-06-07 10:15:00' },
    ],
  },
  {
    id: 'wo2',
    orderNo: 'GD202606002',
    type: 'repair',
    typeLabel: '维修',
    title: '燃气表不计数',
    description: '用户反映燃气表数字不转动，怀疑表具故障',
    address: '金城家园5号楼302',
    contactName: '陈先生',
    contactPhone: '13900139006',
    status: 'pending',
    statusLabel: '待处理',
    priority: 'normal',
    priorityLabel: '普通',
    createDate: '2026-06-07 08:15:00',
    progress: [],
  },
  {
    id: 'wo3',
    orderNo: 'GD202606003',
    type: 'shutdown',
    typeLabel: '停气通知',
    title: '管道维护停气',
    description: '因和平路管道改造维护，计划于6月10日停气',
    address: '和平街道沿线小区',
    contactName: '燃气公司',
    contactPhone: '96777',
    status: 'completed',
    statusLabel: '已完成',
    priority: 'urgent',
    priorityLabel: '重要',
    assigneeId: '2',
    assigneeName: '李街道',
    createDate: '2026-06-05 14:00:00',
    completedDate: '2026-06-06 18:00:00',
    progress: [
      { id: 'p4', workOrderId: 'wo3', status: '已通知', description: '已发布停气通知，通知各社区', operatorName: '张管理员', timestamp: '2026-06-05 14:30:00' },
      { id: 'p5', workOrderId: 'wo3', status: '停气完成', description: '已按计划完成停气作业', operatorName: '维修班组', timestamp: '2026-06-06 08:00:00' },
      { id: 'p6', workOrderId: 'wo3', status: '恢复供气', description: '维护完成，已恢复供气', operatorName: '维修班组', timestamp: '2026-06-06 17:30:00' },
    ],
    followUp: { id: 'f1', workOrderId: 'wo3', operatorName: '客服中心', date: '2026-06-06', satisfaction: 5, feedback: '停气通知及时，恢复准时' },
  },
];

export const mockFacilities: GasFacility[] = [
  { id: 'f1', type: 'valve', typeLabel: '阀井', name: '和平路1号阀井', lat: 30.2739, lng: 120.1548, status: 'normal', installDate: '2018-03-15', lastCheckDate: '2026-05-20' },
  { id: 'f2', type: 'valve', typeLabel: '阀井', name: '和平路2号阀井', lat: 30.2745, lng: 120.1558, status: 'normal', installDate: '2018-03-15', lastCheckDate: '2026-05-20' },
  { id: 'f3', type: 'regulator', typeLabel: '调压箱', name: '阳光花园调压箱', lat: 30.2742, lng: 120.1552, status: 'normal', installDate: '2019-06-20', lastCheckDate: '2026-06-01' },
  { id: 'f4', type: 'regulator', typeLabel: '调压箱', name: '幸福里调压箱', lat: 30.2736, lng: 120.1546, status: 'maintenance', installDate: '2017-11-08', lastCheckDate: '2026-04-15' },
  { id: 'f5', type: 'pipeline', typeLabel: '管线', name: '和平路主管线', lat: 30.2740, lng: 120.1550, status: 'normal', installDate: '2015-10-01', lastCheckDate: '2026-05-25' },
];

export const mockStatistics: Statistics = {
  totalHouseholds: 5060,
  inspectedHouseholds: 4023,
  inspectionRate: 79.5,
  overdueCount: 156,
  pendingHazards: 42,
  completedTasks: 328,
  hazardLevelDistribution: {
    general: 25,
    major: 12,
    critical: 5,
  },
  rectificationTrend: [
    { date: '06-01', completed: 5, new: 8 },
    { date: '06-02', completed: 7, new: 4 },
    { date: '06-03', completed: 3, new: 6 },
    { date: '06-04', completed: 8, new: 5 },
    { date: '06-05', completed: 6, new: 7 },
    { date: '06-06', completed: 4, new: 3 },
    { date: '06-07', completed: 5, new: 4 },
  ],
  streetRanking: [
    { street: '建设街道', inspectionRate: 84.5, rank: 1, communityCount: 2 },
    { street: '和平街道', inspectionRate: 78.5, rank: 2, communityCount: 2 },
    { street: '西湖街道', inspectionRate: 76.5, rank: 3, communityCount: 2 },
  ],
};

export const mockInspectors = [
  { id: '3', name: '王安检员', phone: '13800138003', completedTasks: 156, rating: 4.8 },
  { id: '4', name: '赵安检员', phone: '13800138004', completedTasks: 142, rating: 4.6 },
  { id: '5', name: '刘安检员', phone: '13800138005', completedTasks: 138, rating: 4.7 },
  { id: '6', name: '陈安检员', phone: '13800138006', completedTasks: 128, rating: 4.5 },
];
