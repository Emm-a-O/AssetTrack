import React, { useState } from 'react';
import {
  MapPin,
  Boxes,
  User,
  ArrowRight,
  ArrowLeftRight,
  Search,
  Building,
  CheckCircle2,
  FolderTree,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { Asset } from '../../types';

interface CurrentLocationsViewProps {
  onSelectAsset: (assetId: string) => void;
  onInitiateMovement: (assetId: string) => void;
}

export const CurrentLocationsView: React.FC<CurrentLocationsViewProps> = ({
  onSelectAsset,
  onInitiateMovement,
}) => {
  const {
    assets,
    locations,
    environment,
    getUserName,
    getDepartmentName,
    getLocationName,
  } = useAssetTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const activeLocations = locations.filter((l) => l.environment === environment && l.isActive);

  // Group assets by current location
  const locationWithAssets = activeLocations.map((loc) => {
    const locAssets = assets.filter(
      (a) => !a.isArchived && a.environment === environment && a.currentLocationId === loc.id
    );
    return {
      ...loc,
      assets: locAssets,
    };
  });

  const filteredLocations = locationWithAssets.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchLoc = loc.name.toLowerCase().includes(q) || loc.code.toLowerCase().includes(q);
    const matchAsset = loc.assets.some(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
    return matchLoc || matchAsset;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Current Asset Locations</span>
          </h2>
          <p className="text-xs text-slate-500">
            Independent confirmed physical location registry (Module 3). Separate from custodian custody.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search location or equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Distinction Insight Box */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Architectural Principle (Module 3):</span> Current physical location and assigned custodian are strictly decoupled. For instance, a departmental laptop may be physically stationed in the <em>Main ICT Lab &amp; Server Room</em> while assigned to an executive staff member for custody accountability.
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((loc) => {
          const isExpanded = selectedLocationId === loc.id;

          return (
            <div
              key={loc.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isExpanded ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Location Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {loc.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{loc.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Level: {loc.level}
                      {loc.parentId && ` • Parent: ${getLocationName(loc.parentId)}`}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {loc.assets.length} {loc.assets.length === 1 ? 'asset' : 'assets'}
                  </span>
                </div>

                {/* Asset Mini Roster */}
                {loc.assets.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                    No physical assets currently stationed here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loc.assets.slice(0, 3).map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => onSelectAsset(asset.id)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-100 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-blue-600 mr-1.5">{asset.id}</span>
                          <span className="font-semibold text-slate-800">{asset.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Custodian: {getUserName(asset.responsiblePersonId)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInitiateMovement(asset.id);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-md shrink-0"
                          title="Relocate this asset"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {loc.assets.length > 3 && (
                      <div className="text-[11px] text-slate-500 text-center pt-1">
                        + {loc.assets.length - 3} more physical assets in this location
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[10px]">Active Room Node</span>
                <button
                  onClick={() => setSelectedLocationId(isExpanded ? null : loc.id)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <span>{isExpanded ? 'Collapse' : 'Inspect All Items'}</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Full Drawer */}
              {isExpanded && loc.assets.length > 0 && (
                <div className="p-4 bg-slate-50/60 border-t border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 mb-1">
                    Complete Inventory Stationed in {loc.name}:
                  </div>
                  {loc.assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => onSelectAsset(asset.id)}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          <span className="font-mono text-blue-600 mr-2">{asset.id}</span>
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Category: {asset.category} • Custodian: {getUserName(asset.responsiblePersonId)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          Confirmed: {asset.lastConfirmedMovementDate}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInitiateMovement(asset.id);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md"
                        >
                          Transfer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
