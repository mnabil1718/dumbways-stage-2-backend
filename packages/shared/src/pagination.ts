
import z from "zod";

export const PaginationFilterSchema = z.object({
        page: z.coerce.number().gte(1).optional(),
        limit: z.coerce.number().gte(1).lte(100).optional(),
});

export type PaginationFilter = z.infer<typeof PaginationFilterSchema>;

export interface PaginationMetadata {
        current_page: number;
        page_size: number;
        total_pages: number;
        total_items: number;
}

export function calculatePaginationMetadata(filter: PaginationFilter, total_items: number): PaginationMetadata {
        const limit = filter.limit ?? 100;
        const current_page = filter.page ?? 1;
        const page_size = Math.min(limit, 100);
        const total_pages = Math.ceil(total_items / page_size);

        return {
                current_page,
                page_size,
                total_pages,
                total_items,
        };
}


export function buildPaginationQuery(filter: PaginationFilter): { skip: number, take: number } {
        const limit = filter.limit ?? 100;
        const take = Math.min(limit, 100);
        const current_page = filter.page ?? 1;
        const skip = (current_page - 1) * take;

        return { skip, take };
}
