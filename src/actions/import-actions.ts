"use server";

import { pool } from "../lib/supabase/server";
import { parseXlsx } from "../lib/importer/parse-xlsx";
import { detectStructure } from "../lib/importer/detect-structure";
import { normalizeTemplate } from "../lib/importer/normalize";
import { validateImportedTemplate } from "../lib/importer/validate";

export async function importTemplate(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Please select an Excel file.");
  }

  const fileName = file.name.toLowerCase();

  if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
    throw new Error("Only .xls and .xlsx files are supported.");
  }

  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sheets = parseXlsx(buffer);
  const structure = detectStructure(sheets);

  const sheet =
    sheets.find((currentSheet) => currentSheet.rows.length > 0) ??
    sheets[0];

  if (!sheet) {
    throw new Error("No readable worksheet was found.");
  }

  const importedTemplate = normalizeTemplate(
    sheet,
    structure,
    file.name
  );

  const validationWarnings =
    validateImportedTemplate(importedTemplate);

  const warnings = [
    ...importedTemplate.warnings,
    ...validationWarnings,
  ];

  if (
    validationWarnings.some(
      (warning) => warning.severity === "error"
    )
  ) {
    return {
      success: false,
      template: null,
      warnings,
    };
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
        importedTemplate.name,
        importedTemplate.source,
        importedTemplate.sourceFilename,
      ]
    );

    const templateId = templateResult.rows[0].id;

    const sections = importedTemplate.sections.map(
      (section, position) => ({
        name: section.name,
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

    const items = importedTemplate.sections.flatMap(
      (section, sectionPosition) =>
        section.items.map((item, position) => ({
          section_position: sectionPosition,
          name: item.name,
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

    const comments = importedTemplate.sections.flatMap(
      (section, sectionPosition) =>
        section.items.flatMap(
          (item, itemPosition) =>
            item.comments.map(
              (comment, position) => ({
                section_position: sectionPosition,
                item_position: itemPosition,
                content_html: comment.contentHtml,
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

    if (warnings.length > 0) {
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
          data.severity,
          data.message,
          data.source_location,
          data.original_content
        FROM jsonb_to_recordset($2::jsonb)
        AS data(
          severity text,
          message text,
          source_location text,
          original_content text
        )
        `,
        [
          templateId,
          JSON.stringify(
            warnings.map((warning) => ({
              severity: warning.severity,
              message: warning.message,
              source_location:
                warning.sourceLocation ?? null,
              original_content:
                warning.originalContent ?? null,
            }))
          ),
        ]
      );
    }

    await client.query("COMMIT");

    return {
      success: true,
      templateId,
      template: importedTemplate,
      warnings,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to import template."
    );
  } finally {
    client.release();
  }
}