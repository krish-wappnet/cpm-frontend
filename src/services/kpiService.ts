import api from "./api";
import type {
  Kpi,
  KpiUpdate,
  KpiCategory,
  CreateKpiDto,
  UpdateKpiDto,
  CreateKpiUpdateDto,
  KpiFilterParams,
  PaginationParams,
  PaginatedResponse,
} from "../types/kpi";

const API_BASE_URL = "/kpis";

const buildQueryString = (params: Record<string, unknown>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  return queryParams.toString();
};

export const kpiApi = {
  async getAllKpis(
    pagination: PaginationParams = { page: 1, limit: 10 },
    filters: KpiFilterParams = {}
  ): Promise<PaginatedResponse<Kpi>> {
    try {
      const query = buildQueryString({ ...pagination, ...filters });
      console.log("Calling GET /kpis with query:", query);
      const response = await api.get<PaginatedResponse<Kpi>>(
        `${API_BASE_URL}?${query}`
      );
      console.log("GET /kpis response:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error && "message" in error) {
        console.error(
          "Error in getAllKpis:",
          // @ts-expect-error: error might have response and message
          error.response?.data || error.message
        );
      } else {
        console.error("Error in getAllKpis:", error);
      }
      throw error;
    }
  },

  async getMyKpis(
    pagination: PaginationParams = { page: 1, limit: 10 },
    filters: KpiFilterParams = {}
  ): Promise<PaginatedResponse<Kpi>> {
    try {
      const query = buildQueryString({ ...pagination, ...filters });
      console.log("Calling GET /kpis/my-kpis with query:", query);
      const response = await api.get<PaginatedResponse<Kpi>>(
        `${API_BASE_URL}/my-kpis?${query}`
      );
      console.log("GET /kpis/my-kpis response:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error && "message" in error) {
        console.error(
          "Error in getMyKpis:",
          typeof error === "object" &&
            error !== null &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            error.response !== null &&
            "data" in error.response
            ? (error.response as { data?: unknown }).data
            : (error as { message?: unknown }).message
        );
      } else {
        console.error("Error in getMyKpis:", error);
      }
      throw error;
    }
  },

  getKpiById: async (id: string): Promise<Kpi> => {
    const response = await api.get<Kpi>(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  createKpi: async (kpiData: CreateKpiDto): Promise<Kpi> => {
    const response = await api.post<Kpi>(API_BASE_URL, kpiData);
    return response.data;
  },

  updateKpi: async (id: string, kpiData: UpdateKpiDto): Promise<Kpi> => {
    const response = await api.patch<Kpi>(`${API_BASE_URL}/${id}`, kpiData);
    return response.data;
  },

  deleteKpi: async (id: string): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${id}`);
  },

  createKpiUpdate: async (
    updateData: CreateKpiUpdateDto
  ): Promise<KpiUpdate> => {
    const response = await api.post<KpiUpdate>(
      `${API_BASE_URL}/updates`,
      updateData
    );
    return response.data;
  },

  getKpisByUserId: async (
    userId: string,
    pagination: PaginationParams = {},
    filters: KpiFilterParams = {}
  ): Promise<PaginatedResponse<Kpi>> => {
    const response = await api.get(`/kpis/user/${userId}`, {
      params: { ...pagination, ...filters },
    });
    return response.data;
  },

  getKpiUpdates: async (kpiId: string): Promise<KpiUpdate[]> => {
    const response = await api.get<KpiUpdate[]>(
      `${API_BASE_URL}/${kpiId}/updates`
    );
    return response.data;
  },

  getAllCategories: async (): Promise<KpiCategory[]> => {
    const response = await api.get<KpiCategory[]>(`${API_BASE_URL}/categories`);
    return response.data;
  },

  getCategoryById: async (id: string): Promise<KpiCategory> => {
    const response = await api.get<KpiCategory>(
      `${API_BASE_URL}/categories/${id}`
    );
    return response.data;
  },

  createCategory: async (
    name: string,
    description?: string
  ): Promise<KpiCategory> => {
    const response = await api.post<KpiCategory>(`${API_BASE_URL}/categories`, {
      name,
      description,
    });
    return response.data;
  },

  updateCategory: async (
    id: string,
    name: string,
    description?: string
  ): Promise<KpiCategory> => {
    const response = await api.patch<KpiCategory>(
      `${API_BASE_URL}/categories/${id}`,
      {
        name,
        description,
      }
    );
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`${API_BASE_URL}/categories/${id}`);
  },

  getKpiCompletionRate: async (
    userId?: string
  ): Promise<{ total: number; completed: number; rate: number }> => {
    const query = userId ? `?userId=${userId}` : "";
    const response = await api.get(
      `${API_BASE_URL}/analytics/completion-rate${query}`
    );
    return response.data;
  },

  getProgressByCategory: async (): Promise<
    Array<{ category: string; totalKpis: number; avgProgress: number }>
  > => {
    const response = await api.get(
      `${API_BASE_URL}/analytics/progress-by-category`
    );
    return response.data;
  },

  getKpiTrends: async (userId: string): Promise<unknown> => {
    const response = await api.get(
      `${API_BASE_URL}/analytics/trends?userId=${userId}`
    );
    return response.data;
  },
};

export default kpiApi;
