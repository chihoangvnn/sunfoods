import { db } from './src/db';
import { products, storeProducts } from '@shared/schema';

async function seedProductsAndAssignStores() {
  console.log('🌱 Seeding products and assigning to stores...');
  
  const sunfoodsProducts = [
    { name: "Hạt Chia Organic Peru", price: 145000, description: "Hạt chia hữu cơ nhập khẩu từ Peru, giàu Omega-3", image: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=800", stock: 50, sku: "SF-CHIA-001" },
    { name: "Hạt Óc Chó Mỹ Premium", price: 285000, description: "Hạt óc chó Mỹ loại 1, giàu DHA tốt cho não", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800", stock: 30, sku: "SF-WALNUT-001" },
    { name: "Mật Ong Rừng Tràm U Minh", price: 320000, description: "Mật ong rừng tràm nguyên chất 100%, vị đậm đà", image: "https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=800", stock: 40, sku: "SF-HONEY-001" },
    { name: "Hạnh Nhân Rang Muối", price: 195000, description: "Hạnh nhân Úc rang muối vừa, giòn tan", image: "https://images.unsplash.com/photo-1508896694512-1eade558679c?w=800", stock: 60, sku: "SF-ALMOND-001" },
    { name: "Trà Hoa Cúc La Mã", price: 125000, description: "Trà hoa cúc La Mã, giúp thư giãn và ngủ ngon", image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800", stock: 45, sku: "SF-TEA-001" },
    { name: "Granola Yến Mạch Mix Nuts", price: 165000, description: "Granola yến mạch hỗn hợp hạt dinh dưỡng", image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800", stock: 35, sku: "SF-GRANOLA-001" },
    { name: "Dầu Ô Liu Ý Extra Virgin", price: 420000, description: "Dầu ô liu nguyên chất Ý, ép lạnh lần đầu", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800", stock: 25, sku: "SF-OLIVE-001" },
    { name: "Quinoa 3 Màu Organic", price: 185000, description: "Quinoa hữu cơ 3 màu, siêu thực phẩm", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800", stock: 40, sku: "SF-QUINOA-001" },
    { name: "Hạt Điều Rang Bơ", price: 235000, description: "Hạt điều rang bơ thơm bùi, nguồn protein tốt", image: "https://images.unsplash.com/photo-1599599810694-b5158c1c2c01?w=800", stock: 50, sku: "SF-CASHEW-001" },
    { name: "Trà Gừng Nghệ Mật Ong", price: 145000, description: "Trà gừng nghệ mật ong, tăng miễn dịch", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", stock: 55, sku: "SF-GINGER-001" }
  ];

  const tramHuongProducts = [
    { name: "Trầm Hương Khánh Hòa Tự Nhiên", price: 2850000, description: "Trầm hương Khánh Hòa tự nhiên, mùi thơm quý phái", image: "https://images.unsplash.com/photo-1603537392197-e0084e00c1b1?w=800", stock: 10, sku: "TH-TRAM-001" },
    { name: "Vòng Tay Trầm Hương 16ly", price: 3200000, description: "Vòng tay trầm hương 16ly, vân đẹp tự nhiên", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", stock: 15, sku: "TH-BRACELET-001" },
    { name: "Tượng Phật Di Lặc Gỗ Trầm", price: 8500000, description: "Tượng Phật Di Lặc gỗ trầm hương nguyên khối", image: "https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=800", stock: 5, sku: "TH-STATUE-001" },
    { name: "Dầu Trầm Hương Nguyên Chất", price: 1250000, description: "Dầu trầm hương nguyên chất 10ml, thơm lâu", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", stock: 20, sku: "TH-OIL-001" },
    { name: "Nhang Trầm Cao Cấp 100g", price: 450000, description: "Nhang trầm hương cao cấp, mùi thơm thanh tao", image: "https://images.unsplash.com/photo-1602524206684-76b7b9bf546c?w=800", stock: 25, sku: "TH-INCENSE-001" },
    { name: "Chuỗi Trầm Hương 108 Hạt", price: 1850000, description: "Chuỗi trầm hương 108 hạt, dùng niệm Phật", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", stock: 12, sku: "TH-ROSARY-001" },
    { name: "Trầm Chìm Nước Cao Cấp 50g", price: 5200000, description: "Trầm chìm nước cao cấp, mùi thơm đậm đà", image: "https://images.unsplash.com/photo-1603537392197-e0084e00c1b1?w=800", stock: 8, sku: "TH-SINK-001" },
    { name: "Lư Xông Trầm Gốm Bát Tràng", price: 850000, description: "Lư xông trầm gốm Bát Tràng cao cấp", image: "https://images.unsplash.com/photo-1581511378923-de10b4c9632e?w=800", stock: 18, sku: "TH-BURNER-001" },
    { name: "Nhẫn Trầm Hương Nam", price: 2100000, description: "Nhẫn trầm hương nam vân đẹp, sang trọng", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", stock: 10, sku: "TH-RING-001" },
    { name: "Trầm Hương Vụn Xông Phòng", price: 680000, description: "Trầm hương vụn xông phòng 100g, thơm lâu", image: "https://images.unsplash.com/photo-1603537392197-e0084e00c1b1?w=800", stock: 30, sku: "TH-POWDER-001" }
  ];

  const nhangSachProducts = [
    { name: "Nhang Sạch Hương Lavender", price: 85000, description: "Nhang sạch hương lavender, không hóa chất", image: "https://images.unsplash.com/photo-1602524206684-76b7b9bf546c?w=800", stock: 60, sku: "NS-LAV-001" },
    { name: "Tinh Dầu Bạc Hà Thiên Nhiên", price: 125000, description: "Tinh dầu bạc hà 10ml, thanh lọc không khí", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", stock: 45, sku: "NS-MINT-001" },
    { name: "Nến Thơm Sáp Đậu Nành", price: 195000, description: "Nến thơm sáp đậu nành organic, cháy sạch", image: "https://images.unsplash.com/photo-1602874801006-26a2a8b03cac?w=800", stock: 40, sku: "NS-CANDLE-001" },
    { name: "Bát Hương Gốm Sứ Cao Cấp", price: 320000, description: "Bát hương gốm sứ Bát Tràng, thiết kế tinh xảo", image: "https://images.unsplash.com/photo-1581511378923-de10b4c9632e?w=800", stock: 25, sku: "NS-BOWL-001" },
    { name: "Nhang Trầm Thanh Lọc", price: 165000, description: "Nhang trầm thanh lọc không gian, 100% tự nhiên", image: "https://images.unsplash.com/photo-1602524206684-76b7b9bf546c?w=800", stock: 50, sku: "NS-TRAM-001" },
    { name: "Tinh Dầu Sả Chanh 10ml", price: 95000, description: "Tinh dầu sả chanh đuổi muỗi tự nhiên", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", stock: 55, sku: "NS-LEMON-001" },
    { name: "Nhang Ngải Cứu Xông Phòng", price: 105000, description: "Nhang ngải cứu xông phòng, sát khuẩn tự nhiên", image: "https://images.unsplash.com/photo-1602524206684-76b7b9bf546c?w=800", stock: 48, sku: "NS-MUGW-001" },
    { name: "Nến Tinh Dầu Eucalyptus", price: 215000, description: "Nến tinh dầu bạch đàn, giúp thông mũi", image: "https://images.unsplash.com/photo-1602874801006-26a2a8b03cac?w=800", stock: 35, sku: "NS-EUC-001" },
    { name: "Nhang Que Hương Hoa Hồng", price: 75000, description: "Nhang que hương hoa hồng, thơm dịu nhẹ", image: "https://images.unsplash.com/photo-1602524206684-76b7b9bf546c?w=800", stock: 65, sku: "NS-ROSE-001" },
    { name: "Tinh Dầu Cam Ngọt 10ml", price: 110000, description: "Tinh dầu cam ngọt tươi mát, giảm stress", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", stock: 50, sku: "NS-ORANGE-001" }
  ];

  console.log('\n📦 Creating SunFoods products...');
  const sfCreated = [];
  for (const product of sunfoodsProducts) {
    const [created] = await db.insert(products).values({
      ...product,
      status: 'active',
      slug: product.sku.toLowerCase()
    }).returning();
    sfCreated.push(created);
    console.log(`  ✓ Created: ${created.name} (${created.sku})`);
  }

  console.log('\n🔗 Assigning SunFoods products to store...');
  for (const product of sfCreated) {
    await db.insert(storeProducts).values({
      storeId: 'sunfoods',
      productId: product.id,
      isActive: true,
      sortOrder: 0
    });
  }
  console.log(`  ✓ Assigned ${sfCreated.length} products to SunFoods store`);

  console.log('\n📦 Creating Trầm Hương products...');
  const thCreated = [];
  for (const product of tramHuongProducts) {
    const [created] = await db.insert(products).values({
      ...product,
      status: 'active',
      slug: product.sku.toLowerCase()
    }).returning();
    thCreated.push(created);
    console.log(`  ✓ Created: ${created.name} (${created.sku})`);
  }

  console.log('\n🔗 Assigning Trầm Hương products to store...');
  for (const product of thCreated) {
    await db.insert(storeProducts).values({
      storeId: 'tramhuong',
      productId: product.id,
      isActive: true,
      sortOrder: 0
    });
  }
  console.log(`  ✓ Assigned ${thCreated.length} products to Trầm Hương store`);

  console.log('\n📦 Creating Nhang Sạch products...');
  const nsCreated = [];
  for (const product of nhangSachProducts) {
    const [created] = await db.insert(products).values({
      ...product,
      status: 'active',
      slug: product.sku.toLowerCase()
    }).returning();
    nsCreated.push(created);
    console.log(`  ✓ Created: ${created.name} (${created.sku})`);
  }

  console.log('\n🔗 Assigning Nhang Sạch products to store...');
  for (const product of nsCreated) {
    await db.insert(storeProducts).values({
      storeId: 'nhangsach',
      productId: product.id,
      isActive: true,
      sortOrder: 0
    });
  }
  console.log(`  ✓ Assigned ${nsCreated.length} products to Nhang Sạch store`);

  console.log('\n🎉 Seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`  • SunFoods: ${sfCreated.length} products`);
  console.log(`  • Trầm Hương: ${thCreated.length} products`);
  console.log(`  • Nhang Sạch: ${nsCreated.length} products`);
  console.log(`  • Total: ${sfCreated.length + thCreated.length + nsCreated.length} products created and assigned`);
}

seedProductsAndAssignStores()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
