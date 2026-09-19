import { pool } from "../supabase/server";
import { getTemplate } from "./get-template";
import type {
  CreateTemplateInput,
  Template,
} from "../../types/template";

export async function createTemplate(
  input: CreateTemplateInput
): Promise<Template> {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Template name is required.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const templateResult = await client.query(
      `
      INSERT INTO templates (
        name,
        source,
        source_filename
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        name,
        input.source?.trim() || "Spectora",
        input.sourceFilename ?? null,
      ]
    );

    const templateId = templateResult.rows[0].id;

    await client.query("COMMIT");

    const template = await getTemplate(templateId);

    if (!template) {
      throw new Error("Template was created but could not be loaded.");
    }

    return template;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}