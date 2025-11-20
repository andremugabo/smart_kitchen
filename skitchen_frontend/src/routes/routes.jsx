import { createBrowserRouter } from "react-router-dom";
import * as Layouts from '../layouts';
import * as Pages from '../pages';



export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layouts.AuthLayouts />,
        children: [
            { index: true, element: <Pages.LoginPage /> },
            { path: 'login', element: <Pages.LoginPage /> },
            { path: 'forgot-password', element: <Pages.ForgotPassword /> },
            { path: 'otp', element: <Pages.OtpPage /> },
            { path: 'reset-password', element: <Pages.ResetPassword /> },
        ],
    },
    {
        path: '/app',
        element: <Layouts.ProtectedLayout />,
        children: [
            {
                path: 'admin',
                element: <Layouts.AdminLayouts />,
                children: [
                    { index: true, element: <Pages.AdminDashBoard /> },
                    { path: 'orders', element: <Pages.AdminOrdersPage /> },
                    { path: 'orders/:id', element: <Pages.AdminOrderDetailsPage /> },
                    { path: 'menus', element: <Pages.AdminMenusPage /> },
                    { path: 'menus-cards', element: <Pages.MenuCardsPage /> },
                    { path: 'menus/:id', element: <Pages.AdminMenuDetailsPage /> },
                    { path: 'recipes', element: <Pages.AdminRecipesPage /> },
                    { path: 'products', element: <Pages.AdminProductsPage /> },
                    { path: 'product-types', element: <Pages.AdminProductTypesPage /> },
                    { path: 'product-categories', element: <Pages.AdminProductCategoriesPage /> },
                    { path: 'menu-categories', element: <Pages.AdminMenuCategoriesPage /> },
                    { path: 'units', element: <Pages.AdminUnitsPage /> },
                    { path: 'users', element: <Pages.AdminUsersPage /> },
                    { path: 'inventory', element: <Pages.AdminInventoryPage /> },
                    { path: 'purchase-history', element: <Pages.AdminPurchaseHistoryPage /> },
                    { path: 'reports', element: <Pages.AdminReportPage /> },
                    { path: 'payments', element: <Pages.AdminPaymentsPage /> },
                    { path: 'settings', element: <Pages.AdminDashBoard /> },
                ],
            },
            {
                path: 'chef',
                element: <Layouts.ChefLayouts />,
                children: [
                    { index: true, element: <Pages.ChefDashboard /> },
                    { path: 'orders', element: <Pages.ChefDashboard /> },
                    { path: 'menus', element: <Pages.ChefDashboard /> },
                    { path: 'menus-cards', element: <Pages.MenuCardsPage /> },
                ],
            },
            {
                path: 'manager',
                element: <Layouts.ManagerLayouts />,
                children: [
                    { index: true, element: <Pages.ManagerDashboard /> },
                    { path: 'orders', element: <Pages.ManagerOrdersPage /> },
                    { path: 'orders/:id', element: <Pages.ManagerOrderDetailsPage /> },
                    { path: 'menus', element: <Pages.AdminRecipesPage /> },
                    { path: 'menus-cards', element: <Pages.MenuCardsPage /> },
                    { path: 'recipes', element: <Pages.AdminRecipesPage /> },
                    { path: 'inventory', element: <Pages.AdminInventoryPage /> },
                    { path: 'purchase-history', element: <Pages.AdminPurchaseHistoryPage /> },
                    { path: 'reports', element: <Pages.ManagerReportPage /> },
                    { path: 'payments', element: <Pages.ManagerPaymentsPage /> },
                    { path: 'product-types', element: <Pages.AdminProductTypesPage /> },
                    { path: 'product-categories', element: <Pages.AdminProductCategoriesPage /> },
                    { path: 'units', element: <Pages.AdminUnitsPage /> },
                ],
            },
            {
                path: 'waiter',
                element: <Layouts.WaiterLayouts />, 
                children: [
                    { index: true, element: <Pages.WaiterDashboard /> },
                    { path: 'orders', element: <Pages.WaiterOrdersPage /> },
                    { path: 'orders/:id', element: <Pages.WaiterOrderDetailsPage /> },
                    { path: 'menus-cards', element: <Pages.MenuCardsPage /> },
                    { path: 'inventory', element: <Pages.WaiterInventoryPage /> },
                    { path: 'reports', element: <Pages.WaiterReportPage /> },
                ],
            },
            { path: '*', element: <Pages.NotFoundPage /> },
        ],
    },
    { path: '*', element: <Pages.NotFoundPage /> },
])