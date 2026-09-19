import { pool } from "../supabase/server";
import type {
  Template,
  TemplateSection,
  TemplateItem,
  TemplateComment,
} from "../../types/template";

export async function getTemplate(
  templateId: string
): Promise<Template | null> {
  const result = await pool.query(
    `
    SELECT
      t.id AS template_id,
      t.name AS template_name,
      t.source AS template_source,
      t.source_filename AS template_source_filename,
      t.created_at AS template_created_at,
      t.updated_at AS template_updated_at,

      s.id AS section_id,
      s.template_id AS section_template_id,
      s.name AS section_name,
      s.position AS section_position,
      s.created_at AS section_created_at,
      s.updated_at AS section_updated_at,

      i.id AS item_id,
      i.section_id AS item_section_id,
      i.name AS item_name,
      i.position AS item_position,
      i.created_at AS item_created_at,
      i.updated_at AS item_updated_at,

      c.id AS comment_id,
      c.item_id AS comment_item_id,
      c.content_html AS comment_content_html,
      c.position AS comment_position,
      c.created_at AS comment_created_at,
      c.updated_at AS comment_updated_at

    FROM templates t

    LEFT JOIN sections s
      ON s.template_id = t.id

    LEFT JOIN items i
      ON i.section_id = s.id

    LEFT JOIN comments c
      ON c.item_id = i.id

    WHERE t.id = $1

    ORDER BY
      s.position ASC NULLS LAST,
      i.position ASC NULLS LAST,
      c.position ASC NULLS LAST
    `,
    [templateId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const firstRow = result.rows[0];

  const sections: TemplateSection[] = [];
  const sectionMap = new Map<string, TemplateSection>();
  const itemMap = new Map<string, TemplateItem>();

  for (const row of result.rows) {
    if (
      row.section_id &&
      !sectionMap.has(row.section_id)
    ) {
      const section: TemplateSection = {
        id: row.section_id,
        templateId: row.section_template_id,
        name: row.section_name,
        position: row.section_position,
        items: [],
        createdAt: row.section_created_at,
        updatedAt: row.section_updated_at,
      };

      sectionMap.set(row.section_id, section);
      sections.push(section);
    }

    if (
      row.item_id &&
      !itemMap.has(row.item_id)
    ) {
      const section = sectionMap.get(
        row.item_section_id
      );

      if (section) {
        const item: TemplateItem = {
          id: row.item_id,
          sectionId: row.item_section_id,
          name: row.item_name,
          position: row.item_position,
          comments: [],
          createdAt: row.item_created_at,
          updatedAt: row.item_updated_at,
        };

        itemMap.set(row.item_id, item);
        section.items.push(item);
      }
    }

    if (row.comment_id) {
      const item = itemMap.get(
        row.comment_item_id
      );

      if (item) {
        const comment: TemplateComment = {
          id: row.comment_id,
          itemId: row.comment_item_id,
          contentHtml: row.comment_content_html,
          position: row.comment_position,
          createdAt: row.comment_created_at,
          updatedAt: row.comment_updated_at,
        };

        item.comments.push(comment);
      }
    }
  }

  return {
    id: firstRow.template_id,
    name: firstRow.template_name,
    source: firstRow.template_source,
    sourceFilename:
      firstRow.template_source_filename,
    sections,
    createdAt: firstRow.template_created_at,
    updatedAt: firstRow.template_updated_at,
  };
}