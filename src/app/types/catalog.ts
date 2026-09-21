// app/types/catalog.ts — tipos do catálogo usados pelas telas
//
// Antes vinham do `@prisma/client` (o front lia o banco). São os campos da
// partitura que a API devolve em `/works/:id/scores` e nos favoritos.

export interface WorkScore {
  id: string;
  workId?: string | null;
  sourceId?: string | null;
  source?: string | null;
  title: string;
  downloadUrl?: string | null;
  thumbnailUrl?: string | null;
  fileSize?: string | null;
  pageCount?: string | null;
  fileFormat?: string | null;
  type?: string | null;
  editor?: string | null;
  publisher?: string | null;
  copyright?: string | null;
  uploadDate?: string | null;
  uploader?: string | null;
  uploadedBy?: string | null;
  notes?: string | null;
  isCustom?: boolean | null;
  isActive?: boolean | null;
  groupIndex?: number | null;
  groupTitle?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}
