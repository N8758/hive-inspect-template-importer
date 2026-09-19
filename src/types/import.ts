export type ImportWarningSeverity = "warning" | "error" | "info";

export interface ImportWarning {
  id?: string;
  severity: ImportWarningSeverity;
  message: string;
  sourceLocation?: string | null;
  originalContent?: string | null;
}

export interface ImportedComment {
  contentHtml: string;
  position: number;
}

export interface ImportedItem {
  name: string;
  position: number;
  comments: ImportedComment[];
}

export interface ImportedSection {
  name: string;
  position: number;
  items: ImportedItem[];
}

export interface ImportedTemplate {
  name: string;
  source: string;
  sourceFilename: string | null;
  sections: ImportedSection[];
  warnings: ImportWarning[];
}

export interface ImportResult {
  success: boolean;
  template: ImportedTemplate | null;
  warnings: ImportWarning[];
  error?: string;
}