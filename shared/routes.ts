import { z } from 'zod';
import { 
  insertCafeSchema, 
  insertCategorySchema, 
  insertMenuItemSchema, 
  insertOfferSchema, 
  cafes,
  categories,
  menuItems,
  offers,
  users,
  subscriptions
} from './schema';

export { insertCafeSchema, insertCategorySchema, insertMenuItemSchema, insertOfferSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    }
  },
  cafes: {
    create: {
      method: 'POST' as const,
      path: '/api/cafes',
      input: insertCafeSchema.omit({ ownerId: true, slug: true }), // Slug gen on backend
      responses: {
        201: z.custom<typeof cafes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getMine: {
      method: 'GET' as const,
      path: '/api/cafes/mine',
      responses: {
        200: z.array(z.custom<typeof cafes.$inferSelect>()),
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/cafes/:slug',
      responses: {
        200: z.custom<typeof cafes.$inferSelect & { categories: (typeof categories.$inferSelect & { items: typeof menuItems.$inferSelect[] })[], offers: typeof offers.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/cafes/:id',
      input: insertCafeSchema.partial(),
      responses: {
        200: z.custom<typeof cafes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/cafes/:cafeId/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cafes/:cafeId/categories',
      input: insertCategorySchema.omit({ cafeId: true }),
      responses: {
        201: z.custom<typeof categories.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/categories/:id',
      responses: {
        200: z.void(),
      },
    }
  },
  menuItems: {
    list: {
      method: 'GET' as const,
      path: '/api/cafes/:cafeId/items',
      responses: {
        200: z.array(z.custom<typeof menuItems.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cafes/:cafeId/items',
      input: insertMenuItemSchema.omit({ cafeId: true }),
      responses: {
        201: z.custom<typeof menuItems.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/items/:id',
      input: insertMenuItemSchema.partial(),
      responses: {
        200: z.custom<typeof menuItems.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/items/:id',
      responses: {
        200: z.void(),
      },
    },
  },
  offers: {
    list: {
      method: 'GET' as const,
      path: '/api/cafes/:cafeId/offers',
      responses: {
        200: z.array(z.custom<typeof offers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cafes/:cafeId/offers',
      input: insertOfferSchema.omit({ cafeId: true }),
      responses: {
        201: z.custom<typeof offers.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/offers/:id',
      responses: {
        200: z.void(),
      },
    }
  },
  subscription: {
    status: {
      method: 'GET' as const,
      path: '/api/subscription/status',
      responses: {
        200: z.custom<typeof subscriptions.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
