import type { ImportWarning } from "../../types/import";
import type { ParsedSheet, StructureDetection } from "./types";

const SECTION_PATTERNS = [
  "section",
  "section name",
  "category",
  "category name",
  "group",
  "group name",
];

const ITEM_PATTERNS = [
  "item",
  "item name",
  "question",
  "question name",
  "inspection item",
  "description",
  "title",
  "name",
];

const COMMENT_PATTERNS = [
  "comment",
  "comments",
  "comment text",
  "text",
  "content",
  "default comment",
  "default text",
  "note",
  "notes",
];

const ORDER_PATTERNS = [
  "position",
  "order",
  "order number",
  "sort order",
  "sequence",
  "index",
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function findColumn(
  headers: string[],
  patterns: string[]
): string | null {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalize(header),
  }));

  for (const pattern of patterns) {
    const exact = normalizedHeaders.find(
      (header) => header.normalized === pattern
    );

    if (exact) {
      return exact.original;
    }
  }

  for (const pattern of patterns) {
    const partial = normalizedHeaders.find((header) =>
      header.normalized.includes(pattern)
    );

    if (partial) {
      return partial.original;
    }
  }

  return null;
}

function detectFromSheet(sheet: ParsedSheet): StructureDetection {
  const sectionColumn = findColumn(sheet.headers, SECTION_PATTERNS);
  const itemColumn = findColumn(sheet.headers, ITEM_PATTERNS);
  const commentColumn = findColumn(sheet.headers, COMMENT_PATTERNS);
  const orderColumn = findColumn(sheet.headers, ORDER_PATTERNS);

  const warnings: ImportWarning[] = [];

  if (!sectionColumn) {
    warnings.push({
      severity: "warning",
      message:
        "No section column was confidently detected. The importer may not be able to preserve the original section hierarchy.",
      sourceLocation: sheet.name,
    });
  }

  if (!itemColumn) {
    warnings.push({
      severity: "warning",
      message:
        "No item column was confidently detected. Review the spreadsheet structure before importing.",
      sourceLocation: sheet.name,
    });
  }

  if (!commentColumn) {
    warnings.push({
      severity: "info",
      message:
        "No comment column was detected. Items can still be imported without comments.",
      sourceLocation: sheet.name,
    });
  }

  let confidence: StructureDetection["confidence"] = "low";

  if (sectionColumn && itemColumn && commentColumn) {
    confidence = "high";
  } else if (sectionColumn && itemColumn) {
    confidence = "medium";
  }

  return {
    sectionColumn,
    itemColumn,
    commentColumn,
    orderColumn,
    confidence,
    warnings,
  };
}

export function detectStructure(
  sheets: ParsedSheet[]
): StructureDetection {
  if (!sheets.length) {
    return {
      sectionColumn: null,
      itemColumn: null,
      commentColumn: null,
      orderColumn: null,
      confidence: "low",
      warnings: [
        {
          severity: "error",
          message: "No readable worksheet was found in the spreadsheet.",
        },
      ],
    };
  }

  const preferredSheet =
    sheets.find((sheet) => sheet.rows.length > 0) ?? sheets[0];

  return detectFromSheet(preferredSheet);
}