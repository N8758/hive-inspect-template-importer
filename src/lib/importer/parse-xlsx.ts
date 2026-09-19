import * as XLSX from "xlsx";
import type { ParsedSheet, RawCellValue, RawRow } from "./types";

function normalizeHeader(value: RawCellValue): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeCellValue(value: RawCellValue): RawCellValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  return value;
}

export function parseXlsx(buffer: Buffer): ParsedSheet[] {
  if (!buffer || buffer.length === 0) {
    throw new Error("The uploaded spreadsheet is empty.");
  }

  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
      cellHTML: true,
    });
  } catch {
    throw new Error(
      "The uploaded file could not be read as an Excel spreadsheet."
    );
  }

  if (!workbook.SheetNames.length) {
    throw new Error("The Excel file does not contain any worksheets.");
  }

  const sheets: ParsedSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      continue;
    }

    const matrix = XLSX.utils.sheet_to_json<RawCellValue[]>(worksheet, {
      header: 1,
      defval: null,
      raw: true,
    });

    if (!matrix.length) {
      continue;
    }

    const headerRowIndex = matrix.findIndex((row) =>
      row.some((cell) => normalizeHeader(cell) !== "")
    );

    if (headerRowIndex === -1) {
      continue;
    }

    const rawHeaders = matrix[headerRowIndex] ?? [];
    const headers: string[] = [];
    const usedHeaders = new Map<string, number>();

    rawHeaders.forEach((cell, index) => {
      const baseHeader = normalizeHeader(cell) || `Column ${index + 1}`;
      const count = usedHeaders.get(baseHeader) ?? 0;
      const header = count === 0 ? baseHeader : `${baseHeader} ${count + 1}`;

      usedHeaders.set(baseHeader, count + 1);
      headers.push(header);
    });

    const rows: RawRow[] = [];

    for (let rowIndex = headerRowIndex + 1; rowIndex < matrix.length; rowIndex++) {
      const row = matrix[rowIndex] ?? [];

      const hasValue = row.some(
        (cell) => normalizeHeader(cell) !== ""
      );

      if (!hasValue) {
        continue;
      }

      const parsedRow: RawRow = {};

      headers.forEach((header, columnIndex) => {
        parsedRow[header] = normalizeCellValue(row[columnIndex]);
      });

      rows.push(parsedRow);
    }

    sheets.push({
      name: sheetName,
      headers,
      rows,
    });
  }

  if (!sheets.length) {
    throw new Error("The Excel file does not contain readable data.");
  }

  return sheets;
}