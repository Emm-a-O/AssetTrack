import React, { useState } from 'react';
import { AssetTrackProvider, useAssetTrack } from './context/AssetTrackContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { AssetRegisterView } from './components/views/AssetRegisterView';
import { MovementsView } from './components/views/MovementsView';
import { CurrentLocationsView } from './components/views/CurrentLocationsView';
import { HistoryAndAuditView } from './components/views/HistoryAndAuditView';
import { MaintenanceView } from './components/views/MaintenanceView';
import { AllocationView } from './components/views/AllocationView';
import { MissingAssetsView } from './components/views/MissingAssetsView';
import { ReportsView } from './components/views/ReportsView';
import { StructureView } from './components/views/StructureView';

import { RegisterAssetModal } from './components/modals/RegisterAssetModal';
import { AssetDetailModal } from './components/modals/AssetDetailModal';
import { NewMovementModal } from './components/modals/NewMovementModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { PrintQRLabelsModal } from './components/modals/PrintQRLabelsModal';
import {
  ReportMissingModal,
  RecoverAssetModal,
  MaintenanceModal,
  CompleteMaintenanceModal,
} from './components/modals/IncidentAndServiceModals';
import { AssignCustodyModal, ExcelImportModal } from './components/modals/AssignAndImportModals';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  MapPin,
  QrCode,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { environment } = useAssetTrack();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isPrintLabelsOpen, setIsPrintLabelsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [movementAssetId, setMovementAssetId] = useState<string | null>(null);
  const [isMovementOpen, setIsMovementOpen] = useState(false);

  const [missingAssetId, setMissingAssetId] = useState<string | null>(null);
  const [recoverReportId, setRecoverReportId] = useState<string | null>(null);

  const [maintenanceAssetId, setMaintenanceAssetId] = useState<string | null>(null);
  const [completeMaintenanceId, setCompleteMaintenanceId] = useState<string | null>(null);

  const [assignAssetId, setAssignAssetId] = useState<string | null>(null);

  // Helper openers
  const openMovementForAsset = (assetId?: string) => {
    setMovementAssetId(assetId || null);
    setIsMovementOpen(true);
  };

  const openMaintenanceForAsset = (assetId?: string) => {
    setMaintenanceAssetId(assetId || null);
  };

  const openReportMissingForAsset = (assetId?: string) => {
    setMissingAssetId(assetId || null);
  };

  const openAssignForAsset = (assetId: string) => {
    setAssignAssetId(assetId);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        onOpenRegisterModal={() => setIsRegisterOpen(true)}
        onOpenScanModal={() => setIsScanOpen(true)}
        onOpenPrintLabelsModal={() => setIsPrintLabelsOpen(true)}
        onSelectTab={setActiveTab}
      />

      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
              onOpenMovementModal={openMovementForAsset}
              onOpenScanModal={() => setIsScanOpen(true)}
              onSelectAsset={(id) => setSelectedAssetId(id)}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'assets' && (
            <AssetRegisterView
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
              onOpenImportModal={() => setIsImportOpen(true)}
              onSelectAsset={(id) => setSelectedAssetId(id)}
              onInitiateMovement={(id) => openMovementForAsset(id)}
              onInitiateReassignment={(id) => openAssignForAsset(id)}
            />
          )}

          {activeTab === 'movements' && (
            <MovementsView
              onOpenMovementModal={openMovementForAsset}
              onSelectAsset={(id) => setSelectedAssetId(id)}
            />
          )}

          {activeTab === 'locations' && (
            <CurrentLocationsView
              onSelectAsset={(id) => setSelectedAssetId(id)}
              onInitiateMovement={(id) => openMovementForAsset(id)}
            />
          )}

          {activeTab === 'history' && (
            <HistoryAndAuditView onSelectAsset={(id) => setSelectedAssetId(id)} />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              onOpenMaintenanceModal={openMaintenanceForAsset}
              onOpenCompleteModal={(id) => setCompleteMaintenanceId(id)}
              onSelectAsset={(id) => setSelectedAssetId(id)}
            />
          )}

          {activeTab === 'allocation' && environment === 'organisation' && (
            <AllocationView
              onOpenAssignModal={openAssignForAsset}
              onSelectAsset={(id) => setSelectedAssetId(id)}
            />
          )}

          {activeTab === 'missing' && (
            <MissingAssetsView
              onOpenReportModal={openReportMissingForAsset}
              onOpenRecoverModal={(id) => setRecoverReportId(id)}
              onSelectAsset={(id) => setSelectedAssetId(id)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'structure' && environment === 'organisation' && <StructureView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition-colors ${
            activeTab === 'assets' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Register</span>
        </button>

        <button
          onClick={() => setIsScanOpen(true)}
          className="flex flex-col items-center py-1 px-3 -mt-4 bg-blue-600 text-white rounded-full shadow-md text-[10px] font-semibold"
        >
          <QrCode className="w-5 h-5" />
          <span>Scan</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition-colors ${
            activeTab === 'movements' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Move</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-semibold transition-colors ${
            activeTab === 'locations' ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Locations</span>
        </button>
      </nav>

      {/* All Integrated Modals */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAssetCreated={(id) => setSelectedAssetId(id)}
      />

      <AssetDetailModal
        assetId={selectedAssetId}
        isOpen={!!selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        onInitiateMovement={(id) => openMovementForAsset(id)}
        onInitiateMaintenance={(id) => openMaintenanceForAsset(id)}
        onInitiateMissingReport={(id) => openReportMissingForAsset(id)}
        onInitiateReassignment={(id) => openAssignForAsset(id)}
      />

      <NewMovementModal
        isOpen={isMovementOpen}
        onClose={() => {
          setIsMovementOpen(false);
          setMovementAssetId(null);
        }}
        preselectedAssetId={movementAssetId}
        onMovementCreated={() => setActiveTab('movements')}
      />

      <QRScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onAssetScanned={(id) => setSelectedAssetId(id)}
      />

      <PrintQRLabelsModal
        isOpen={isPrintLabelsOpen}
        onClose={() => setIsPrintLabelsOpen(false)}
      />

      <ReportMissingModal
        isOpen={!!missingAssetId}
        onClose={() => setMissingAssetId(null)}
        assetId={missingAssetId}
      />

      <RecoverAssetModal
        isOpen={!!recoverReportId}
        onClose={() => setRecoverReportId(null)}
        reportId={recoverReportId}
      />

      <MaintenanceModal
        isOpen={!!maintenanceAssetId}
        onClose={() => setMaintenanceAssetId(null)}
        assetId={maintenanceAssetId}
      />

      <CompleteMaintenanceModal
        isOpen={!!completeMaintenanceId}
        onClose={() => setCompleteMaintenanceId(null)}
        maintenanceId={completeMaintenanceId}
      />

      <AssignCustodyModal
        isOpen={!!assignAssetId}
        onClose={() => setAssignAssetId(null)}
        assetId={assignAssetId}
      />

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AssetTrackProvider>
      <MainLayout />
    </AssetTrackProvider>
  );
}
