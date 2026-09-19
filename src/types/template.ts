export interface TemplateComment {
  id: string;
  itemId: string;
  contentHtml: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  sectionId: string;
  name: string;
  position: number;
  comments: TemplateComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSection {
  id: string;
  templateId: string;
  name: string;
  position: number;
  items: TemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  source: string;
  sourceFilename: string | null;
  sections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  source?: string;
  sourceFilename?: string | null;
}

export interface UpdateTemplateInput {
  name?: string;
  sections?: TemplateSection[];
}