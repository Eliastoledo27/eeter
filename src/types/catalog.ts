export interface Catalog {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  file_url: string;
  category?: string | null;
  created_at: string;
}

export interface CreateCatalogInput {
  title: string;
  description: string;
  category: string;
  file: File;
}
