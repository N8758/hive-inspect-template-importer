import type { ImportWarning } from "../../types/import";

export function createWarning(
  message: string,
  sourceLocation?: string,
  originalContent?: string
): ImportWarning {
  return {
    severity: "warning",
    message,
    sourceLocation: sourceLocation ?? null,
    originalContent: originalContent ?? null,
  };
}

export function createError(
  message: string,
  sourceLocation?: string,
  originalContent?: string
): ImportWarning {
  return {
    severity: "error",
    message,
    sourceLocation: sourceLocation ?? null,
    originalContent: originalContent ?? null,
  };
}

export function createInfo(
  message: string,
  sourceLocation?: string,
  originalContent?: string
): ImportWarning {
  return {
    severity: "info",
    message,
    sourceLocation: sourceLocation ?? null,
    originalContent: originalContent ?? null,
  };
}

export function mergeWarnings(
  ...warningLists: ImportWarning[][]
): ImportWarning[] {
  return warningLists.flat();
}

export function hasErrors(
  warnings: ImportWarning[]
): boolean {
  return warnings.some(
    (warning) => warning.severity === "error"
  );
}

export function countWarnings(
  warnings: ImportWarning[]
): number {
  return warnings.filter(
    (warning) => warning.severity === "warning"
  ).length;
}

export function countErrors(
  warnings: ImportWarning[]
): number {
  return warnings.filter(
    (warning) => warning.severity === "error"
  ).length;
}

export function countInfo(
  warnings: ImportWarning[]
): number {
  return warnings.filter(
    (warning) => warning.severity === "info"
  ).length;
}