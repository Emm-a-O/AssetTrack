import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Filter,
  PlusCircle,
  Download,
  Upload,
  QrCode,
  MapPin,
  User,
  ArrowRight,
  Archive,
  RotateCcw,
  LayoutGrid,
  List,
  AlertTriangle,
  ArrowLeftRight,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { Asset, AssetCondition, OperationalStatus } from '../../types';

interface AssetRegisterViewProps {
  onOpenRegisterModal: () => void;
  onOpenImportModal: () => void;
  onSelectAsset: (assetId: string) => void;
  onInitiateMovement: (assetId: string) => void;
  onInitiateReassignment: (assetId: string) => void;
}

export const AssetRegisterView: React.FC<AssetRegisterViewProps> = ({
  onOpenRegisterModal,
  onOpenImportModal,
  onSelectAsset,
  onInitiateMovement,
  onInitiateReassignment,
}) => {
  const {
    assets,
    categories,
    locations,
    departments,
    environment,
    getLocationName,
    getUserName,
    getDepartmentName,
    archiveAsset,
    restoreAsset,
  } = useAssetTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (asset.environment !== environment) return false;
      if (!showArchived && asset.isArchived) return false;
      if (showArchived && !asset.isArchived) return false;

      // Category filter
      if (selectedCategory !== 'all' && asset.category !== selectedCategory) return false;

      // Location filter
      if (selectedLocation !== 'all' && asset.currentLocationId !== selectedLocation) return false;

      // Condition filter
      if (selectedCondition !== 'all' && asset.condition !== selectedCondition) return false;

      // Status filter
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesId = asset.id.toLowerCase().includes(q);
        const matchesBrand = asset.brand?.toLowerCase().includes(q) || false;
        const matchesModel = asset.model?.toLowerCase().includes(q) || false;
        const matchesSerial = asset.serialNumber?.toLowerCase().includes(q) || false;
        return matchesName || matchesId || matchesBrand || matchesModel || matchesSerial;
      }

      return true;
    });
  }, [
    assets,
    environment,
    showArchived,
    selectedCategory,
    selectedLocation,
    selectedCondition,
    selectedStatus,
    searchQuery,
  ]);

  const exportToCsv = () => {
    const headers = [
      'Asset ID',
      'Asset Name',
      'Category',
      'Subcategory',
      'Brand',
      'Model',
      'Serial Number',
      'Current Location',
      'Responsible Person',
      'Department',
      'Condition',
      'Operational Status',
      'Acquisition Date',
      'Acquisition Cost',
      'Last Confirmed Move Date',
    ];

    const rows = filteredAssets.map((a) => [
      `"${a.id}"`,
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.subcategory || ''}"`,
      `"${a.brand || ''}"`,
      `"${a.model || ''}"`,
      `"${a.serialNumber || ''}"`,
      `"${getLocationName(a.currentLocationId)}"`,
      `"${getUserName(a.responsiblePersonId)}"`,
      `"${getDepartmentName(a.departmentId)}"`,
      `"${a.condition}"`,
      `"${a.status}"`,
      `"${a.acquisitionDate || ''}"`,
      `"${a.acquisitionCost || ''}"`,
      `"${a.lastConfirmedMovementDate} ${a.lastConfirmedMovementTime}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AssetTrack_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OperationalStatus) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">Active</span>;
      case 'Under Maintenance':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">Under Maint.</span>;
      case 'Missing':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 animate-pulse">Missing</span>;
      case 'Archived':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-700">Archived</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getConditionColor = (condition: AssetCondition) => {
    switch (condition) {
      case 'Excellent':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Good':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Fair':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Damaged':
        return 'text-rose-700 bg-rose-50 border-rose-200 font-semibold';
      case 'Unserviceable':
        return 'text-slate-700 bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>Master Asset Register</span>
          </h2>
          <p className="text-xs text-slate-500">
            System-assigned unique IDs with separate physical location &amp; custodian tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              showArchived
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showArchived ? 'Viewing Archived' : 'Show Archives'}
          </button>

          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs"
            title="Import assets from Excel / CSV"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={exportToCsv}
            disabled={filteredAssets.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs shadow-blue-500/20 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, brand, model, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              {locations
                .filter((l) => l.environment === environment)
                .map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
              <option value="Unserviceable">Unserviceable</option>
            </select>
          </div>
        </div>

        {/* View Toggle & Summary Count */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{filteredAssets.length}</strong> registered assets
            {showArchived && <span className="ml-1 text-rose-600 font-semibold">(Archived)</span>}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Display: Table or Cards */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-800 text-sm">No assets match your search criteria.</p>
          <p>Try clearing filters or click "Add Asset" to register a new physical item.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Item &amp; Specifications</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Location</th>
                  <th className="py-3 px-4">Custodian / Resp.</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectAsset(asset.id)}
                  >
                    {/* Unique Asset ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 text-xs">
                        {asset.id}
                      </span>
                    </td>

                    {/* Name, Brand, Serial */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{asset.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        {asset.brand && <span>{asset.brand} {asset.model}</span>}
                        {asset.serialNumber && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-sm">
                            SN: {asset.serialNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      {asset.category}
                    </td>

                    {/* Physical Location */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{getLocationName(asset.currentLocationId)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Moved: {asset.lastConfirmedMovementDate}
                      </span>
                    </td>

                    {/* Custodian / Responsible Person */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{getUserName(asset.responsiblePersonId)}</span>
                      </div>
                      {asset.departmentId && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {getDepartmentName(asset.departmentId)}
                        </span>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getConditionColor(
                          asset.condition
                        )}`}
                      >
                        {asset.condition}
                      </span>
                    </td>

                    {/* Operational Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(asset.status)}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-4 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInitiateMovement(asset.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Record transfer"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectAsset(asset.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {asset.id}
                  </span>
                  <div>{getStatusBadge(asset.status)}</div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{asset.name}</h3>
                {asset.brand && (
                  <p className="text-xs text-slate-500">
                    {asset.brand} {asset.model}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{getLocationName(asset.currentLocationId)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{getUserName(asset.responsiblePersonId)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getConditionColor(
                    asset.condition
                  )}`}
                >
                  {asset.condition}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInitiateMovement(asset.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <span>Transfer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
