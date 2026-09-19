import { NextResponse } from "next/server";
import { duplicateTemplateAction } from "../../../../../actions/template-actions";

interface RouteContext {
  params: Promise<{
    templateId: string;
  }>;
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const { templateId } = await context.params;

    if (!templateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Template ID is required.",
        },
        { status: 400 }
      );
    }

    const template = await duplicateTemplateAction(
      templateId
    );

    return NextResponse.json(
      {
        success: true,
        template,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to duplicate template.";

    const status = message === "Template not found." ? 404 : 400;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}