import React, { useState } from 'react';
import { 
  AuditDocument, 
  DocumentBundle 
} from '../types/document';
import { 
  FileText, 
  Check, 
  Star, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Building2, 
  Calendar, 
  CreditCard,
  Layers
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface DocumentManagerProps {
  documents: AuditDocument[];
  activeBundleId: string;
  presetBundles: DocumentBundle[];
  onSelectBundle: (bundleId: string) => void;
  onSetSourceOfTruth: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onOpenNewDocumentModal: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  activeBundleId,
  presetBundles,
  onSelectBundle,
  onSetSourceOfTruth,
  onDeleteDocument,
  onOpenNewDocumentModal,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  return (
    <div className="space-y-6">
      {/* 1. Preset Bundles Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Skenario Klaster Dokumen Audit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih paket skenario siap pakai atau tambahkan dokumen mandiri untuk diverifikasi
            </p>
          </div>
          <button
            onClick={onOpenNewDocumentModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Dokumen Baru</span>
          </button>
        </div>

        {/* Preset segmented buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          {presetBundles.map((bundle) => {
            const isSelected = bundle.id === activeBundleId;
            return (
              <button
                key={bundle.id}
                onClick={() => {
                  onSelectBundle(bundle.id);
                  if (bundle.documents.length > 0) {
                    setSelectedDocId(bundle.documents[0].id);
                  }
                }}
                className={`text-left p-3 rounded-md border transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="truncate">{bundle.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {bundle.description}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono tabular-nums">
                  {bundle.documents.length} berkas · {bundle.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Documents Master View & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dokumen Terdaftar ({documents.length})
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Pilih acuan kebenaran (Master)
            </span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              const isSot = !!doc.isSourceOfTruth;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {doc.title}
                          </span>
                          {isSot && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Acuan Kebenaran
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {doc.refNumber} · {doc.vendor}
                        </div>
                      </div>
                    </div>

                    {/* Source of truth toggle & delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetSourceOfTruth(doc.id);
                        }}
                        title={isSot ? 'Dokumen ini adalah acuan' : 'Jadikan Acuan Kebenaran Tunggal'}
                        className={`p-1 rounded text-xs transition-colors ${
                          isSot
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-slate-400 hover:text-amber-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isSot ? 'fill-current' : ''}`} />
                      </button>

                      {documents.length > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(doc.id);
                          }}
                          title="Hapus Dokumen"
                          className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial & Status strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(doc.totalAmount)}
                    </span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <span>{doc.items.length} item</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{doc.type.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Document Deep View (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          {activeDoc ? (
            <div className="space-y-5">
              {/* Header of Active Document */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {activeDoc.title}
                    </h3>
                    {activeDoc.isSourceOfTruth && (
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        (Acuan Kebenaran)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Nomor: {activeDoc.refNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{activeDoc.date}</span>
                    {activeDoc.dueDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-600 dark:text-amber-400">Jatuh Tempo: {activeDoc.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>

                {!activeDoc.isSourceOfTruth && (
                  <button
                    onClick={() => onSetSourceOfTruth(activeDoc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-md transition-colors shrink-0"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Jadikan Acuan Kebenaran</span>
                  </button>
                )}
              </div>

              {/* Entity & Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Pihak Penerbit (Vendor)</span>
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {activeDoc.vendor}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Penerima (Buyer)</span>
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {activeDoc.buyer}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Rekening Pembayaran</span>
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white font-mono truncate">
                    {activeDoc.bankAccount || 'Tidak tertera'}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Daftar Rincian Item ({activeDoc.items.length})
                </h4>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium">
                      <tr>
                        <th className="py-2.5 px-3">Deskripsi Barang / Jasa</th>
                        <th className="py-2.5 px-3 text-right">Kuantitas</th>
                        <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                      {activeDoc.items.length > 0 ? (
                        activeDoc.items.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="py-2 px-3">
                              <div className="font-medium text-slate-900 dark:text-white">
                                {item.name}
                              </div>
                              {item.notes && (
                                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                                  {item.notes}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {item.qty} {item.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              {formatRupiah(item.unitPrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              {formatRupiah(item.subtotal)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-slate-500">
                            Tidak ada rincian item baris (dokumen ringkasan pembayaran).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="text-slate-500 dark:text-slate-400 max-w-sm">
                  {activeDoc.notes && (
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Catatan: </span>
                      {activeDoc.notes}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-right font-mono tabular-nums">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(activeDoc.subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>PPN ({activeDoc.taxPercent}%):</span>
                    <span>{formatRupiah(activeDoc.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Tagihan:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(activeDoc.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Pilih dokumen di sebelah kiri untuk melihat rincian detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
