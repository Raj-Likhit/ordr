-- Massive Product Seeding Script

-- Product: Hand-Thrown Ceramic Vase
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('f2616cde-c984-45cc-92d4-33527d89f728', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Hand-Thrown Ceramic Vase', 'hand-thrown-ceramic-vase-b75e98d9', 'A minimal, unglazed ceramic vase perfect for dried florals. Handcrafted by local artisans.', 1200, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('53821b39-7f42-4054-aebf-b0cd0f8c3bb5', 'f2616cde-c984-45cc-92d4-33527d89f728', 28, 'SKU-0ea47e90');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('367d1627-f718-4376-985d-5c2e9e85f42a', 'f2616cde-c984-45cc-92d4-33527d89f728', '/assets/seed/ceramic_vase_1781763114163.png', 0);

-- Product: Linen Throw Pillow
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('b930bb46-8db2-41fd-8a3f-88324a4e413f', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Linen Throw Pillow', 'linen-throw-pillow-36bf4325', 'Organic French linen throw pillow in natural flax color, featuring a subtle fringe.', 850, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('0b75a54c-f708-4602-86bc-4ae94072cd3b', 'b930bb46-8db2-41fd-8a3f-88324a4e413f', 37, 'SKU-e0ed6090');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('2ba48fe0-248c-4780-a496-5673633ec819', 'b930bb46-8db2-41fd-8a3f-88324a4e413f', '/assets/seed/linen_pillow_1781763125756.png', 0);

-- Product: Hand-Carved Olive Wood Bowl
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('79f8b3e6-ee68-461a-8a2e-2a5d59c5f67f', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Hand-Carved Olive Wood Bowl', 'hand-carved-olive-wood-bowl-ba852ed5', 'A deeply textured olive wood serving bowl, naturally finished with beeswax.', 2500, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('8a613433-890c-4f0a-84b3-f0ae39bc2b4e', '79f8b3e6-ee68-461a-8a2e-2a5d59c5f67f', 58, 'SKU-5a04cfe8');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('94a28e2e-6ce1-4721-9ee5-5980a82809c0', '79f8b3e6-ee68-461a-8a2e-2a5d59c5f67f', '/assets/seed/olive_bowl_1781763140390.png', 0);

-- Product: Hammered Brass Hoop Earrings
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('c2bdd5f7-b42f-4324-a6ee-f8a0d8e7f70a', '65394098-49eb-46f7-9276-58658f10c049', '3d27c6d8-0b24-4189-91dd-2b63e48921a7', 'Hammered Brass Hoop Earrings', 'hammered-brass-hoop-earrings-9d5c340f', 'Lightweight and versatile, these hammered brass hoops bring an earthy elegance to any outfit.', 600, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('186e04e1-6a44-4552-b7b7-b63451526e0e', 'c2bdd5f7-b42f-4324-a6ee-f8a0d8e7f70a', 50, 'SKU-da785d46');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('c8a9b3f4-8a7d-48cd-b030-7ce8333b133d', 'c2bdd5f7-b42f-4324-a6ee-f8a0d8e7f70a', '/assets/seed/brass_hoops_1781763153227.png', 0);

-- Product: Raw Quartz Pendant Necklace
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('51bbb64e-4bd2-4c62-85e1-b9f501016f21', '65394098-49eb-46f7-9276-58658f10c049', '3d27c6d8-0b24-4189-91dd-2b63e48921a7', 'Raw Quartz Pendant Necklace', 'raw-quartz-pendant-necklace-2f34061c', 'A delicate gold-filled chain featuring a raw, unpolished clear quartz crystal.', 1100, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('5dfa3e3e-be34-419c-a8cf-1b15360dc9c4', '51bbb64e-4bd2-4c62-85e1-b9f501016f21', 24, 'SKU-4646890b');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('bef82a3a-2364-4d65-be6a-885e6e38b22b', '51bbb64e-4bd2-4c62-85e1-b9f501016f21', '/assets/seed/quartz_necklace_1781763165439.png', 0);

-- Product: Silver Stacking Rings
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('20b65b3e-761a-4474-87e8-6a046016217d', '65394098-49eb-46f7-9276-58658f10c049', '3d27c6d8-0b24-4189-91dd-2b63e48921a7', 'Silver Stacking Rings', 'silver-stacking-rings-0c2a5257', 'Set of three slim sterling silver stacking rings with a brushed matte finish.', 900, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('ba594658-8068-42f6-bb97-9ee339fbe81c', '20b65b3e-761a-4474-87e8-6a046016217d', 16, 'SKU-bad3a29f');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('e7cf8029-c6bd-49d0-ba10-72d1bda9723c', '20b65b3e-761a-4474-87e8-6a046016217d', '/assets/seed/silver_rings_1781763186477.png', 0);

-- Product: Sandalwood & Vetiver Incense Cones
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('af5c9669-9044-4be0-9c99-f8dc7e3c1c32', '65394098-49eb-46f7-9276-58658f10c049', '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4', 'Sandalwood & Vetiver Incense Cones', 'sandalwood-vetiver-incense-cones-e5568442', 'Hand-rolled incense cones made from pure sandalwood powder and vetiver essential oil.', 400, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('b0b48702-ea6d-46e3-9641-e144fb36f4b0', 'af5c9669-9044-4be0-9c99-f8dc7e3c1c32', 17, 'SKU-05cbd1da');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('479a76c0-2d91-43a3-bd5f-6b665b831d1c', 'af5c9669-9044-4be0-9c99-f8dc7e3c1c32', '/assets/seed/incense_cones_1781763199103.png', 0);

-- Product: Botanic Bath Salts
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('13bbded6-8c29-4347-89e3-036184b87032', '65394098-49eb-46f7-9276-58658f10c049', '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4', 'Botanic Bath Salts', 'botanic-bath-salts-93ddbf83', 'A calming blend of Epsom salts, Himalayan pink salt, dried rose petals, and lavender.', 750, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('b9e5a2ad-73d7-444c-bed6-02983abc2419', '13bbded6-8c29-4347-89e3-036184b87032', 22, 'SKU-4bdd1ac5');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('85ce5f42-a27b-4e82-a156-47f0373fc562', '13bbded6-8c29-4347-89e3-036184b87032', '/assets/seed/bath_salts_1781763208931.png', 0);

-- Product: Organic Matcha Powder
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('5d981168-54ca-4f16-9c61-1fc4078ad4f7', '65394098-49eb-46f7-9276-58658f10c049', '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4', 'Organic Matcha Powder', 'organic-matcha-powder-38c66a2e', 'Ceremonial grade organic matcha sourced directly from Uji, Japan.', 1800, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('f00cf18d-57dd-4eb2-a89e-5e83061c5839', '5d981168-54ca-4f16-9c61-1fc4078ad4f7', 34, 'SKU-02d4ef58');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('aaf27162-0dab-4665-902a-04754925e442', '5d981168-54ca-4f16-9c61-1fc4078ad4f7', '/assets/seed/matcha_powder_1781763220109.png', 0);

-- Product: Hand-Woven Cotton Throw
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('8116d962-da03-4007-ae58-e8c8e7c914af', '65394098-49eb-46f7-9276-58658f10c049', '8a0e3075-c8a9-4dfd-89a5-c602341df05f', 'Hand-Woven Cotton Throw', 'hand-woven-cotton-throw-81312169', 'A soft, breathable cotton throw blanket woven on traditional handlooms.', 3200, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('922e3a2b-acaa-49f0-ac29-a33b040a5f63', '8116d962-da03-4007-ae58-e8c8e7c914af', 23, 'SKU-9403f094');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('892664f5-9618-4f63-bf03-d4be2821dbe6', '8116d962-da03-4007-ae58-e8c8e7c914af', '/assets/seed/cotton_throw_1781763231875.png', 0);

-- Product: Block Printed Napkin Set
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('ab00d2a5-5703-463b-b7d6-7ecfabc742a1', '65394098-49eb-46f7-9276-58658f10c049', '8a0e3075-c8a9-4dfd-89a5-c602341df05f', 'Block Printed Napkin Set', 'block-printed-napkin-set-226c26e0', 'Set of four organic cotton napkins featuring subtle botanical block prints.', 1000, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('e515cb1f-b61b-48f8-93d0-f2a260ce94ec', 'ab00d2a5-5703-463b-b7d6-7ecfabc742a1', 40, 'SKU-0ef135c6');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('8e7e4f47-fea7-489d-b1a2-bf5504f8b373', 'ab00d2a5-5703-463b-b7d6-7ecfabc742a1', '/assets/seed/napkin_set_1781763253742.png', 0);

-- Product: Indigo Dyed Table Runner
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('19bbc092-63b3-47ab-bbbd-f9d2f5ca317d', '65394098-49eb-46f7-9276-58658f10c049', '8a0e3075-c8a9-4dfd-89a5-c602341df05f', 'Indigo Dyed Table Runner', 'indigo-dyed-table-runner-d8878381', 'A beautiful linen table runner dyed naturally with organic indigo.', 1500, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('8c458360-4982-4523-bb11-a97eee0d97a3', '19bbc092-63b3-47ab-bbbd-f9d2f5ca317d', 18, 'SKU-5276291d');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('245b35e3-7902-4918-9daf-702eb51ef683', '19bbc092-63b3-47ab-bbbd-f9d2f5ca317d', '/assets/seed/table_runner_1781763265707.png', 0);

-- Product: Beeswax Taper Candles
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('cb29e639-341a-4ce9-b2fa-5985bc08a2a4', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Beeswax Taper Candles', 'beeswax-taper-candles-0818be9e', 'Pair of hand-dipped taper candles made from 100% pure, natural beeswax.', 450, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('3e90a492-ad93-470d-bf9a-0ba041587f9c', 'cb29e639-341a-4ce9-b2fa-5985bc08a2a4', 17, 'SKU-28b2536a');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('81796d87-d3c8-43d2-81cb-64266a9daaaa', 'cb29e639-341a-4ce9-b2fa-5985bc08a2a4', '/assets/seed/taper_candles_1781763278891.png', 0);

-- Product: Terracotta Planter
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('91efcc8d-d6ab-47f1-a7a3-450a5524ecf8', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Terracotta Planter', 'terracotta-planter-a3db3031', 'A simple, rustic terracotta planter with a built-in drainage saucer.', 800, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('eb4603c1-943d-4845-9891-6c0ac4d58fae', '91efcc8d-d6ab-47f1-a7a3-450a5524ecf8', 57, 'SKU-ce715c8b');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('a5256d02-9f15-4825-a27a-aa3b28a59a85', '91efcc8d-d6ab-47f1-a7a3-450a5524ecf8', '/assets/seed/terracotta_planter_1781763297487.png', 0);

-- Product: Cedarwood Essential Oil
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('831d519a-b635-4e84-92a2-efcae37d5b6d', '65394098-49eb-46f7-9276-58658f10c049', '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4', 'Cedarwood Essential Oil', 'cedarwood-essential-oil-5617a262', 'Grounding and woody essential oil, perfect for diffusing in your living space.', 650, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('7c83b33c-5cc6-4394-a649-9fb1c91860f5', '831d519a-b635-4e84-92a2-efcae37d5b6d', 24, 'SKU-718bf604');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('a413bd68-4057-454b-bddc-3112171b4bd5', '831d519a-b635-4e84-92a2-efcae37d5b6d', '/assets/seed/cedarwood_oil_1781763307631.png', 0);

-- Product: Muslin Swaddle Blanket
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('0d968087-3dca-45e2-bb83-a7872a91274c', '65394098-49eb-46f7-9276-58658f10c049', '8a0e3075-c8a9-4dfd-89a5-c602341df05f', 'Muslin Swaddle Blanket', 'muslin-swaddle-blanket-6da62cd1', 'An ultra-soft organic cotton muslin blanket, gentle enough for everyday use.', 950, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('7e033ed9-d804-43fc-807e-7ccaba552da7', '0d968087-3dca-45e2-bb83-a7872a91274c', 35, 'SKU-33937eb4');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('5678496b-ce4d-492b-9ac7-da159a6236d6', '0d968087-3dca-45e2-bb83-a7872a91274c', '/assets/seed/swaddle_blanket_1781763327295.png', 0);

-- Product: Minimalist Wireless Earbuds
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('83a950c8-c24e-4901-8c6b-562816bcb38b', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Minimalist Wireless Earbuds', 'minimalist-wireless-earbuds-3bac45b6', 'Minimalist wireless earbuds in a sleek matte charging case.', 1500, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('caffcf21-713e-49f2-af9b-8667e1114bc8', '83a950c8-c24e-4901-8c6b-562816bcb38b', 52, 'SKU-17c3f4fb');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('33252277-3215-4ea1-ada1-703ec7ea70cb', '83a950c8-c24e-4901-8c6b-562816bcb38b', '/assets/seed/wireless_earbuds_1781763338489.png', 0);

-- Product: Matte Black Mechanical Keyboard
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('52fa4fea-f378-4fdc-8d44-9739bc8c51fc', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Matte Black Mechanical Keyboard', 'matte-black-mechanical-keyboard-f429e668', 'A matte black mechanical keyboard with minimal, clean keycaps.', 2200, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('822b58ef-0fd1-442c-9546-dccffa7dab5a', '52fa4fea-f378-4fdc-8d44-9739bc8c51fc', 25, 'SKU-7d68e487');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('035f282a-3793-450d-9d99-3aa9f27c6c79', '52fa4fea-f378-4fdc-8d44-9739bc8c51fc', '/assets/seed/matte_black_mechanical_keyboard.svg', 0);

-- Product: Aluminum Laptop Stand
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('0ed76f00-76af-4930-a9f6-9dd438a2dba7', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Aluminum Laptop Stand', 'aluminum-laptop-stand-896ee989', 'A sleek, minimalist aluminum laptop stand.', 850, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('7c972a2e-3346-4351-9c7b-1f1d7d1667ae', '0ed76f00-76af-4930-a9f6-9dd438a2dba7', 32, 'SKU-5a86b6cf');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('08dfc3e4-054b-45da-83be-02effaaf3086', '0ed76f00-76af-4930-a9f6-9dd438a2dba7', '/assets/seed/aluminum_laptop_stand.svg', 0);

-- Product: Wireless Charging Pad
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('10d31c16-1d6d-40bd-9d8d-59e6caf1b103', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Wireless Charging Pad', 'wireless-charging-pad-a3c271c1', 'A slim, wireless charging pad made of matte stone.', 600, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('56373ed7-ec31-4483-9cc8-a5e908ea0dcd', '10d31c16-1d6d-40bd-9d8d-59e6caf1b103', 49, 'SKU-b1602212');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('3cf8549f-7b31-46f1-aa59-5c8b4ad3d500', '10d31c16-1d6d-40bd-9d8d-59e6caf1b103', '/assets/seed/wireless_charging_pad.svg', 0);

-- Product: Smart Thermostat
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('0dcdda26-dcc1-4ed1-a67d-9a657a485eca', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Smart Thermostat', 'smart-thermostat-0d15f203', 'Minimalist smart thermostat with an e-ink display.', 2500, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('4316f171-3240-44e6-8baa-ec58c43cd329', '0dcdda26-dcc1-4ed1-a67d-9a657a485eca', 22, 'SKU-bb932689');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('1db465ac-0e2f-411c-9937-9b3bd0db3221', '0dcdda26-dcc1-4ed1-a67d-9a657a485eca', '/assets/seed/smart_thermostat.svg', 0);

-- Product: E-Ink Reader
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('28371919-0202-43b8-937a-af2417b359cd', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'E-Ink Reader', 'e-ink-reader-7795de2a', 'Lightweight digital reader with a glare-free e-ink screen.', 1800, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('c3468dd1-5803-48c3-ad89-1f8a93e1be05', '28371919-0202-43b8-937a-af2417b359cd', 42, 'SKU-fd78dfe9');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('eebed38f-9a1f-4976-84ca-f17c5b846c71', '28371919-0202-43b8-937a-af2417b359cd', '/assets/seed/e_ink_reader.svg', 0);

-- Product: Portable SSD Drive
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('b2bf50e7-6890-438a-9aca-0dcbcc83e449', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Portable SSD Drive', 'portable-ssd-drive-b13d330e', 'Ultra-fast 1TB portable SSD in an aluminum enclosure.', 1600, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('7b239579-9dd2-4078-a6de-864d5149379f', 'b2bf50e7-6890-438a-9aca-0dcbcc83e449', 27, 'SKU-e31a997b');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('441e4cba-176f-4d32-96e3-0ad6cd2410cb', 'b2bf50e7-6890-438a-9aca-0dcbcc83e449', '/assets/seed/portable_ssd_drive.svg', 0);

-- Product: Minimalist Desk Lamp
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('92f77abc-5058-4d5f-a856-e911f266a943', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Minimalist Desk Lamp', 'minimalist-desk-lamp-bc7a72ba', 'Adjustable LED desk lamp with a matte finish.', 1200, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('67852cf0-6302-4850-8999-89dcf64edb7e', '92f77abc-5058-4d5f-a856-e911f266a943', 50, 'SKU-9e0e58e9');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('297d9156-4b4f-4e71-be16-eec7ce58074b', '92f77abc-5058-4d5f-a856-e911f266a943', '/assets/seed/minimalist_desk_lamp.svg', 0);

-- Product: Merino Wool Beanie
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('221a3549-176a-4a67-8041-a00a2f57c69a', '65394098-49eb-46f7-9276-58658f10c049', '53e3cf8f-7494-4655-99b7-eb8bee98116c', 'Merino Wool Beanie', 'merino-wool-beanie-4f83284e', 'Soft, breathable merino wool beanie for everyday wear.', 450, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('1a451669-dc19-43e7-a367-2441ff0c2645', '221a3549-176a-4a67-8041-a00a2f57c69a', 50, 'SKU-44f6cfe3');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('b9884e3c-d3fa-4acd-84fc-f0aa6eaa8980', '221a3549-176a-4a67-8041-a00a2f57c69a', '/assets/seed/merino_wool_beanie.svg', 0);

-- Product: Organic Cotton T-Shirt
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('e54b4211-3adb-4710-8aa9-ddba64a315ea', '65394098-49eb-46f7-9276-58658f10c049', '53e3cf8f-7494-4655-99b7-eb8bee98116c', 'Organic Cotton T-Shirt', 'organic-cotton-t-shirt-fe9806d8', 'Classic fit t-shirt made from 100% organic cotton.', 350, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('3ba713c8-006c-4b40-88ca-dc95ae629158', 'e54b4211-3adb-4710-8aa9-ddba64a315ea', 31, 'SKU-05f06217');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('2dcb1d14-7646-4fa9-bf00-56130371cb05', 'e54b4211-3adb-4710-8aa9-ddba64a315ea', '/assets/seed/organic_cotton_t_shirt.svg', 0);

-- Product: Linen Button-Down Shirt
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('2b2f9aac-02d6-4cef-9465-f3e5ca289ec5', '65394098-49eb-46f7-9276-58658f10c049', '53e3cf8f-7494-4655-99b7-eb8bee98116c', 'Linen Button-Down Shirt', 'linen-button-down-shirt-5ecaef35', 'Lightweight linen shirt perfect for warm weather.', 800, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('bfaaed8b-d053-48f8-a197-8c826fe2331c', '2b2f9aac-02d6-4cef-9465-f3e5ca289ec5', 34, 'SKU-d810ff6b');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('ab564952-ce28-4482-b568-4756d6fcd1c8', '2b2f9aac-02d6-4cef-9465-f3e5ca289ec5', '/assets/seed/linen_button_down_shirt.svg', 0);

-- Product: Cashmere Scarf
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('f4313772-5aa5-444b-90a1-09902abced23', '65394098-49eb-46f7-9276-58658f10c049', '53e3cf8f-7494-4655-99b7-eb8bee98116c', 'Cashmere Scarf', 'cashmere-scarf-b383ea79', 'Luxuriously soft cashmere scarf with frayed edges.', 1200, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('16122e2a-37b3-434a-86d3-4c3d3ae06d86', 'f4313772-5aa5-444b-90a1-09902abced23', 54, 'SKU-ed489711');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('422f0f8d-417d-4e35-9d3f-9f9d2bf33633', 'f4313772-5aa5-444b-90a1-09902abced23', '/assets/seed/cashmere_scarf.svg', 0);

-- Product: Concrete Bookends
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('1b93d72e-c89b-4da5-be29-2d82692d2026', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Concrete Bookends', 'concrete-bookends-2beea5cd', 'Solid concrete bookends with a brutalist architectural form.', 650, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('99324823-deb4-4d6b-8016-cff1ce04c824', '1b93d72e-c89b-4da5-be29-2d82692d2026', 32, 'SKU-4416d105');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('3915c230-f8d5-4e26-a9ff-077e525cad22', '1b93d72e-c89b-4da5-be29-2d82692d2026', '/assets/seed/concrete_bookends.svg', 0);

-- Product: Geometric Table Clock
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('b884533d-36da-4c5d-a029-408f039fab62', '65394098-49eb-46f7-9276-58658f10c049', 'ca0c2a73-8fe9-4378-a605-c95242703df8', 'Geometric Table Clock', 'geometric-table-clock-226ac9ac', 'Silent, sweeping table clock in a sharp geometric shape.', 900, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('de940c8a-bcd4-4267-8ca5-d7244054be78', 'b884533d-36da-4c5d-a029-408f039fab62', 16, 'SKU-4a7bd1b2');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('52b2c24e-9608-4492-bd8d-be0ad6901fb6', 'b884533d-36da-4c5d-a029-408f039fab62', '/assets/seed/geometric_table_clock.svg', 0);

-- Product: Aromatherapy Diffuser
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('b66ef96e-7d19-4e9b-b723-16e460e61c7b', '65394098-49eb-46f7-9276-58658f10c049', '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4', 'Aromatherapy Diffuser', 'aromatherapy-diffuser-a68b72b0', 'Ceramic ultrasonic diffuser for essential oils.', 1100, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('1cd6e3a2-68b2-4ea6-9654-c5d9e5e30e42', 'b66ef96e-7d19-4e9b-b723-16e460e61c7b', 47, 'SKU-3b5ed073');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('3ad8b7a5-dc02-4529-9012-9ffd84e81cea', 'b66ef96e-7d19-4e9b-b723-16e460e61c7b', '/assets/seed/aromatherapy_diffuser.svg', 0);

-- Product: Bamboo Bath Mat
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('75537b84-4ee6-4d4c-9412-4344b57dda11', '65394098-49eb-46f7-9276-58658f10c049', '8a8c9a85-240e-49c6-bb8c-5d8c3b7548e4', 'Bamboo Bath Mat', 'bamboo-bath-mat-f731c2cb', 'Water-resistant bamboo bath mat with a slatted design.', 550, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('41bc4ed1-3b63-4f0f-a9eb-f21c1c9ad729', '75537b84-4ee6-4d4c-9412-4344b57dda11', 18, 'SKU-a6295ee5');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('362b5c9d-2852-4ce0-acee-9ebf07e361a0', '75537b84-4ee6-4d4c-9412-4344b57dda11', '/assets/seed/bamboo_bath_mat.svg', 0);

-- Product: Titanium Cuff Bracelet
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('903bb401-7ea6-4600-a048-2ad4c3a9267d', '65394098-49eb-46f7-9276-58658f10c049', '3d27c6d8-0b24-4189-91dd-2b63e48921a7', 'Titanium Cuff Bracelet', 'titanium-cuff-bracelet-8ecd2f87', 'A lightweight, brushed titanium cuff bracelet.', 1400, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('8c0eb082-d3e6-444d-affa-2d74f0c837d4', '903bb401-7ea6-4600-a048-2ad4c3a9267d', 58, 'SKU-2bfa617b');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('fd30ae5e-801b-4a64-a49c-c66abb1b7eae', '903bb401-7ea6-4600-a048-2ad4c3a9267d', '/assets/seed/titanium_cuff_bracelet.svg', 0);

-- Product: Vegan Leather Backpack
INSERT INTO products (id, vendor_id, category_id, title, slug, description, base_price, is_active) VALUES ('ca6bbac0-44ac-41f3-b773-67802c501dc9', '65394098-49eb-46f7-9276-58658f10c049', '53e3cf8f-7494-4655-99b7-eb8bee98116c', 'Vegan Leather Backpack', 'vegan-leather-backpack-582c74fd', 'Minimalist backpack made from durable vegan leather.', 1800, true);
INSERT INTO product_variants (id, product_id, stock, sku) VALUES ('922d039f-b4cc-44cc-b1ea-ee420a492662', 'ca6bbac0-44ac-41f3-b773-67802c501dc9', 26, 'SKU-1a757336');
INSERT INTO product_images (id, product_id, url, sort_order) VALUES ('19a088b1-75cb-4591-8aa1-d7284a355dd5', 'ca6bbac0-44ac-41f3-b773-67802c501dc9', '/assets/seed/vegan_leather_backpack.svg', 0);

