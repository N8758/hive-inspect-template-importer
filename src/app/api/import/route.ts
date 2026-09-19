import { NextResponse } from "next/server";
import { importTemplate } from "../../../actions/import-actions";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await importTemplate(formData);

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        template: null,
        warnings: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to import template.",
      },
      { status: 500 }
    );
  }
}