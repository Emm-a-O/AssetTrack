import React, { useState, useEffect } from 'react';
import { X, Printer, QrCode, Filter, CheckSquare, Square } from 'lucide-react';
import { useAssetTrack } from '../../context/AssetTrackContext';
import { generateQRCodeDataUrl } from '../../utils/qrHelper';

interface PrintQRLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TagItem {
  id: string;
  name: string;
  category: string;
  location: string;
  qrUrl: string;
}

export const PrintQRLabelsModal: React.FC<PrintQRLabelsModalProps> = ({ isOpen, onClose }) => {
  const { assets, environment, getLocationName } = useAssetTrack();
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);

  const activeAssets = assets.filter((a) => !a.isArchived && a.environment === environment);

  useEffect(() => {
    if (isOpen) {
      // Default select all active assets
      setSelectedAssetIds(activeAssets.map((a) => a.id));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedAssetIds.length > 0) {
      setLoading(true);
      const selected = activeAssets.filter((a) => selectedAssetIds.includes(a.id));
      Promise.all(
        selected.map(async (asset) => {
          const payload = JSON.stringify({ id: asset.id, name: asset.name, serial: asset.serialNumber });
          const qrUrl = await generateQRCodeDataUrl(payload);
          return {
            id: asset.id,
            name: asset.name,
            category: asset.category,
            location: getLocationName(asset.currentLocationId),
            qrUrl,
          };
        })
      ).then((res) => {
        setTags(res);
        setLoading(false);
      });
    } else {
      setTags([]);
    }
  }, [selectedAssetIds]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedAssetIds.length === activeAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(activeAssets.map((a) => a.id));
    }
  };

  const toggleAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const labelsHtml = tags
        .map(
          (t) => `
        <div style="border: 2px dashed #334155; border-radius: 8px; padding: 10px; width: 220px; box-sizing: border-box; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 6px; display: inline-block; vertical-align: top; page-break-inside: avoid;">
          <div style="font-size: 10px; font-weight: bold; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase;">AssetTrack Tag</div>
          <div style="font-size: 15px; font-weight: 900; font-family: monospace; color: #0f172a; margin: 2px 0;">${t.id}</div>
          <div style="font-size: 12px; font-weight: bold; color: #1e293b; max-height: 28px; overflow: hidden; margin-bottom: 4px;">${t.name}</div>
          <img src="${t.qrUrl}" width="120" height="120" style="display: block; margin: 0 auto;" />
          <div style="font-size: 9px; color: #64748b; margin-top: 4px;">Loc: <strong>${t.location}</strong></div>
        </div>
      `
        )
        .join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AssetTrack QR Label Sheet</title>
            <style>
              @media print {
                body { margin: 0; padding: 10mm; }
                @page { margin: 8mm; }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 15px; background: white;">
            <div style="text-align: center; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              <h2 style="margin: 0; font-family: sans-serif; font-size: 16px;">AssetTrack Equipment QR Tag Sheet (${tags.length} Assets)</h2>
              <p style="margin: 3px 0 0; font-size: 11px; color: #64748b; font-family: sans-serif;">Affix tags directly to equipment casing for instant scan audit.</p>
            </div>
            <div style="text-align: center;">
              ${labelsHtml}
            </div>
            <script>window.onload = function() { window.print(); }<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Print QR Equipment Tags</h3>
              <p className="text-xs text-slate-300">
                Batch printable asset labels for equipment marking
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

        {/* Selection Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-600"
            >
              {selectedAssetIds.length === activeAssets.length ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({activeAssets.length})</span>
            </button>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-medium">
              Selected: <strong className="text-blue-600">{selectedAssetIds.length}</strong> tags
            </span>
          </div>

          <button
            onClick={handlePrint}
            disabled={tags.length === 0 || loading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label Sheet ({tags.length})</span>
          </button>
        </div>

        {/* Preview Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/60">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Generating QR tag previews...</div>
          ) : tags.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No assets selected. Select assets above to generate labels.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tags.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center text-center relative hover:border-blue-500 transition-colors"
                >
                  <button
                    onClick={() => toggleAsset(t.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"
                    title="Remove from print batch"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[9px] font-bold tracking-wider uppercase text-blue-600">
                    AssetTrack Tag
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900 mt-0.5">
                    {t.id}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[160px] mt-0.5">
                    {t.name}
                  </p>
                  <img
                    src={t.qrUrl}
                    alt={t.id}
                    className="w-28 h-28 my-1 p-0.5 border border-slate-100 rounded-md"
                  />
                  <span className="text-[10px] text-slate-500 truncate max-w-[170px]">
                    Loc: <strong>{t.location}</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
