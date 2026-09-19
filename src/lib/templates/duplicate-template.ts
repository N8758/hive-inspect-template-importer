import { pool } from "../supabase/server";
import { getTemplate } from "./get-template";
import type { Template } from "../../types/template";

export async function duplicateTemplate(
  templateId: string
): Promise<Template> {
  const client = await pool.connect();

  let newTemplateId: string;

  try {
    await client.query("BEGIN");

    const sourceTemplateResult = await client.query(
      `
      SELECT
        id,
        name,
        source,
        source_filename
      FROM templates
      WHERE id = $1
      `,
      [templateId]
    );

    if (sourceTemplateResult.rows.length === 0) {
      throw new Error("Template not found.");
    }

    const sourceTemplate =
      sourceTemplateResult.rows[0];

    const newTemplateResult = await client.query(
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
        `${sourceTemplate.name} Copy`,
        sourceTemplate.source,
        sourceTemplate.source_filename,
      ]
    );

    newTemplateId =
      newTemplateResult.rows[0].id;

    await client.query(
      `
      INSERT INTO sections (
        template_id,
        name,
        position
      )
      SELECT
        $1,
        name,
        position
      FROM sections
      WHERE template_id = $2
      ORDER BY position ASC
      `,
      [
        newTemplateId,
        templateId,
      ]
    );

    await client.query(
      `
      INSERT INTO items (
        section_id,
        name,
        position
      )
      SELECT
        newSection.id,
        oldItem.name,
        oldItem.position
      FROM items oldItem
      INNER JOIN sections oldSection
        ON oldSection.id = oldItem.section_id
      INNER JOIN sections newSection
        ON newSection.template_id = $1
       AND newSection.position =
           oldSection.position
      WHERE oldSection.template_id = $2
      ORDER BY
        oldSection.position ASC,
        oldItem.position ASC
      `,
      [
        newTemplateId,
        templateId,
      ]
    );

    await client.query(
      `
      INSERT INTO comments (
        item_id,
        content_html,
        position
      )
      SELECT
        newItem.id,
        oldComment.content_html,
        oldComment.position
      FROM comments oldComment
      INNER JOIN items oldItem
        ON oldItem.id = oldComment.item_id
      INNER JOIN sections oldSection
        ON oldSection.id = oldItem.section_id
      INNER JOIN sections newSection
        ON newSection.template_id = $1
       AND newSection.position =
           oldSection.position
      INNER JOIN items newItem
        ON newItem.section_id = newSection.id
       AND newItem.position =
           oldItem.position
      WHERE oldSection.template_id = $2
      ORDER BY
        oldSection.position ASC,
        oldItem.position ASC,
        oldComment.position ASC
      `,
      [
        newTemplateId,
        templateId,
      ]
    );

    await client.query(
      `
      INSERT INTO import_warnings (
        template_id,
        severity,
        message,
        source_location,
        original_content
      )
      SELECT
        $1,
        severity,
        message,
        source_location,
        original_content
      FROM import_warnings
      WHERE template_id = $2
      `,
      [
        newTemplateId,
        templateId,
      ]
    );

    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    throw error;
  } finally {
    client.release();
  }

  const duplicatedTemplate =
    await getTemplate(newTemplateId);

  if (!duplicatedTemplate) {
    throw new Error(
      "Template was duplicated but could not be loaded."
    );
  }

  return duplicatedTemplate;
}