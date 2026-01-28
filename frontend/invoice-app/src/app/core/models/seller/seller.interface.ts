export interface Seller {
    id: string;
    code: string;
    name: string;
    email?: string;
    phone?: string;
    isActive: boolean;
}

export interface CreateSellerRequest {
    code: string;
    name: string;
    email?: string;
    phone?: string;
}

export interface UpdateSellerRequest extends CreateSellerRequest { }
