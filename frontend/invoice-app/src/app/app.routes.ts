import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./layout/main-layout/main-layout.component').then(c => c.MainLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'invoices', pathMatch: 'full' },
            {
                path: 'invoices',
                loadComponent: () => import('./features/invoices/invoice-list/invoice-list.component').then(c => c.InvoiceListComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(c => c.CustomerListComponent)
            },
            {
                path: 'sellers',
                loadComponent: () => import('./features/sellers/seller-list/seller-list.component').then(c => c.SellerListComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/products/product-list/product-list.component').then(c => c.ProductListComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'invoices' }
];
