"use server";

import { getTemplates } from "../lib/supabase/queries";
import { getTemplate } from "../lib/templates/get-template";
import { updateTemplate } from "../lib/templates/update-template";
import { duplicateTemplate } from "../lib/templates/duplicate-template";
import type { UpdateTemplateInput } from "../types/template";

export async function listTemplates() {
  return await getTemplates();
}

export async function getTemplateAction(
  templateId: string
) {
  if (!templateId) {
    throw new Error("Template ID is required.");
  }

  return await getTemplate(templateId);
}

export async function updateTemplateAction(
  templateId: string,
  input: UpdateTemplateInput
) {
  if (!templateId) {
    throw new Error("Template ID is required.");
  }

  return await updateTemplate(templateId, input);
}

export async function duplicateTemplateAction(
  templateId: string
) {
  if (!templateId) {
    throw new Error("Template ID is required.");
  }

  return await duplicateTemplate(templateId);
}