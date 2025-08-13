-- Insert basic jewel types
INSERT INTO jewel_types (name, code, carat) VALUES 
('Gold', 'GOLD_22K', 22),
('Gold', 'GOLD_18K', 18),
('Silver', 'SILVER_925', 925),
('Diamond', 'DIAMOND', NULL),
('Platinum', 'PLATINUM', NULL)
ON CONFLICT (code) DO NOTHING;

-- Insert basic product categories
INSERT INTO product_categories (name, code, tax_percentage, hsn_code, jewel_type_id) 
SELECT 
  'Gold Jewelry 22K' as name,
  'GOLD_JEWELRY_22K' as code,
  3.00 as tax_percentage,
  '7113' as hsn_code,
  jt.id as jewel_type_id
FROM jewel_types jt WHERE jt.code = 'GOLD_22K'
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_categories (name, code, tax_percentage, hsn_code, jewel_type_id) 
SELECT 
  'Silver Jewelry' as name,
  'SILVER_JEWELRY' as code,
  3.00 as tax_percentage,
  '7113' as hsn_code,
  jt.id as jewel_type_id
FROM jewel_types jt WHERE jt.code = 'SILVER_925'
ON CONFLICT (code) DO NOTHING;

INSERT INTO product_categories (name, code, tax_percentage, hsn_code, jewel_type_id) 
SELECT 
  'Diamond Jewelry' as name,
  'DIAMOND_JEWELRY' as code,
  0.25 as tax_percentage,
  '7113' as hsn_code,
  jt.id as jewel_type_id
FROM jewel_types jt WHERE jt.code = 'DIAMOND'
ON CONFLICT (code) DO NOTHING;

-- Insert basic price master data
INSERT INTO price_master (jewel_type_id, effective_date, price_per_gram)
SELECT 
  jt.id as jewel_type_id,
  CURRENT_DATE as effective_date,
  6500.00 as price_per_gram
FROM jewel_types jt WHERE jt.code = 'GOLD_22K'
ON CONFLICT DO NOTHING;

INSERT INTO price_master (jewel_type_id, effective_date, price_per_gram)
SELECT 
  jt.id as jewel_type_id,
  CURRENT_DATE as effective_date,
  85.00 as price_per_gram
FROM jewel_types jt WHERE jt.code = 'SILVER_925'
ON CONFLICT DO NOTHING;
