import { notFound } from "next/navigation";
import TemplateEditor from "../../../components/templates/TemplateEditor";
import { getTemplate } from "../../../lib/templates/get-template";

interface TemplatePageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default async function TemplatePage({
  params,
}: TemplatePageProps) {
  const { templateId } = await params;

  const template = await getTemplate(templateId);

  if (!template) {
    notFound();
  }

  return <TemplateEditor initialTemplate={template} />;
}