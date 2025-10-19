const fs = require('fs');
const path = require('path');

// Fix syntax errors in storage.ts
const filePath = path.join(__dirname, 'src/storage.ts');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove any invisible characters or encoding issues
  content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Fix any potential syntax issues around line 1970
  content = content.replace(
    /async updateOrderStatus\(id: string, status: string\): Promise<Orders \| undefined> \{[\s\S]*?\}/g,
    `async updateOrderStatus(id: string, status: string): Promise<Orders | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }`
  );
  
  content = content.replace(
    /async updateOrder\(id: string, order: Partial<InsertOrders>\): Promise<Orders \| undefined> \{[\s\S]*?\}/g,
    `async updateOrder(id: string, order: Partial<InsertOrders>): Promise<Orders | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }`
  );
  
  content = content.replace(
    /async deleteOrder\(id: string\): Promise<boolean> \{[\s\S]*?\}/g,
    `async deleteOrder(id: string): Promise<boolean> {
    // First delete order items
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    // Then delete the order
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount ?? 0) > 0;
  }`
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed syntax errors in storage.ts');
  
} catch (error) {
  console.error('Error fixing storage.ts:', error.message);
}



