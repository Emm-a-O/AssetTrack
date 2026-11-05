import React, { useState } from 'react';
import {
  FolderTree,
  Building,
  Building2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  User,
  MapPin,
  Edit2,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { Location, Department } from '../../types';

export const StructureView: React.FC = () => {
  const {
    locations,
    departments,
    assets,
    environment,
    addLocation,
    updateLocation,
    toggleLocationActive,
    addDepartment,
    getUserName,
    users,
  } = useAssetTrack();

  const [activeTab, setActiveTab] = useState<'locations' | 'departments'>('locations');
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // New Location Form State
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locLevel, setLocLevel] = useState<Location['level']>('Room');
  const [locParentId, setLocParentId] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [error, setError] = useState<string | null>(null);

  // New Department Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');

  const currentLocations = locations.filter((l) => l.environment === environment);

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locCode.trim()) {
      setError('Location name and code are required.');
      return;
    }

    const res = addLocation({
      name: locName.trim(),
      code: locCode.trim().toUpperCase(),
      level: locLevel,
      parentId: locParentId || undefined,
      description: locDesc.trim() || undefined,
      isActive: true,
      environment,
    });

    if (res.success) {
      setLocName('');
      setLocCode('');
      setLocParentId('');
      setLocDesc('');
      setShowAddLocationModal(false);
      setError(null);
    } else {
      setError(res.error || 'Failed to create location.');
    }
  };

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      setError('Department name and code are required.');
      return;
    }

    addDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      headUserId: deptHeadId || undefined,
      isActive: true,
    });

    setDeptName('');
    setDeptCode('');
    setDeptHeadId('');
    setShowAddDeptModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <span>Locations &amp; Organisation Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Hierarchical location structure &amp; departmental divisions (Module 10)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'locations' ? (
            <button
              onClick={() => setShowAddLocationModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('locations')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'locations'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Hierarchical Locations ({currentLocations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <span>Departments ({departments.length})</span>
        </button>
      </div>

      {/* Compliance Rule 10 Note */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Database Rule #10:</span> A location cannot be permanently deleted if it has historical asset transactions. To preserve audit integrity, unused rooms or facilities must be deactivated instead.
        </div>
      </div>

      {activeTab === 'locations' ? (
        /* Locations Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Location Name</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Parent Location</th>
                  <th className="py-3 px-4">Current Assets</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Deactivate / Activate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLocations.map((loc) => {
                  const parent = locations.find((p) => p.id === loc.parentId);
                  const count = assets.filter(
                    (a) => !a.isArchived && a.currentLocationId === loc.id
                  ).length;

                  return (
                    <tr key={loc.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {loc.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {loc.name}
                        {loc.description && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            {loc.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{loc.level}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {parent ? parent.name : <span className="text-slate-400">Top Level</span>}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {count} assets
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            loc.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {loc.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleLocationActive(loc.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                            loc.isActive
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {loc.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Departments Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const headUser = users.find((u) => u.id === dept.headUserId);
            const deptAssets = assets.filter((a) => !a.isArchived && a.departmentId === dept.id);

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {dept.code}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {deptAssets.length} Assets Assigned
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Head: {headUser ? headUser.name : 'Unassigned'}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Hierarchical Location</h3>
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biology Laboratory or Server Room B"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SCI-202"
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hierarchy Level
                  </label>
                  <select
                    value={locLevel}
                    onChange={(e) => setLocLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Building">Building / Block</option>
                    <option value="Floor">Floor / Wing</option>
                    <option value="Room">Room / Office</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Zone">Zone / Yard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Location (Optional)
                </label>
                <select
                  value={locParentId}
                  onChange={(e) => setLocParentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Top-Level Building/Premises)</option>
                  {currentLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Security Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Keycard restricted entrance with dual fire suppression"
                  value={locDesc}
                  onChange={(e) => setLocDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maintenance &amp; Physical Plant"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dept Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPP"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Head
                  </label>
                  <select
                    value={deptHeadId}
                    onChange={(e) => setDeptHeadId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select head...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
