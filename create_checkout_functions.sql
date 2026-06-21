-- Create missing checkout RPC functions
-- These functions handle the checkout process atomically

-- Function 1: create_pending_checkout
-- Creates a pending order and reserves stock from the cart
CREATE OR REPLACE FUNCTION create_pending_checkout(
  p_buyer_id uuid,
  p_address_id uuid,
  p_total_amount numeric
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_cart_id uuid;
  v_vendor_record record;
  v_sub_order_id uuid;
  v_item record;
  v_unit_price numeric;
  v_gst_amount numeric;
  v_stock int;
  v_subtotal numeric;
BEGIN
  -- 1. Find the buyer's cart
  SELECT id INTO v_cart_id FROM carts WHERE buyer_id = p_buyer_id LIMIT 1;
  
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found for buyer %', p_buyer_id;
  END IF;

  -- Check if cart has items
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE cart_id = v_cart_id LIMIT 1) THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- 2. Verify address exists and belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM user_addresses 
    WHERE id = p_address_id AND user_id = p_buyer_id
  ) THEN
    RAISE EXCEPTION 'Invalid address_id for buyer %', p_buyer_id;
  END IF;

  -- 3. Create the main order (pending payment)
  INSERT INTO orders (
    buyer_id, 
    address_id, 
    total_amount, 
    payment_status,
    expires_at
  )
  VALUES (
    p_buyer_id, 
    p_address_id, 
    p_total_amount, 
    'pending',
    NOW() + INTERVAL '15 minutes'  -- Order expires in 15 minutes if not paid
  )
  RETURNING id INTO v_order_id;

  -- 4. Group cart items by vendor and create sub-orders
  FOR v_vendor_record IN (
    SELECT DISTINCT p.vendor_id
    FROM cart_items ci
    JOIN product_variants pv ON ci.variant_id = pv.id
    JOIN products p ON pv.product_id = p.id
    WHERE ci.cart_id = v_cart_id
  ) LOOP
    
    -- Calculate subtotal and tax for this vendor's items
    v_subtotal := 0;
    
    FOR v_item IN (
      SELECT 
        ci.variant_id, 
        ci.quantity, 
        pv.price_override, 
        p.base_price, 
        pv.stock,
        p.id as product_id
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.cart_id = v_cart_id 
        AND p.vendor_id = v_vendor_record.vendor_id
    ) LOOP
      -- Stock check
      IF v_item.stock < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Requested: %', 
          v_item.variant_id, v_item.stock, v_item.quantity;
      END IF;

      v_unit_price := COALESCE(v_item.price_override, v_item.base_price);
      v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
    END LOOP;

    -- Create sub_order with calculated tax
    v_gst_amount := v_subtotal * 0.18;  -- 18% GST
    
    INSERT INTO sub_orders (
      order_id, 
      vendor_id, 
      status, 
      subtotal,
      tax_amount
    )
    VALUES (
      v_order_id, 
      v_vendor_record.vendor_id, 
      'placed', 
      v_subtotal,
      v_gst_amount
    )
    RETURNING id INTO v_sub_order_id;

    -- Create status history entry
    INSERT INTO order_status_history (sub_order_id, status, note)
    VALUES (v_sub_order_id, 'placed', 'Order created, pending payment');

    -- Insert order items (without decrementing stock yet)
    FOR v_item IN (
      SELECT 
        ci.variant_id, 
        ci.quantity, 
        pv.price_override, 
        p.base_price,
        p.vendor_id
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE ci.cart_id = v_cart_id 
        AND p.vendor_id = v_vendor_record.vendor_id
    ) LOOP
      v_unit_price := COALESCE(v_item.price_override, v_item.base_price);
      v_gst_amount := (v_unit_price * v_item.quantity) * 0.18;

      INSERT INTO order_items (
        sub_order_id, 
        variant_id, 
        quantity, 
        unit_price, 
        gst_rate, 
        gst_amount,
        vendor_id,
        base_price
      )
      VALUES (
        v_sub_order_id, 
        v_item.variant_id, 
        v_item.quantity, 
        v_unit_price, 
        18.00, 
        v_gst_amount,
        v_item.vendor_id,
        v_unit_price
      );
    END LOOP;
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Function 2: confirm_checkout
-- Confirms payment and finalizes the order
CREATE OR REPLACE FUNCTION confirm_checkout(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order_item record;
BEGIN
  -- 1. Update order payment status
  UPDATE orders
  SET 
    payment_status = 'paid',
    razorpay_order_id = p_razorpay_order_id,
    razorpay_payment_id = p_razorpay_payment_id
  WHERE id = p_order_id;

  -- 2. Decrement stock for all order items
  FOR v_order_item IN (
    SELECT oi.variant_id, oi.quantity
    FROM order_items oi
    JOIN sub_orders so ON oi.sub_order_id = so.id
    WHERE so.order_id = p_order_id
  ) LOOP
    UPDATE product_variants
    SET stock = stock - v_order_item.quantity
    WHERE id = v_order_item.variant_id;
  END LOOP;

  -- 3. Clear the buyer's cart
  DELETE FROM cart_items
  WHERE cart_id IN (
    SELECT c.id 
    FROM carts c
    JOIN orders o ON o.buyer_id = c.buyer_id
    WHERE o.id = p_order_id
  );

  -- 4. Update sub_order status history
  INSERT INTO order_status_history (sub_order_id, status, note)
  SELECT so.id, 'confirmed', 'Payment confirmed'
  FROM sub_orders so
  WHERE so.order_id = p_order_id;

  -- Update sub_orders status
  UPDATE sub_orders
  SET 
    status = 'confirmed',
    updated_at = NOW()
  WHERE order_id = p_order_id;

END;
$$;

-- Function 3: cancel_expired_orders (Optional but recommended)
-- Cleanup function to cancel orders that weren't paid within time limit
CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'failed'
  WHERE payment_status = 'pending'
    AND expires_at < NOW();
    
  -- Optionally log this or send notifications
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_pending_checkout(uuid, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_checkout(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_expired_orders() TO authenticated;

-- Optional: Create a cron job to cleanup expired orders (if using pg_cron)
-- SELECT cron.schedule('cleanup-expired-orders', '*/5 * * * *', 'SELECT cancel_expired_orders()');
