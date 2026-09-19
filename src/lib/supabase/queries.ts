import { pool } from "./server";

export async function getTemplates() {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      source,
      source_filename,
      created_at,
      updated_at
    FROM templates
    ORDER BY updated_at DESC
    `
  );

  return result.rows;
}

export async function getTemplateById(templateId: string) {
  const templateResult = await pool.query(
    `
    SELECT
      id,
      name,
      source,
      source_filename,
      created_at,
      updated_at
    FROM templates
    WHERE id = $1
    `,
    [templateId]
  );

  if (templateResult.rows.length === 0) {
    return null;
  }

  const template = templateResult.rows[0];

  const sectionsResult = await pool.query(
    `
    SELECT
      id,
      template_id,
      name,
      position,
      created_at,
      updated_at
    FROM sections
    WHERE template_id = $1
    ORDER BY position ASC
    `,
    [templateId]
  );

  const sections = [];

  for (const section of sectionsResult.rows) {
    const itemsResult = await pool.query(
      `
      SELECT
        id,
        section_id,
        name,
        position,
        created_at,
        updated_at
      FROM items
      WHERE section_id = $1
      ORDER BY position ASC
      `,
      [section.id]
    );

    const items = [];

    for (const item of itemsResult.rows) {
      const commentsResult = await pool.query(
        `
        SELECT
          id,
          item_id,
          content_html,
          position,
          created_at,
          updated_at
        FROM comments
        WHERE item_id = $1
        ORDER BY position ASC
        `,
        [item.id]
      );

      items.push({
        ...item,
        comments: commentsResult.rows,
      });
    }

    sections.push({
      ...section,
      items,
    });
  }

  return {
    ...template,
    sections,
  };
}