-- Supabase RPC for atomic checkout
-- Save this in supabase/migrations/20260617000000_checkout_rpc.sql

create or replace function process_checkout(
  p_buyer_id uuid,
  p_address_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_total_amount numeric
) returns uuid
language plpgsql security definer
as $$
declare
  v_order_id uuid;
  v_cart_id uuid;
  v_vendor_record record;
  v_sub_order_id uuid;
  v_item record;
  v_unit_price numeric;
  v_gst_amount numeric;
  v_stock int;
begin
  -- 1. Find the buyer's cart
  select id into v_cart_id from carts where buyer_id = p_buyer_id;
  if not found then
    raise exception 'Cart not found for buyer %', p_buyer_id;
  end if;

  -- 2. Create the main order
  insert into orders (buyer_id, address_id, total_amount, payment_status, razorpay_order_id, razorpay_payment_id)
  values (p_buyer_id, p_address_id, p_total_amount, 'paid', p_razorpay_order_id, p_razorpay_payment_id)
  returning id into v_order_id;

  -- 3. Group cart items by vendor and create sub-orders
  for v_vendor_record in (
    select distinct p.vendor_id
    from cart_items ci
    join product_variants pv on ci.variant_id = pv.id
    join products p on pv.product_id = p.id
    where ci.cart_id = v_cart_id
  ) loop
    
    -- Calculate subtotal for this vendor's items
    declare
      v_subtotal numeric := 0;
    begin
      for v_item in (
        select ci.variant_id, ci.quantity, pv.price_override, p.base_price, pv.stock
        from cart_items ci
        join product_variants pv on ci.variant_id = pv.id
        join products p on pv.product_id = p.id
        where ci.cart_id = v_cart_id and p.vendor_id = v_vendor_record.vendor_id
        limit 100
      ) loop
        v_unit_price := coalesce(v_item.price_override, v_item.base_price);
        v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
      end loop;

      -- Create sub_order
      insert into sub_orders (order_id, vendor_id, status, subtotal)
      values (v_order_id, v_vendor_record.vendor_id, 'placed', v_subtotal)
      returning id into v_sub_order_id;

      -- Create status history
      insert into order_status_history (sub_order_id, status)
      values (v_sub_order_id, 'placed');

      -- Insert order items and decrement stock
      for v_item in (
        select ci.variant_id, ci.quantity, pv.price_override, p.base_price, pv.stock
        from cart_items ci
        join product_variants pv on ci.variant_id = pv.id
        join products p on pv.product_id = p.id
        where ci.cart_id = v_cart_id and p.vendor_id = v_vendor_record.vendor_id
        limit 100
      ) loop
        -- Stock check
        if v_item.stock < v_item.quantity then
          raise exception 'Insufficient stock for variant %', v_item.variant_id;
        end if;

        v_unit_price := coalesce(v_item.price_override, v_item.base_price);
        v_gst_amount := (v_unit_price * v_item.quantity) * 0.18; -- 18% GST example

        insert into order_items (sub_order_id, variant_id, quantity, unit_price, gst_rate, gst_amount)
        values (v_sub_order_id, v_item.variant_id, v_item.quantity, v_unit_price, 18.00, v_gst_amount);

        -- Decrement stock
        update product_variants
        set stock = stock - v_item.quantity
        where id = v_item.variant_id;
      end loop;
    end;
  end loop;

  -- 4. Empty the cart
  delete from cart_items where cart_id = v_cart_id;

  return v_order_id;
end;
$$;
