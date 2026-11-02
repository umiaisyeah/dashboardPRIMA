export type DocumentType = 
  | 'PURCHASE_ORDER' 
  | 'DELIVERY_ORDER' 
  | 'INVOICE' 
  | 'BANK_RECEIPT' 
  | 'CONTRACT' 
  | 'BAST' 
  | 'PAYROLL' 
  | 'CUSTOM';

export type DiscrepancySeverity = 'KRITIS' | 'SEDANG' | 'RENDAH' | 'MATCH';

export interface DocumentItem {
  id: string;
  name: string;
  sku?: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface AuditDocument {
  id: string;
  type: DocumentType;
  title: string;
  refNumber: string;
  date: string;
  dueDate?: string;
  vendor: string;
  buyer: string;
  bankAccount?: string;
  bankName?: string;
  items: DocumentItem[];
  subtotalAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  isSourceOfTruth?: boolean;
  status: 'DRAFT' | 'VERIFIED' | 'DISCREPANCY' | 'SYNCED' | 'HELD';
  notes?: string;
  rawText?: string;
  fileAttachmentName?: string;
}

export interface DiscrepancyValue {
  docId: string;
  docTitle: string;
  docType: DocumentType;
  value: string | number;
}

export interface DiscrepancyItem {
  id: string;
  category: 'NOMINAL' | 'KUANTITAS' | 'HARGA_SATUAN' | 'PAJAK' | 'TANGGAL' | 'REKENING' | 'VENDOR' | 'KLAUSUL';
  field: string;
  severity: DiscrepancySeverity;
  description: string;
  values: DiscrepancyValue[];
  differenceValue?: number;
  differenceFormatted?: string;
  recommendedAction: string;
  isResolved?: boolean;
  resolvedAt?: string;
  resolvedMethod?: string;
}

export interface AutoSyncAdjustment {
  targetDocId: string;
  targetDocTitle: string;
  field: string;
  originalValue: string | number;
  correctedValue: string | number;
  note: string;
}

export interface AutoSyncPlan {
  sourceOfTruthDocId: string;
  sourceOfTruthTitle: string;
  adjustments: AutoSyncAdjustment[];
  financialAdjustmentAmount: number;
  summary: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  severity: DiscrepancySeverity;
  timestamp: string;
  isRead: boolean;
  channel: 'IN_APP' | 'EMAIL' | 'WEBHOOK';
  docRef?: string;
  actionTaken?: string;
}

export interface ToleranceConfig {
  nominal: number; // e.g. Rp 50.000 tolerance
  percentage: number; // e.g. 0.5% tolerance
  autoHoldOnCritical: boolean;
  alertEmail: string;
  webhookUrl: string;
  soundEnabled: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  severity?: DiscrepancySeverity;
}

export interface DocumentBundle {
  id: string;
  name: string;
  description: string;
  category: string;
  documents: AuditDocument[];
}
