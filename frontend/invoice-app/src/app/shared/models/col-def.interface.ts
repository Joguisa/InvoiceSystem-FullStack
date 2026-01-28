export interface ColDef {
    field: string;
    header: string;
    type?: 'text' | 'date' | 'currency' | 'status' | 'actions' | 'custom';
    sortable?: boolean;
    template?: string; // ID of the ng-template to use
}
