import type {
  ImportedTemplate,
  ImportWarning,
} from "../../types/import";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateTemplateName(
  template: ImportedTemplate,
  warnings: ImportWarning[]
): void {
  if (!isNonEmptyString(template.name)) {
    warnings.push({
      severity: "error",
      message: "The imported template does not have a valid name.",
    });
  }
}

function validateSections(
  template: ImportedTemplate,
  warnings: ImportWarning[]
): void {
  if (!Array.isArray(template.sections)) {
    warnings.push({
      severity: "error",
      message: "The imported template does not contain valid sections.",
    });

    return;
  }

  if (template.sections.length === 0) {
    warnings.push({
      severity: "error",
      message: "No sections were detected in the imported spreadsheet.",
    });

    return;
  }

  template.sections.forEach((section, sectionIndex) => {
    if (!isNonEmptyString(section.name)) {
      warnings.push({
        severity: "error",
        message: "A section is missing its name.",
        sourceLocation: `section ${sectionIndex + 1}`,
      });
    }

    if (!Number.isInteger(section.position) || section.position < 0) {
      warnings.push({
        severity: "error",
        message: "A section has an invalid position.",
        sourceLocation: section.name || `section ${sectionIndex + 1}`,
      });
    }

    if (!Array.isArray(section.items)) {
      warnings.push({
        severity: "error",
        message: "A section does not contain a valid items list.",
        sourceLocation: section.name || `section ${sectionIndex + 1}`,
      });

      return;
    }

    section.items.forEach((item, itemIndex) => {
      if (!isNonEmptyString(item.name)) {
        warnings.push({
          severity: "error",
          message: "An item is missing its name.",
          sourceLocation: `${section.name}, item ${itemIndex + 1}`,
        });
      }

      if (!Number.isInteger(item.position) || item.position < 0) {
        warnings.push({
          severity: "error",
          message: "An item has an invalid position.",
          sourceLocation: `${section.name}, ${item.name || `item ${itemIndex + 1}`}`,
        });
      }

      if (!Array.isArray(item.comments)) {
        warnings.push({
          severity: "error",
          message: "An item does not contain a valid comments list.",
          sourceLocation: `${section.name}, ${item.name || `item ${itemIndex + 1}`}`,
        });

        return;
      }

      item.comments.forEach((comment, commentIndex) => {
        if (typeof comment.contentHtml !== "string") {
          warnings.push({
            severity: "error",
            message: "A comment does not contain valid text content.",
            sourceLocation: `${section.name}, ${item.name}, comment ${commentIndex + 1}`,
          });
        }

        if (
          !Number.isInteger(comment.position) ||
          comment.position < 0
        ) {
          warnings.push({
            severity: "error",
            message: "A comment has an invalid position.",
            sourceLocation: `${section.name}, ${item.name}, comment ${commentIndex + 1}`,
          });
        }
      });
    });
  });
}

export function validateImportedTemplate(
  template: ImportedTemplate
): ImportWarning[] {
  const warnings: ImportWarning[] = [];

  validateTemplateName(template, warnings);
  validateSections(template, warnings);

  return warnings;
}

export function isValidImportedTemplate(
  template: ImportedTemplate
): boolean {
  const warnings = validateImportedTemplate(template);

  return !warnings.some(
    (warning) => warning.severity === "error"
  );
}