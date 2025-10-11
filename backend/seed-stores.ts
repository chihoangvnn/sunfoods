import { db } from './src/db';
import { stores } from './shared/schema';

async function seedStores() {
  console.log('🌱 Seeding stores...');
  
  const storesData = [
    {
      id: 'sunfoods',
      domain: 'sunfoods.vn',
      name: 'SunFoods.vn',
      industry: 'healthy_food',
      themeConfig: {
        primary: '#2D5F3E',
        cta: '#F4A742',
        accent: '#8BC34A',
        gold: '#D4AF37',
        style: 'natural_organic'
      },
      isActive: true
    },
    {
      id: 'tramhuong',
      domain: 'tramhuonghoangngan.com',
      name: 'Trầm Hương Hoàng Ngân',
      industry: 'luxury_incense',
      themeConfig: {
        primary: '#3D2B1F',
        secondary: '#222222',
        accent: '#C1A875',
        cta: '#3A5F0B',
        background: '#F5F5DC',
        text: '#444444',
        style: 'luxury_elegant'
      },
      isActive: true
    },
    {
      id: 'nhangsach',
      domain: 'nhangsach.net',
      name: 'Nhang Sạch',
      industry: 'clean_incense',
      themeConfig: {
        primary: '#3EB489',
        cta: '#FF9966',
        accent: '#F4D03F',
        text: '#333333',
        style: 'clean_spiritual'
      },
      isActive: true
    }
  ];

  for (const store of storesData) {
    await db.insert(stores).values(store).onConflictDoUpdate({
      target: stores.id,
      set: {
        domain: store.domain,
        name: store.name,
        industry: store.industry,
        themeConfig: store.themeConfig,
        isActive: store.isActive,
        updatedAt: new Date().toISOString()
      }
    });
    console.log(`✅ Seeded store: ${store.name} (${store.domain})`);
  }

  console.log('🎉 Stores seeded successfully!');
  process.exit(0);
}

seedStores().catch((err) => {
  console.error('❌ Error seeding stores:', err);
  process.exit(1);
});
