// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit';
// import kpiApi from '../../services/kpiService';
// import type {
//   Kpi,
//   KpiUpdate,
//   KpiCategory,
//   CreateKpiDto,
//   UpdateKpiDto,
//   CreateKpiUpdateDto,
//   KpiFilterParams,
//   PaginationParams,
//   PaginatedResponse
// } from '../../types/kpi';

// interface KpiState {
//   kpis: Kpi[];
//   currentKpi: Kpi | null;
//   kpiUpdates: KpiUpdate[];
//   categories: KpiCategory[];
//   loading: boolean;
//   error: string | null;
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
//   filters: KpiFilterParams;
// }

// const initialState: KpiState = {
//   kpis: [],
//   currentKpi: null,
//   kpiUpdates: [],
//   categories: [],
//   loading: false,
//   error: null,
//   pagination: {
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 1,
//   },
//   filters: {},
// };

// // Categories
// interface CreateCategoryDto {
//   name: string;
//   description?: string;
// }

// // Async Thunks
// export const fetchCategories = createAsyncThunk<
//   KpiCategory[],
//   void,
//   { rejectValue: string }
// >(
//   'kpis/fetchCategories',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await kpiApi.getAllCategories();
//       return response;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to fetch categories';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// const updateCategory = createAsyncThunk<
//   KpiCategory,
//   { id: string; name: string; description?: string },
//   { rejectValue: string }
// >(
//   'kpis/updateCategory',
//   async ({ id, name, description }, { rejectWithValue }) => {
//     try {
//       const response = await kpiApi.updateCategory(id, name, description);
//       return response;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to update category';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// const deleteCategory = createAsyncThunk<
//   string,
//   string,
//   { rejectValue: string }
// >(
//   'kpis/deleteCategory',
//   async (id, { rejectWithValue }) => {
//     try {
//       await kpiApi.deleteCategory(id);
//       return id;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to delete category';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const createCategory = createAsyncThunk<
//   KpiCategory,
//   CreateCategoryDto,
//   { rejectValue: string }
// >(
//   'kpis/createCategory',
//   async (categoryData, { rejectWithValue }) => {
//     try {
//       const response = await kpiApi.createCategory(categoryData.name, categoryData.description);
//       return response;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to create category';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const fetchKpis = createAsyncThunk<
//   PaginatedResponse<Kpi>,
//   { pagination?: PaginationParams; filters?: KpiFilterParams },
//   { rejectValue: string }
// >('kpis/fetchAll', async ({ pagination = {}, filters = {} }, { rejectWithValue }) => {
//   try {
//     const response = await kpiApi.getAllKpis(pagination, filters);
//     return response;
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//       ? error.response.data.message
//       : 'Failed to fetch KPIs';
//     return rejectWithValue(errorMessage);
//   }
// });

// export const fetchKpiById = createAsyncThunk<Kpi, string, { rejectValue: string }>(
//   'kpi/fetchKpiById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const kpi = await kpiApi.getKpiById(id);
//       return kpi;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to fetch KPI';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const createKpi = createAsyncThunk<Kpi, CreateKpiDto, { rejectValue: string }>(
//   'kpi/createKpi',
//   async (kpiData, { rejectWithValue }) => {
//     try {
//       const kpi = await kpiApi.createKpi(kpiData);
//       return kpi;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to create KPI';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const updateKpi = createAsyncThunk<
//   Kpi,
//   { id: string; data: UpdateKpiDto },
//   { rejectValue: string }
// >('kpi/updateKpi', async ({ id, data }, { rejectWithValue }) => {
//   try {
//     const kpi = await kpiApi.updateKpi(id, data);
//     return kpi;
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//       ? error.response.data.message
//       : 'Failed to update KPI';
//     return rejectWithValue(errorMessage);
//   }
// });

// export const deleteKpi = createAsyncThunk<string, string, { rejectValue: string }>(
//   'kpi/deleteKpi',
//   async (id, { rejectWithValue }) => {
//     try {
//       await kpiApi.deleteKpi(id);
//       return id;
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//         ? error.response.data.message
//         : 'Failed to delete KPI';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// export const fetchKpiUpdates = createAsyncThunk<
//   KpiUpdate[],
//   string,
//   { rejectValue: string }
// >('kpi/fetchKpiUpdates', async (kpiId, { rejectWithValue }) => {
//   try {
//     const updates = await kpiApi.getKpiUpdates(kpiId);
//     return updates;
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//       ? error.response.data.message
//       : 'Failed to fetch KPI updates';
//     return rejectWithValue(errorMessage);
//   }
// });

// export const addKpiUpdate = createAsyncThunk<
//   KpiUpdate,
//   CreateKpiUpdateDto,
//   { rejectValue: string }
// >('kpi/addKpiUpdate', async (updateData, { rejectWithValue }) => {
//   try {
//     const update = await kpiApi.createKpiUpdate(updateData);
//     return update;
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data && typeof error.response.data.message === 'string'
//       ? error.response.data.message
//       : 'Failed to add KPI update';
//     return rejectWithValue(errorMessage);
//   }
// });

// const kpiSlice = createSlice({
//   name: 'kpi',
//   initialState,
//   reducers: {
//     setCurrentKpi: (state, action: PayloadAction<Kpi | null>) => {
//       state.currentKpi = action.payload;
//     },
//     setFilters: (state, action: PayloadAction<KpiFilterParams>) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     resetKpiState: () => initialState,
//   },
//   extraReducers: (builder) => {
//     // Fetch Categories
//     builder.addCase(fetchCategories.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchCategories.fulfilled, (state, action) => {
//       state.loading = false;
//       state.categories = Array.isArray(action.payload) ? action.payload : [];
//     });
//     builder.addCase(fetchCategories.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload || 'Failed to fetch categories';
//     });

//     // Create Category
//     builder.addCase(createCategory.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(createCategory.fulfilled, (state, action) => {
//       state.loading = false;
//       state.categories = [...state.categories, action.payload];
//     });
//     builder.addCase(createCategory.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload || 'Failed to create category';
//     });

//     // Update Category
//     builder.addCase(updateCategory.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(updateCategory.fulfilled, (state, action) => {
//       state.loading = false;
//       state.categories = state.categories.map(cat =>
//         cat.id === action.payload.id ? action.payload : cat
//       );
//     });
//     builder.addCase(updateCategory.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload || 'Failed to update category';
//     });

//     // Fetch KPIs
//     builder.addCase(fetchKpis.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchKpis.fulfilled, (state, action) => {
//       state.loading = false;
//       // The API returns items directly in the payload, not in a data property
//       state.kpis = action.payload.items || [];
//       state.pagination = {
//         page: action.payload.page,
//         limit: action.payload.limit,
//         total: action.payload.total,
//         totalPages: action.payload.totalPages,
//       };
//     });
//     builder.addCase(fetchKpis.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload || 'Failed to fetch KPIs';
//     });

//     // Fetch KPI by ID
//     builder.addCase(fetchKpiById.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchKpiById.fulfilled, (state, action) => {
//       state.loading = false;
//       state.currentKpi = action.payload;
//     });
//     builder.addCase(fetchKpiById.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload || 'Failed to fetch KPI';
//     });

//     // Create KPI
//     builder.addCase(createKpi.fulfilled, (state, action) => {
//       state.kpis.unshift(action.payload);
//     });

//     // Update KPI
//     builder.addCase(updateKpi.fulfilled, (state, action) => {
//       const index = state.kpis.findIndex((kpi) => kpi.id === action.payload.id);
//       if (index !== -1) {
//         state.kpis[index] = action.payload;
//       }
//       if (state.currentKpi?.id === action.payload.id) {
//         state.currentKpi = action.payload;
//       }
//     });

//     // Delete KPI
//     builder.addCase(deleteKpi.fulfilled, (state, action) => {
//       state.kpis = state.kpis.filter((kpi) => kpi.id !== action.payload);
//       if (state.currentKpi?.id === action.payload) {
//         state.currentKpi = null;
//       }
//     });

//     // KPI Updates
//     builder.addCase(fetchKpiUpdates.fulfilled, (state, action) => {
//       state.kpiUpdates = action.payload;
//     });
//     builder.addCase(addKpiUpdate.fulfilled, (state, action) => {
//       state.kpiUpdates.unshift(action.payload);
//       if (state.currentKpi) {
//         state.currentKpi.currentValue = action.payload.value;
//       }
//     });
//   },
// });

// export const { setCurrentKpi, setFilters, clearError, resetKpiState } = kpiSlice.actions;

// export { updateCategory, deleteCategory };

// export default kpiSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import kpiApi from "../../services/kpiService";
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
} from "../../types/kpi";

interface KpiState {
  kpis: Kpi[];
  currentKpi: Kpi | null;
  kpiUpdates: KpiUpdate[];
  categories: KpiCategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: KpiFilterParams;
}

const initialState: KpiState = {
  kpis: [],
  currentKpi: null,
  kpiUpdates: [],
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {},
};

interface CreateCategoryDto {
  name: string;
  description?: string;
}

// Async Thunks
export const fetchCategories = createAsyncThunk<
  KpiCategory[],
  void,
  { rejectValue: string }
>("kpis/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await kpiApi.getAllCategories();
    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to fetch categories";
    return rejectWithValue(errorMessage);
  }
});

export const createCategory = createAsyncThunk<
  KpiCategory,
  CreateCategoryDto,
  { rejectValue: string }
>("kpis/createCategory", async (categoryData, { rejectWithValue }) => {
  try {
    const response = await kpiApi.createCategory(
      categoryData.name,
      categoryData.description
    );
    return response;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to create category";
    return rejectWithValue(errorMessage);
  }
});

export const updateCategory = createAsyncThunk<
  KpiCategory,
  { id: string; name: string; description?: string },
  { rejectValue: string }
>(
  "kpis/updateCategory",
  async ({ id, name, description }, { rejectWithValue }) => {
    try {
      const response = await kpiApi.updateCategory(id, name, description);
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to update category";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("kpis/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    await kpiApi.deleteCategory(id);
    return id;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to delete category";
    return rejectWithValue(errorMessage);
  }
});

export const fetchKpis = createAsyncThunk<
  PaginatedResponse<Kpi>,
  { pagination?: PaginationParams; filters?: KpiFilterParams },
  { rejectValue: string }
>(
  "kpis/fetchAll",
  async ({ pagination = {}, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiApi.getAllKpis(pagination, filters);
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to fetch KPIs";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchKpisByUserId = createAsyncThunk<
  PaginatedResponse<Kpi>,
  { userId: string; pagination?: PaginationParams; filters?: KpiFilterParams },
  { rejectValue: string }
>(
  "kpis/fetchByUserId",
  async ({ userId, pagination = {}, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await kpiApi.getKpisByUserId(
        userId,
        pagination,
        filters
      );
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to fetch user KPIs";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchKpiById = createAsyncThunk<
  Kpi,
  string,
  { rejectValue: string }
>("kpi/fetchKpiById", async (id, { rejectWithValue }) => {
  try {
    const kpi = await kpiApi.getKpiById(id);
    return kpi;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to fetch KPI";
    return rejectWithValue(errorMessage);
  }
});

export const createKpi = createAsyncThunk<
  Kpi,
  CreateKpiDto,
  { rejectValue: string }
>("kpi/createKpi", async (kpiData, { rejectWithValue }) => {
  try {
    const kpi = await kpiApi.createKpi(kpiData);
    return kpi;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to create KPI";
    return rejectWithValue(errorMessage);
  }
});

export const updateKpi = createAsyncThunk<
  Kpi,
  { id: string; data: UpdateKpiDto },
  { rejectValue: string }
>("kpi/updateKpi", async ({ id, data }, { rejectWithValue }) => {
  try {
    const kpi = await kpiApi.updateKpi(id, data);
    return kpi;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to update KPI";
    return rejectWithValue(errorMessage);
  }
});

export const deleteKpi = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("kpi/deleteKpi", async (id, { rejectWithValue }) => {
  try {
    await kpiApi.deleteKpi(id);
    return id;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to delete KPI";
    return rejectWithValue(errorMessage);
  }
});

export const fetchKpiUpdates = createAsyncThunk<
  KpiUpdate[],
  string,
  { rejectValue: string }
>("kpi/fetchKpiUpdates", async (kpiId, { rejectWithValue }) => {
  try {
    const updates = await kpiApi.getKpiUpdates(kpiId);
    return updates;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to fetch KPI updates";
    return rejectWithValue(errorMessage);
  }
});

export const addKpiUpdate = createAsyncThunk<
  KpiUpdate,
  CreateKpiUpdateDto,
  { rejectValue: string }
>("kpi/addKpiUpdate", async (updateData, { rejectWithValue }) => {
  try {
    const update = await kpiApi.createKpiUpdate(updateData);
    return update;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
        ? error.response.data.message
        : "Failed to add KPI update";
    return rejectWithValue(errorMessage);
  }
});

const kpiSlice = createSlice({
  name: "kpi",
  initialState,
  reducers: {
    setCurrentKpi: (state, action: PayloadAction<Kpi | null>) => {
      state.currentKpi = action.payload;
    },
    setFilters: (state, action: PayloadAction<KpiFilterParams>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetKpiState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch categories";
    });

    // Create Category
    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = [...state.categories, action.payload];
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create category";
    });

    // Update Category
    builder.addCase(updateCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = state.categories.map((cat) =>
        cat.id === action.payload.id ? action.payload : cat
      );
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update category";
    });

    // Delete Category
    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = state.categories.filter(
        (cat) => cat.id !== action.payload
      );
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete category";
    });

    // Fetch KPIs
    builder.addCase(fetchKpis.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKpis.fulfilled, (state, action) => {
      state.loading = false;
      state.kpis = action.payload.items || [];
      state.pagination = {
        page: action.payload.page,
        limit: action.payload.limit,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    });
    builder.addCase(fetchKpis.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch KPIs";
    });

    // Fetch KPIs by User ID
    builder.addCase(fetchKpisByUserId.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKpisByUserId.fulfilled, (state, action) => {
      state.loading = false;
      state.kpis = action.payload.items || [];
      state.pagination = {
        page: action.payload.page,
        limit: action.payload.limit,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    });
    builder.addCase(fetchKpisByUserId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch user KPIs";
    });

    // Fetch KPI by ID
    builder.addCase(fetchKpiById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchKpiById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentKpi = action.payload;
    });
    builder.addCase(fetchKpiById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch KPI";
    });

    // Create KPI
    builder.addCase(createKpi.fulfilled, (state, action) => {
      state.kpis.unshift(action.payload);
    });

    // Update KPI
    builder.addCase(updateKpi.fulfilled, (state, action) => {
      const index = state.kpis.findIndex((kpi) => kpi.id === action.payload.id);
      if (index !== -1) {
        state.kpis[index] = action.payload;
      }
      if (state.currentKpi?.id === action.payload.id) {
        state.currentKpi = action.payload;
      }
    });

    // Delete KPI
    builder.addCase(deleteKpi.fulfilled, (state, action) => {
      state.kpis = state.kpis.filter((kpi) => kpi.id !== action.payload);
      if (state.currentKpi?.id === action.payload) {
        state.currentKpi = null;
      }
    });

    // KPI Updates
    builder.addCase(fetchKpiUpdates.fulfilled, (state, action) => {
      state.kpiUpdates = action.payload;
    });
    builder.addCase(addKpiUpdate.fulfilled, (state, action) => {
      state.kpiUpdates.unshift(action.payload);
      if (state.currentKpi) {
        state.currentKpi.currentValue = action.payload.value;
      }
    });
  },
});

export const { setCurrentKpi, setFilters, clearError, resetKpiState } =
  kpiSlice.actions;


export default kpiSlice.reducer;
