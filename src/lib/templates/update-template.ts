import { pool } from "../supabase/server";
import { getTemplate } from "./get-template";
import type { UpdateTemplateInput } from "../../types/template";

export async function updateTemplate(
  templateId: string,
  input: UpdateTemplateInput
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingTemplate = await client.query(
      `
      SELECT id
      FROM templates
      WHERE id = $1
      `,
      [templateId]
    );

    if (existingTemplate.rows.length === 0) {
      throw new Error("Template not found.");
    }

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw new Error("Template name is required.");
      }

      await client.query(
        `
        UPDATE templates
        SET
          name = $1,
          updated_at = NOW()
        WHERE id = $2
        `,
        [name, templateId]
      );
    }

    if (input.sections !== undefined) {
      if (!Array.isArray(input.sections)) {
        throw new Error("Sections must be an array.");
      }

      await client.query(
        `
        DELETE FROM sections
        WHERE template_id = $1
        `,
        [templateId]
      );

      const sections = input.sections.map(
        (section, position) => ({
          name: section.name.trim(),
          position,
        })
      );

      await client.query(
        `
        INSERT INTO sections (
          template_id,
          name,
          position
        )
        SELECT
          $1,
          data.name,
          data.position
        FROM jsonb_to_recordset($2::jsonb)
        AS data(
          name text,
          position integer
        )
        `,
        [
          templateId,
          JSON.stringify(sections),
        ]
      );

      const items = input.sections.flatMap(
        (section, sectionPosition) =>
          section.items.map((item, position) => ({
            section_position: sectionPosition,
            name: item.name.trim(),
            position,
          }))
      );

      await client.query(
        `
        INSERT INTO items (
          section_id,
          name,
          position
        )
        SELECT
          s.id,
          data.name,
          data.position
        FROM jsonb_to_recordset($2::jsonb)
        AS data(
          section_position integer,
          name text,
          position integer
        )
        INNER JOIN sections s
          ON s.template_id = $1
         AND s.position = data.section_position
        `,
        [
          templateId,
          JSON.stringify(items),
        ]
      );

      const comments = input.sections.flatMap(
        (section, sectionPosition) =>
          section.items.flatMap(
            (item, itemPosition) =>
              item.comments.map(
                (comment, position) => ({
                  section_position: sectionPosition,
                  item_position: itemPosition,
                  content_html:
                    comment.contentHtml,
                  position,
                })
              )
          )
      );

      await client.query(
        `
        INSERT INTO comments (
          item_id,
          content_html,
          position
        )
        SELECT
          i.id,
          data.content_html,
          data.position
        FROM jsonb_to_recordset($2::jsonb)
        AS data(
          section_position integer,
          item_position integer,
          content_html text,
          position integer
        )
        INNER JOIN sections s
          ON s.template_id = $1
         AND s.position = data.section_position
        INNER JOIN items i
          ON i.section_id = s.id
         AND i.position = data.item_position
        `,
        [
          templateId,
          JSON.stringify(comments),
        ]
      );

      await client.query(
        `
        UPDATE templates
        SET updated_at = NOW()
        WHERE id = $1
        `,
        [templateId]
      );
    }

    await client.query("COMMIT");

    const template = await getTemplate(templateId);

    if (!template) {
      throw new Error(
        "Template could not be loaded after update."
      );
    }

    return template;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    throw error;
  } finally {
    client.release();
  }
}