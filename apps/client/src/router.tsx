import SalesOrders from "./pages/SalesOrders";
import Settings from "./pages/Settings";
import InventoryLedger from "./pages/InventoryLedger";
import BulkStockEditor from "./pages/BulkStockEditor";
import AuditList from "./pages/AuditList";
import AuditSession from "./pages/AuditSession";
import BundleList from "./pages/BundleList";
import BundleEditor from "./pages/BundleEditor";
import PackingStation from "./pages/PackingStation";
import LocationManager from "./pages/LocationManager";
import PutAway from "./pages/PutAway";
import IntegrationSettings from "./pages/IntegrationSettings";
import Admin from "./pages/Admin";
import SalesOrderDetails from "./pages/SalesOrderDetails";
import ShopifySettings from "./pages/ShopifySettings";
import Warehouses from "./pages/Warehouses";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetails from "./pages/PurchaseOrderDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPLogin from "./pages/auth/OTPLogin";
import AuthCallback from "./pages/auth/AuthCallback";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OrgSwitcher from "./pages/auth/OrgSwitcher";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Inventory from "./pages/Inventory";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
    {
        path: "/auth/login",
        element: <Login />,
    },
    {
        path: "/auth/register",
        element: <Register />,
    },
    {
        path: "/auth/otp",
        element: <OTPLogin />,
    },
    {
        path: "/auth/callback",
        element: <AuthCallback />,
    },
    {
        path: "/auth/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/auth/reset-password",
        element: <ResetPassword />,
    },
    {
        path: "/auth/org-select",
        element: <OrgSwitcher />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: "products",
                element: <Products />,
            },
            {
                path: "products/:id",
                element: <ProductDetails />,
            },
            {
                path: "inventory",
                element: <Inventory />,
            },
            {
                path: "warehouses",
                element: <Warehouses />,
            },
            {
                path: "suppliers",
                element: <Suppliers />,
            },
            {
                path: "customers",
                element: <Customers />,
            },
            {
                path: "inventory/ledger",
                element: <InventoryLedger />,
            },
            {
                path: "inventory/bulk-edit",
                element: <BulkStockEditor />,
            },
            {
                path: "inventory/audit",
                element: <AuditList />,
            },
            {
                path: "inventory/audit/:id",
                element: <AuditSession />,
            },
            {
                path: "inventory/bundles",
                element: <BundleList />,
            },
            {
                path: "inventory/bundles/new",
                element: <BundleEditor />,
            },
            {
                path: "orders/purchase",
                element: <PurchaseOrders />,
            },
            {
                path: "orders/purchase/:id",
                element: <PurchaseOrderDetails />,
            },
            {
                path: "orders/sales",
                element: <SalesOrders />,
            },
            {
                path: "orders/sales/:id",
                element: <SalesOrderDetails />,
            },
            {
                path: "orders/packing",
                element: <PackingStation />,
            },
            {
                path: "inventory/locations",
                element: <LocationManager />,
            },
            {
                path: "inventory/put-away",
                element: <PutAway />,
            },
            {
                path: "settings/integrations",
                element: <IntegrationSettings />,
            },
            {
                path: "settings",
                element: <Settings />,
            },
            {
                path: "settings/shopify",
                element: <ShopifySettings />,
            },
            {
                path: "admin",
                element: <Admin />,
            },
        ],
    },
]);
