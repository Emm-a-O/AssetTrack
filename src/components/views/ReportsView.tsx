import React, { useState } from 'react';
import {
  FileBarChart2,
  Printer,
  Download,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  Layers,
  DollarSign,
  Boxes,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';

export const ReportsView: React.FC = () => {
  const {
    assets,
    movements,
    locations,
    departments,
    maintenanceRecords,
    missingReports,
    environment,
    getLocationName,
    getUserName,
    getDepartmentName,
  } = useAssetTrack();

  const [reportType, setReportType] = useState<'inventory' | 'movements' | 'locations' | 'maintenance'>('inventory');

  const scopedAssets = assets.filter((a) => !a.isArchived && a.environment === environment);
  const scopedAssetIds = scopedAssets.map((a) => a.id);
  const scopedMovements = movements.filter((m) => m.environment === environment);
  const scopedMaintenance = maintenanceRecords.filter((m) => scopedAssetIds.includes(m.assetId));

  const totalValue = scopedAssets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
  const totalMaintCost = scopedMaintenance.reduce((sum, m) => sum + (m.repairCost || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'inventory') {
      headers = ['Asset ID', 'Name', 'Category', 'Brand', 'Serial', 'Location', 'Custodian', 'Condition', 'Status', 'Cost'];
      rows = scopedAssets.map((a) => [
        `"${a.id}"`,
        `"${a.name}"`,
        `"${a.category}"`,
        `"${a.brand || ''}"`,
        `"${a.serialNumber || ''}"`,
        `"${getLocationName(a.currentLocationId)}"`,
        `"${getUserName(a.responsiblePersonId)}"`,
        `"${a.condition}"`,
        `"${a.status}"`,
        `"${a.acquisitionCost || 0}"`,
      ]);
    } else if (reportType === 'movements') {
      headers = [
        'Tx ID',
        'Asset ID',
        'Asset Name',
        'From Location',
        'To Location',
        'Date',
        'Time',
        'Reason',
        environment === 'household' ? 'Moved By (Individual)' : 'Requested By',
        'Status',
      ];
      rows = scopedMovements.map((m) => [
        `"${m.id}"`,
        `"${m.assetId}"`,
        `"${m.assetName}"`,
        `"${getLocationName(m.previousLocationId)}"`,
        `"${getLocationName(m.newLocationId)}"`,
        `"${m.movementDate}"`,
        `"${m.movementTime}"`,
        `"${m.movementReason}"`,
        `"${m.requestedByName}"`,
        `"${environment === 'household' ? 'Moved Freely' : m.status}"`,
      ]);
    } else if (reportType === 'locations') {
      headers = ['Location Code', 'Location Name', 'Level', 'Asset Count'];
      rows = locations.filter(l => l.isActive && l.environment === environment).map((l) => [
        `"${l.code}"`,
        `"${l.name}"`,
        `"${l.level}"`,
        `"${assets.filter(a => !a.isArchived && a.currentLocationId === l.id).length}"`,
      ]);
    } else {
      headers = ['Maintenance ID', 'Asset ID', 'Asset Name', 'Type', 'Reported Date', 'Technician', 'Status', 'Cost ($)'];
      rows = scopedMaintenance.map((m) => [
        `"${m.id}"`,
        `"${m.assetId}"`,
        `"${m.assetName}"`,
        `"${m.maintenanceType}"`,
        `"${m.reportedDate}"`,
        `"${m.assignedTechnician}"`,
        `"${m.status}"`,
        `"${m.repairCost || 0}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AssetTrack_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-blue-600" />
            <span>Management &amp; Audit Reports</span>
          </h2>
          <p className="text-xs text-slate-500">
            Exportable management reports, valuation statements, and physical audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setReportType('inventory')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            reportType === 'inventory'
              ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <Boxes className={`w-4 h-4 mb-2 ${reportType === 'inventory' ? 'text-blue-600' : 'text-slate-400'}`} />
          <div className="text-xs font-bold text-slate-900">Asset Register Valuation</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{scopedAssets.length} assets • ${totalValue.toLocaleString()}</div>
        </button>

        <button
          onClick={() => setReportType('movements')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            reportType === 'movements'
              ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className={`w-4 h-4 mb-2 ${reportType === 'movements' ? 'text-blue-600' : 'text-slate-400'}`} />
          <div className="text-xs font-bold text-slate-900">Movement Audit Trail</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{scopedMovements.length} total transfers</div>
        </button>

        <button
          onClick={() => setReportType('locations')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            reportType === 'locations'
              ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <MapPin className={`w-4 h-4 mb-2 ${reportType === 'locations' ? 'text-blue-600' : 'text-slate-400'}`} />
          <div className="text-xs font-bold text-slate-900">Location Distribution</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Occupancy per room</div>
        </button>

        <button
          onClick={() => setReportType('maintenance')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            reportType === 'maintenance'
              ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <DollarSign className={`w-4 h-4 mb-2 ${reportType === 'maintenance' ? 'text-blue-600' : 'text-slate-400'}`} />
          <div className="text-xs font-bold text-slate-900">Maintenance Costs</div>
          <div className="text-[10px] text-slate-500 mt-0.5">${totalMaintCost.toLocaleString()} spent</div>
        </button>
      </div>

      {/* Report Canvas / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 print:p-0 print:border-none">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
                Official Compliance Statement
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {reportType === 'inventory' && 'Master Physical Asset Inventory & Valuation Report'}
                {reportType === 'movements' && 'Historical Physical Asset Movement & Transfer Log'}
                {reportType === 'locations' && 'Premises Location Utilization & Equipment Audit'}
                {reportType === 'maintenance' && 'Equipment Servicing, Repair Expenses & Condition History'}
              </h3>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div>System: AssetTrack v1.0</div>
            </div>
          </div>
        </div>

        {/* Data rendering */}
        <div className="overflow-x-auto">
          {reportType === 'inventory' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Asset ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Custodian</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedAssets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">{a.id}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{a.name}</td>
                    <td className="py-2 px-3 text-slate-600">{a.category}</td>
                    <td className="py-2 px-3 text-slate-700">{getLocationName(a.currentLocationId)}</td>
                    <td className="py-2 px-3 text-slate-700">{getUserName(a.responsiblePersonId)}</td>
                    <td className="py-2 px-3 text-slate-600">{a.condition}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{a.status}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${(a.acquisitionCost || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                <tr>
                  <td colSpan={7} className="py-3 px-3 text-right text-slate-700">Total Book Value:</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-700">${totalValue.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {reportType === 'movements' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Tx ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">From Location</th>
                  <th className="py-2.5 px-3">To Location</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">{environment === 'household' ? 'Moved By' : 'Requested By'}</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">{m.id}</td>
                    <td className="py-2 px-3 text-slate-600">{m.movementDate} {m.movementTime}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{m.assetName}</td>
                    <td className="py-2 px-3 text-slate-600">{getLocationName(m.previousLocationId)}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{getLocationName(m.newLocationId)}</td>
                    <td className="py-2 px-3 text-slate-600">{m.movementReason}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{m.requestedByName}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">
                      {environment === 'household' ? 'Moved Freely' : m.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'locations' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Assigned Assets Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.filter(l => l.isActive && l.environment === environment).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">{l.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{l.name}</td>
                    <td className="py-2 px-3 text-slate-600">{l.level}</td>
                    <td className="py-2 px-3 font-bold text-blue-700">
                      {scopedAssets.filter(a => a.currentLocationId === l.id).length} items
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'maintenance' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Equipment</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Reported</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedMaintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-600">{m.id}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{m.assetName}</td>
                    <td className="py-2 px-3 text-slate-600">{m.maintenanceType}</td>
                    <td className="py-2 px-3 text-slate-700">{m.assignedTechnician}</td>
                    <td className="py-2 px-3 text-slate-500">{m.reportedDate}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{m.status}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${(m.repairCost || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-right text-slate-700">Total Maintenance Expenditure:</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-700">${totalMaintCost.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
