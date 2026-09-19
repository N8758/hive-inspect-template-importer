import { NextResponse } from "next/server";
import { listTemplates } from "../../../actions/template-actions";
import { createTemplate } from "../../../lib/templates/create-template";

export async function GET() {
  try {
    const templates = await listTemplates();

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        templates: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to load templates.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const template = await createTemplate({
      name: typeof body.name === "string" ? body.name : "",
      source:
        typeof body.source === "string"
          ? body.source
          : "Spectora",
      sourceFilename:
        typeof body.sourceFilename === "string"
          ? body.sourceFilename
          : null,
    });

    return NextResponse.json(
      {
        success: true,
        template,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        template: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create template.",
      },
      { status: 400 }
    );
  }
}