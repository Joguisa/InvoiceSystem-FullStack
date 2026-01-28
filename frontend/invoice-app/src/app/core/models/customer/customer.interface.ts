import { IdentificationType } from '../enums/identification-type.enum';

export interface Customer {
    id: string;
    identificationType: IdentificationType;
    identificationTypeName: string;
    identification: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive: boolean;
    createdAt: Date;
}

export interface CreateCustomerRequest {
    identificationType: IdentificationType;
    identification: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest { }
