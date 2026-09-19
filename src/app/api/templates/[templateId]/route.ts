import { NextResponse } from "next/server";
import {
  getTemplateAction,
  updateTemplateAction,
} from "../../../../actions/template-actions";

interface RouteContext {
  params: Promise<{
    templateId: string;
  }>;
}

export async function GET(
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

    const template = await getTemplateAction(templateId);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load template.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { templateId } = await context.params;
    const body = await request.json();

    if (!templateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Template ID is required.",
        },
        { status: 400 }
      );
    }

    const template = await updateTemplateAction(
      templateId,
      {
        name:
          typeof body.name === "string"
            ? body.name
            : undefined,
        sections: Array.isArray(body.sections)
          ? body.sections
          : undefined,
      }
    );

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update template.";

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