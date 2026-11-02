import React, { useState } from 'react';
import { 
  AuditDocument, 
  DocumentType, 
  DocumentItem 
} from '../types/document';
import { 
  Plus, 
  X, 
  FileText, 
  Trash2, 
  Upload, 
  FileSpreadsheet, 
  FileCode 
} from 'lucide-react';
import { formatRupiah } from '../utils/reconciliationEngine';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (doc: AuditDocument) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onAddDocument,
}) => {
  const [docType, setDocType] = useState<DocumentType>('INVOICE');
  const [title, setTitle] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [buyer, setBuyer] = useState('PT. Wijaya Bangun Mandiri');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('BCA');
  const [taxPercent, setTaxPercent] = useState<number>(11);
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<DocumentItem[]>([
    {
      id: 'it-new-1',
      name: '',
      qty: 1,
      unit: 'Unit',
      unitPrice: 0,
      subtotal: 0,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `it-new-${Date.now()}`,
        name: '',
        qty: 1,
        unit: 'Unit',
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx: number, field: keyof DocumentItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      const q = field === 'qty' ? Number(value) : item.qty;
      const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.subtotal = q * p;
    }
    updated[idx] = item;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, it) => sum + (it.subtotal || 0), 0);
  const taxAmount = Math.round((subtotal * taxPercent) / 100);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !refNumber.trim()) return;

    const newDoc: AuditDocument = {
      id: `doc-custom-${Date.now()}`,
      type: docType,
      title: title.trim(),
      refNumber: refNumber.trim(),
      date,
      dueDate: dueDate || undefined,
      vendor: vendor.trim() || 'Vendor Eksternal',
      buyer: buyer.trim(),
      bankAccount: bankAccount.trim() || undefined,
      bankName: bankName.trim() || undefined,
      items: items.filter((it) => it.name.trim() !== ''),
      subtotalAmount: subtotal,
      taxPercent,
      taxAmount,
      totalAmount,
      currency: 'IDR',
      status: 'DRAFT',
      notes: notes.trim() || undefined,
    };

    onAddDocument(newDoc);
    onClose();
  };

  const handleQuickLoadTemplate = (type: 'INVOICE' | 'DO' | 'PO') => {
    if (type === 'INVOICE') {
      setTitle('Faktur Tagihan Pengganti (Revisi)');
      setRefNumber(`INV/REV/${new Date().getFullYear()}/041`);
      setDocType('INVOICE');
      setVendor('PT. Semen & Baja Nusantara');
      setBankAccount('BCA 880-123-4567 a.n. PT Semen & Baja Nusantara');
      setItems([
        { id: '1', name: 'Semen Portland Gresik 50kg', qty: 40, unit: 'Zak', unitPrice: 65000, subtotal: 2600000 },
        { id: '2', name: 'Besi Beton Ulir 12mm x 12m', qty: 100, unit: 'Batang', unitPrice: 115000, subtotal: 11500000 },
        { id: '3', name: 'Pasir Cor Pasang Berkualitas', qty: 20, unit: 'm³', unitPrice: 250000, subtotal: 5000000 },
      ]);
      setTaxPercent(11);
    } else if (type === 'DO') {
      setTitle('Surat Jalan Tambahan Pengganti');
      setRefNumber(`SJ/SUPP/2026/${Math.floor(100 + Math.random() * 900)}`);
      setDocType('DELIVERY_ORDER');
      setVendor('PT. Ekspedisi Logistik Utama');
      setItems([
        { id: '1', name: 'Semen Portland Gresik 50kg (Pengganti 10 Zak Pecah)', qty: 10, unit: 'Zak', unitPrice: 65000, subtotal: 650000 },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Tambah Dokumen Baru ke Klaster Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Masukkan rincian Purchase Order, Surat Jalan, Invoice, atau Kontrak baru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick template buttons */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 font-medium">Contoh Cepat:</span>
            <button
              type="button"
              onClick={() => handleQuickLoadTemplate('INVOICE')}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              + Template Invoice Revisi
            </button>
            <button
              type="button"
              onClick={() => handleQuickLoadTemplate('DO')}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
            >
              + Template Surat Jalan Pengganti
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jenis Dokumen
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              >
                <option value="PURCHASE_ORDER">Purchase Order (PO)</option>
                <option value="DELIVERY_ORDER">Surat Jalan (DO)</option>
                <option value="INVOICE">Faktur Tagihan (Invoice)</option>
                <option value="BANK_RECEIPT">Bukti Bayar Bank</option>
                <option value="CONTRACT">Surat Kontrak (SPK)</option>
                <option value="BAST">Berita Acara (BAST)</option>
                <option value="CUSTOM">Dokumen Khusus</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Judul Dokumen *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="misal: Faktur Tagihan PT Semen..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nomor Referensi Dokumen *
              </label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="misal: INV/2026/904"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Penerbit (Vendor)
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Nama Vendor"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nomor Rekening Bank
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="BCA 123-456-7890"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jatuh Tempo (Opsional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Line items section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold uppercase tracking-wider text-slate-500">
                Rincian Item Barang / Jasa ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Nama Barang / Deskripsi"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Harga Satuan"
                      min="0"
                      step="1000"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-mono text-right"
                    />
                  </div>
                  <div className="col-span-2 font-mono tabular-nums font-semibold text-right pr-2 text-slate-900 dark:text-white">
                    {formatRupiah(item.subtotal)}
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax and Calculations */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-start">
            <div className="w-1/2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Keterangan khusus..."
                className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              />
            </div>

            <div className="w-64 space-y-1 text-right font-mono tabular-nums">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>PPN (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                />
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{formatRupiah(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors"
            >
              Simpan &amp; Hubungkan Dokumen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
