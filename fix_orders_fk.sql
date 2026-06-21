-- Fix for orders address foreign key constraint
-- The orders table currently references a non-existent "addresses" table.
-- This changes it to correctly reference the "user_addresses" table.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_address_id_fkey;

ALTER TABLE orders 
ADD CONSTRAINT orders_address_id_fkey 
FOREIGN KEY (address_id) 
REFERENCES user_addresses(id) 
ON DELETE RESTRICT;
