export interface Project {
  id: string;
  name: string;
  updatedAt: string;
  assetCount: number;
}

export interface Asset {
  id: string;
  thumbnailUrl: string;
  tags: string[];
  metadata: Record<string, string>;
}

export interface InsightView {
  id: string;
  name: string;
  filters: string;
  layout: unknown;
}

export interface ExportJob {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  progress: number;
  createdAt: string;
  updatedAt: string;
}
