import React, { useState } from 'react';
import {
  X,
  Boxes,
  MapPin,
  Tag,
  DollarSign,
  User,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { AssetCondition } from '../../types';

interface RegisterAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetCreated?: (assetId: string) => void;
}

export const RegisterAssetModal: React.FC<RegisterAssetModalProps> = ({
  isOpen,
  onClose,
  onAssetCreated,
}) => {
  const {
    environment,
    categories,
    locations,
    departments,
    users,
    registerAsset,
    generateNextAssetId,
  } = useAssetTrack();

  const previewId = generateNextAssetId(environment);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Electronics');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(new Date().toISOString().split('T')[0]);
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [initialLocationId, setInitialLocationId] = useState(
    locations.filter((l) => l.isActive && l.environment === environment)[0]?.id || ''
  );
  const [responsiblePersonId, setResponsiblePersonId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('Excellent');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Asset Name is required.');
      return;
    }
    if (!category) {
      setError('Category is required.');
      return;
    }
    if (!initialLocationId) {
      setError('Initial Location is mandatory.');
      return;
    }

    const res = registerAsset({
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || undefined,
      description: description.trim() || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      acquisitionDate: acquisitionDate || undefined,
      acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : undefined,
      currency,
      initialLocationId,
      currentLocationId: initialLocationId,
      responsiblePersonId: responsiblePersonId || undefined,
      departmentId: departmentId || undefined,
      condition,
      status: 'Active',
      imageUrl: imageUrl.trim() || undefined,
      environment,
      notes: notes.trim() || undefined,
    });

    if (res.success && res.asset) {
      if (onAssetCreated) onAssetCreated(res.asset.id);
      onClose();
    } else {
      setError(res.error || 'Failed to register asset.');
    }
  };

  const activeLocations = locations.filter((l) => l.isActive && l.environment === environment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Register Physical Asset</h3>
              <p className="text-xs text-slate-300">
                Generated Asset ID:{' '}
                <span className="font-mono font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-md">
                  {previewId}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Notice on Rule 1.1 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Independent Asset Identification:</span> Every physical item receives an independent, permanent ID ({previewId}) regardless of duplicate item names or categories.
            </div>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Television, Refrigerator, Laptop, Spectrophotometer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subcategory (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Smart TV Display, Cold Storage"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Identification & Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Samsung, Dell, Optika"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                placeholder="e.g. UA55CU7000"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serial Number (Mfr)
              </label>
              <input
                type="text"
                placeholder="e.g. SN-89218392"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400">Separate from internal Asset ID</span>
            </div>
          </div>

          {/* Location & Custody */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Physical Location <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={initialLocationId}
                onChange={(e) => setInitialLocationId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select location...</option>
                {activeLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400">Initial location becomes current location</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="Excellent">Excellent - Like new</option>
                <option value="Good">Good - Minor normal wear</option>
                <option value="Fair">Fair - Operational with wear</option>
                <option value="Damaged">Damaged - Requires repair</option>
                <option value="Unserviceable">Unserviceable - Condemned</option>
              </select>
            </div>

            {environment === 'organisation' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsible Person (Custodian)
                  </label>
                  <select
                    value={responsiblePersonId}
                    onChange={(e) => setResponsiblePersonId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned / Pool Asset</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400">Independent from physical location</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Acquisition Cost & Image */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Acquisition Date
              </label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Acquisition Cost
              </label>
              <div className="flex">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2 py-2 text-xs bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg font-medium"
                >
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-r-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Photograph URL
              </label>
              <input
                type="url"
                placeholder="https://...image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Specifications
              </label>
              <textarea
                rows={2}
                placeholder="Physical appearance, key specifications, accessories included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Generate Asset ID</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
