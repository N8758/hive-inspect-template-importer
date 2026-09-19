import type {
  ImportedComment,
  ImportedItem,
  ImportedSection,
  ImportedTemplate,
  ImportWarning,
} from "../../types/import";
import type {
  ParsedSheet,
  RawCellValue,
  StructureDetection,
} from "./types";

function getText(value: RawCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value).trim();
}

function getPosition(
  value: RawCellValue,
  fallback: number
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? "").trim());

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getColumnValue(
  row: Record<string, RawCellValue>,
  column: string | null
): RawCellValue {
  if (!column) {
    return null;
  }

  return row[column];
}

function createComment(
  content: string,
  position: number
): ImportedComment {
  return {
    contentHtml: content,
    position,
  };
}

function createItem(
  name: string,
  position: number
): ImportedItem {
  return {
    name,
    position,
    comments: [],
  };
}

function createSection(
  name: string,
  position: number
): ImportedSection {
  return {
    name,
    position,
    items: [],
  };
}

export function normalizeSheet(
  sheet: ParsedSheet,
  structure: StructureDetection
): {
  sections: ImportedSection[];
  warnings: ImportWarning[];
} {
  const sections: ImportedSection[] = [];
  const warnings: ImportWarning[] = [];

  let currentSection: ImportedSection | null = null;

  sheet.rows.forEach((row, rowIndex) => {
    const sectionName = getText(
      getColumnValue(row, structure.sectionColumn)
    );

    const itemName = getText(
      getColumnValue(row, structure.itemColumn)
    );

    const commentText = getText(
      getColumnValue(row, structure.commentColumn)
    );

    const sourcePosition = getPosition(
      getColumnValue(row, structure.orderColumn),
      rowIndex
    );

    if (sectionName) {
      const existingSection = sections.find(
        (section) => section.name === sectionName
      );

      if (existingSection) {
        currentSection = existingSection;
      } else {
        currentSection = createSection(
          sectionName,
          sections.length
        );

        sections.push(currentSection);
      }
    }

    if (!currentSection) {
      if (itemName || commentText) {
        warnings.push({
          severity: "warning",
          message:
            "Content was found before a section could be detected.",
          sourceLocation: `${sheet.name}, row ${rowIndex + 2}`,
          originalContent: JSON.stringify(row),
        });
      }

      return;
    }

    if (!itemName) {
      if (commentText) {
        warnings.push({
          severity: "warning",
          message:
            "Comment text was found without an item name. The comment was preserved as a warning instead of being silently discarded.",
          sourceLocation: `${sheet.name}, row ${rowIndex + 2}`,
          originalContent: commentText,
        });
      }

      return;
    }

    let item = currentSection.items.find(
      (existingItem) => existingItem.name === itemName
    );

    if (!item) {
      item = createItem(
        itemName,
        currentSection.items.length
      );

      currentSection.items.push(item);
    }

    if (commentText) {
      item.comments.push(
        createComment(
          commentText,
          item.comments.length
        )
      );
    }

    if (structure.orderColumn && sourcePosition !== rowIndex) {
      item.position = sourcePosition;
    }
  });

  sections.forEach((section, sectionIndex) => {
    section.position = sectionIndex;

    section.items.sort(
      (a, b) => a.position - b.position
    );

    section.items.forEach((item, itemIndex) => {
      item.position = itemIndex;

      item.comments.forEach((comment, commentIndex) => {
        comment.position = commentIndex;
      });
    });
  });

  return {
    sections,
    warnings,
  };
}

export function normalizeTemplate(
  sheet: ParsedSheet,
  structure: StructureDetection,
  filename: string
): ImportedTemplate {
  const result = normalizeSheet(sheet, structure);

  return {
    name: filename.replace(/\.[^/.]+$/, ""),
    source: "Spectora",
    sourceFilename: filename,
    sections: result.sections,
    warnings: [
      ...structure.warnings,
      ...result.warnings,
    ],
  };
}