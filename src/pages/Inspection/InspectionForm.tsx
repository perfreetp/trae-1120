import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  PenLine,
  Save,
  CheckCircle,
  User,
  MapPin,
  Calendar,
  Plus,
  X,
  Eye,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { InspectionRecord } from '@/types';

const hoseStatusMap = {
  good: { label: '正常', labelText: '正常' },
  aging: { label: '老化', labelText: '老化' },
  damaged: { label: '破损', labelText: '破损' },
};

const alarmStatusMap = {
  working: { label: '正常工作', labelText: '正常工作' },
  faulty: { label: '故障', labelText: '故障' },
  none: { label: '未安装', labelText: '未安装' },
};

const ventilationMap = {
  good: { label: '良好', labelText: '良好' },
  poor: { label: '较差', labelText: '较差' },
};

export default function InspectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, households, inspections, addInspectionRecord, updateTask, currentUser } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const task = tasks.find((t) => t.id === id);
  const household = households.find((h) => h.id === task?.householdId);
  const existingRecord = inspections.find((r) => r.taskId === id);

  const [formData, setFormData] = useState({
    meterReading: '',
    hoseStatus: 'good',
    hoseAge: '2',
    alarmStatus: 'working',
    ventilation: 'good',
    remarks: '',
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (existingRecord) {
      setIsViewMode(true);
      setFormData({
        meterReading: existingRecord.meterReading.toString(),
        hoseStatus: existingRecord.hoseStatus,
        hoseAge: (existingRecord.hoseAge || 2).toString(),
        alarmStatus: existingRecord.alarmStatus,
        ventilation: existingRecord.ventilation,
        remarks: existingRecord.remarks || '',
      });
      setPhotos(existingRecord.photos);
      if (existingRecord.userSignature) {
        setSigned(true);
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.strokeStyle = '#1f2937';
              ctx.lineWidth = 2;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(50, 100);
              ctx.quadraticCurveTo(150, 50, 250, 100);
              ctx.quadraticCurveTo(350, 150, 450, 100);
              ctx.quadraticCurveTo(550, 50, 550, 100);
              ctx.stroke();
            }
          }
        }, 100);
      }
    }
  }, [existingRecord]);

  const handleInputChange = (field: string, value: string) => {
    if (isViewMode) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPhoto = () => {
    if (isViewMode) return;
    const photoNum = photos.length + 1;
    const timeStr = new Date().toLocaleString('zh-CN');
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="#e5e7eb" width="200" height="150"/><text x="100" y="80" text-anchor="middle" fill="#6b7280" font-size="14">现场照片 ' + photoNum + '</text><text x="100" y="105" text-anchor="middle" fill="#9ca3af" font-size="10">' + timeStr + '</text></svg>';
    const newPhoto = 'data:image/svg+xml,' + encodeURIComponent(svgContent);
    setPhotos([...photos, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    if (isViewMode) return;
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isViewMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isViewMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (isViewMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const getSignatureData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    return canvas.toDataURL('image/png');
  };

  const handleSubmit = () => {
    if (isViewMode) return;
    if (!task || !household || !currentUser) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const record: InspectionRecord = {
      id: `ir_${Date.now()}`,
      taskId: task.id,
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      householdId: household.id,
      householdName: household.ownerName,
      address: task.address,
      checkDate: dateStr,
      meterReading: parseFloat(formData.meterReading) || 0,
      hoseStatus: formData.hoseStatus as 'good' | 'aging' | 'damaged',
      hoseStatusLabel: hoseStatusMap[formData.hoseStatus as keyof typeof hoseStatusMap].labelText,
      hoseAge: parseInt(formData.hoseAge) || 2,
      alarmStatus: formData.alarmStatus as 'working' | 'faulty' | 'none',
      alarmStatusLabel: alarmStatusMap[formData.alarmStatus as keyof typeof alarmStatusMap].labelText,
      ventilation: formData.ventilation as 'good' | 'poor',
      ventilationLabel: ventilationMap[formData.ventilation as keyof typeof ventilationMap].labelText,
      remarks: formData.remarks,
      photos: photos,
      userSignature: getSignatureData(),
    };

    addInspectionRecord(record);

    updateTask(task.id, {
      status: 'completed',
      statusLabel: '已完成',
      completedDate: dateStr,
      photoCount: photos.length,
      photos: photos,
    });

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/tasks');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">检查记录提交成功！</h3>
            <p className="text-gray-500">正在返回任务列表...</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">入户安全检查</h1>
          <p className="text-gray-500 mt-1">任务编号：{task?.taskNo}</p>
        </div>
        {isViewMode && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
            <Eye className="w-4 h-4" />
            已完成 - 查看模式
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">住户姓名</p>
                  <p className="text-sm font-medium text-gray-900">{household?.ownerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">检查地址</p>
                  <p className="text-sm font-medium text-gray-900">{task?.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">检查日期</p>
                  <p className="text-sm font-medium text-gray-900">
                    {existingRecord?.checkDate || '2026-06-07'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">安检员</p>
                  <p className="text-sm font-medium text-gray-900">
                    {existingRecord?.inspectorName || currentUser?.name || '王安检员'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">检查项目</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  燃气表具读数 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.meterReading}
                    onChange={(e) => handleInputChange('meterReading', e.target.value)}
                    placeholder="请输入表具读数"
                    disabled={isViewMode}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isViewMode ? 'bg-gray-50 text-gray-600' : ''}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    m³
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  燃气软管状态 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'good', label: '正常' },
                    { value: 'aging', label: '老化' },
                    { value: 'damaged', label: '破损' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('hoseStatus', option.value)}
                      disabled={isViewMode}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.hoseStatus === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  软管使用年限
                </label>
                <select
                  value={formData.hoseAge}
                  onChange={(e) => handleInputChange('hoseAge', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${isViewMode ? 'bg-gray-50 text-gray-600' : ''}`}
                >
                  <option value="1">1年以内</option>
                  <option value="2">1-2年</option>
                  <option value="3">2-3年</option>
                  <option value="5">3-5年</option>
                  <option value="10">5年以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  燃气报警器状态 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'working', label: '正常工作' },
                    { value: 'faulty', label: '故障' },
                    { value: 'none', label: '未安装' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('alarmStatus', option.value)}
                      disabled={isViewMode}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.alarmStatus === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  厨房通风条件 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'good', label: '良好' },
                    { value: 'poor', label: '较差' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('ventilation', option.value)}
                      disabled={isViewMode}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.ventilation === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      } ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="请输入其他需要说明的情况..."
                  rows={3}
                  disabled={isViewMode}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${isViewMode ? 'bg-gray-50 text-gray-600' : ''}`}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">现场照片</h3>
              {!isViewMode && (
                <button
                  onClick={handleAddPhoto}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  添加照片
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`现场照片 ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-gray-200"
                  />
                  {!isViewMode && (
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {photos.length === 0 && (
                <div className="col-span-4 py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {isViewMode ? '暂无照片' : '点击上方按钮添加现场照片'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">用户签字确认</h3>
              {!isViewMode && (
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  清除签名
                </button>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`w-full bg-gray-50 ${isViewMode ? 'cursor-default' : 'cursor-crosshair'}`}
              />
            </div>
            {!signed && !isViewMode && (
              <p className="text-sm text-gray-400 mt-2 text-center">请在上方区域签字确认</p>
            )}
            {isViewMode && signed && (
              <p className="text-sm text-green-600 mt-2 text-center flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                用户已签字确认
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isViewMode ? '检查记录详情' : '提交检查'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">基本信息已填写</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">检查项目已完成</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${photos.length > 0 ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {photos.length > 0 && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-600">已添加 {photos.length} 张照片</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${signed ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {signed && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-600">
                  {signed ? '用户已签字' : '用户未签字'}
                </span>
              </div>
            </div>

            {!isViewMode ? (
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={!signed}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  提交检查记录
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  保存草稿
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/tasks')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                返回任务列表
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
