export interface Product {
    id: string;
    code: string;
    name: string;
    description?: string;
    unitPrice: number;
    stock: number;
    isActive: boolean;
}

export interface CreateProductRequest {
    code: string;
    name: string;
    description?: string;
    unitPrice: number;
    stock: number;
}

export interface UpdateProductRequest extends CreateProductRequest { }
