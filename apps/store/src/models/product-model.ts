import { calcLastId, NotFoundError } from "@repo/shared";
import z from "zod";

export enum PRODUCT_STATUS {
        ACTIVE = "active",
        INACTIVE = "inactive",
        DRAFT = "draft"
}

export interface Product {
        id: number;
        name: string;
        slug: string;
        desc: string;
        price: number;
        stock: number;
        status: PRODUCT_STATUS;
        created_at: Date;
        updated_at: Date;
}


export type CreateProduct = Omit<Product, "id">;

export const CreateProductSchema = z.object({
        name: z.string().min(1),
        desc: z.string().min(1).max(350),
        price: z.number().gte(1),
        stock: z.number().nonnegative(),
        status: z.enum(PRODUCT_STATUS),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const products: Product[] = [
        {
                id: 1,
                name: "Mechanical Keyboard",
                slug: "mechanical-keyboard",
                desc: "RGB mechanical keyboard with blue switches and aluminium frame.",
                price: 149.99,
                stock: 25,
                status: PRODUCT_STATUS.ACTIVE,
                created_at: new Date("2025-12-20T08:00:00Z"),
                updated_at: new Date("2025-12-20T08:00:00Z"),
        },
        {
                id: 2,
                name: "Wireless Mouse",
                slug: "wireless-mouse",
                desc: "Ergonomic wireless mouse with adjustable DPI and long battery life.",
                price: 39.99,
                stock: 100,
                status: PRODUCT_STATUS.DRAFT,
                created_at: new Date("2025-12-22T10:30:00Z"),
                updated_at: new Date("2025-12-22T10:30:00Z"),
        },
];

export function insertProduct(data: CreateProduct): Product {
        const lastId = calcLastId(products);
        const id: number = lastId;
        const product: Product = {
                id,
                ...data,
        };

        products.push(product);
        return product;
}

export function updateProduct(product: Product): Product {
        const idx = products.findIndex((p) => p.id === product.id);

        // just to be safe
        if (idx === -1) throw new NotFoundError("Product not found");

        products[idx] = product;
        return product;
}

export function getAllProducts(): Product[] {
        return products;
};

export function getProductById(id: number): Product {
        const p = products.find((product) => product.id === id);
        if (!p) throw new NotFoundError("Product not found");
        return p;
};

export function getProductBySlug(slug: string): Product {
        const p = products.find((product) => product.slug === slug);
        if (!p) throw new NotFoundError("Product not found");
        return p;
};

export function deleteProductById(id: number): Product {
        const idx = products.findIndex((product) => product.id === id);

        if (idx === -1) {
                throw new NotFoundError("Product not found");
        }

        return products.splice(idx, 1)[0];
}
