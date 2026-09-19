export interface DatabaseTemplate {
  id: string;
  name: string;
  source: string;
  source_filename: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSection {
  id: string;
  template_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseItem {
  id: string;
  section_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseComment {
  id: string;
  item_id: string;
  content_html: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseImportWarning {
  id: string;
  template_id: string;
  severity: "warning" | "error" | "info";
  message: string;
  source_location: string | null;
  original_content: string | null;
  created_at: string;
}