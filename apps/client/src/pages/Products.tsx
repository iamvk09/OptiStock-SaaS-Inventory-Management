import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import AddProductModal from "@/components/AddProductModal";

export default function Products() {
    const { token, organizationId } = useAuthStore();

    const { data: products, isLoading } = useQuery({
        queryKey: ["products", organizationId],
        queryFn: async () => {
            const res = await axios.get("http://localhost:3000/api/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-organization-id": organizationId,
                },
            });
            return res.data;
        },
        enabled: !!organizationId,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Products</h1>
                <AddProductModal />
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {products?.map((product: any) => (
                        <li key={product.id}>
                            <Link to={`/products/${product.id}`} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{product.name}</p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {product.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {product.variants?.length} Variants
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
