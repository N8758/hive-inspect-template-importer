import type {
  ImportedComment,
  ImportedItem,
  ImportedSection,
  ImportedTemplate,
  ImportWarning,
} from "../../types/import";

export type RawCellValue = string | number | boolean | Date | null | undefined;

export type RawRow = Record<string, RawCellValue>;

export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: RawRow[];
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[];
}

export interface StructureDetection {
  sectionColumn: string | null;
  itemColumn: string | null;
  commentColumn: string | null;
  orderColumn: string | null;
  confidence: "high" | "medium" | "low";
  warnings: ImportWarning[];
}

export interface ImporterContext {
  filename: string;
  sheets: ParsedSheet[];
  structure: StructureDetection;
}

export type {
  ImportedComment,
  ImportedItem,
  ImportedSection,
  ImportedTemplate,
  ImportWarning,
};