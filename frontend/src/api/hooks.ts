import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { Asset, ExportJob, InsightView, Project } from './types';

export const useProjects = () =>
  useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await apiClient.get<Project[]>('/projects');
      return data;
    },
  });

export const useAssets = (projectId: string, query: string) =>
  useQuery<Asset[]>({
    queryKey: ['assets', { projectId, query }],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<Asset[]>(`/projects/${projectId}/assets`, {
        params: { q: query },
      });
      return data;
    },
  });

export const useInsightViews = (projectId: string) =>
  useQuery<InsightView[]>({
    queryKey: ['insights', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<InsightView[]>(`/projects/${projectId}/insights`);
      return data;
    },
  });

export const useExportJobs = (projectId: string) =>
  useQuery<ExportJob[]>({
    queryKey: ['exports', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data } = await apiClient.get<ExportJob[]>(`/projects/${projectId}/exports`);
      return data;
    },
  });
