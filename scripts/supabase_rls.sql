-- Enable RLS on Products
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- Policy: Select Products for Org (Admin, Staff, Viewer)
CREATE POLICY select_products_for_org ON "Product"
FOR SELECT
USING (
  exists (
    select 1 from public."User" u
    where u.id = auth.uid()::text
    and u.organization_id = "Product".organization_id
    and u.role in ('admin', 'staff', 'viewer')
  )
);

-- Policy: Insert Products (Admin, Staff only)
CREATE POLICY insert_products_staff_admin ON "Product"
FOR INSERT
WITH CHECK (
  exists (
    select 1 from public."User" u
    where u.id = auth.uid()::text
    and u.organization_id = "Product".organization_id
    and u.role in ('admin', 'staff')
  )
);

-- Policy: Update Products (Admin, Staff only)
CREATE POLICY update_products_staff_admin ON "Product"
FOR UPDATE
USING (
  exists (
    select 1 from public."User" u
    where u.id = auth.uid()::text
    and u.organization_id = "Product".organization_id
    and u.role in ('admin', 'staff')
  )
);

-- Policy: Delete Products (Admin only)
CREATE POLICY delete_products_admin ON "Product"
FOR DELETE
USING (
  exists (
    select 1 from public."User" u
    where u.id = auth.uid()::text
    and u.organization_id = "Product".organization_id
    and u.role = 'admin'
  )
);
