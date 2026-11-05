import React, { useState } from 'react';
import {
  X,
  QrCode,
  Camera,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetScanned: (assetId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onAssetScanned,
}) => {
  const { assets, environment, getLocationName } = useAssetTrack();
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);

  if (!isOpen) return null;

  const sampleAssets = assets.filter((a) => !a.isArchived && a.environment === environment).slice(0, 5);

  const handleProcessCode = (code: string) => {
    setError(null);
    let targetId = code.trim();

    // Check if JSON payload was scanned
    try {
      if (targetId.startsWith('{')) {
        const parsed = JSON.parse(targetId);
        if (parsed.id) targetId = parsed.id;
      }
    } catch {}

    const found = assets.find(
      (a) => a.id.toLowerCase() === targetId.toLowerCase() || a.serialNumber?.toLowerCase() === targetId.toLowerCase()
    );

    if (found) {
      onAssetScanned(found.id);
      onClose();
    } else {
      setError(`No registered asset found matching "${targetId}". Verify code or register new asset.`);
    }
  };

  const simulateCameraScan = (assetId: string) => {
    setIsScanningSimulated(true);
    setTimeout(() => {
      setIsScanningSimulated(false);
      handleProcessCode(assetId);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Asset QR / Barcode Scanner</h3>
              <p className="text-xs text-slate-300">
                Identify physical items, verify locations, and audit inventory
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

        <div className="p-6 space-y-6">
          {/* Simulated Optical Viewfinder */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center text-center p-6 border-2 border-slate-800 shadow-inner">
            {/* Viewfinder Reticle */}
            <div className="w-48 h-48 border-2 border-blue-400/80 rounded-2xl relative flex items-center justify-center">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-400" />

              {/* Laser scan animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse absolute" />

              <div className="text-center">
                <QrCode className="w-12 h-12 text-blue-300/40 mx-auto" />
                <span className="text-[10px] text-blue-200/80 font-mono mt-1 block">
                  {isScanningSimulated ? 'DECODING ASSET TAG...' : 'ALIGN QR CODE / TAG'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Web camera stream active. Hold equipment barcode or QR tag in view.
            </p>
          </div>

          {/* Quick Simulated Scan Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulate Physical Scan with Sample Assets:</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => simulateCameraScan(asset.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-left transition-colors text-xs flex items-center gap-2"
                >
                  <span className="font-mono font-bold text-blue-600">{asset.id}</span>
                  <span className="text-slate-800 font-medium truncate max-w-[120px]">{asset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Search */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Enter Asset ID / Serial Number Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AST-00001 or SN-SAM-9844211"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProcessCode(manualInput);
                }}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-xs uppercase"
              />
              <button
                type="button"
                onClick={() => handleProcessCode(manualInput)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lookup</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
