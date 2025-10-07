import express from 'express';
import { db } from '../db';
import { bookCustomers } from '../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import type { BookCustomer, InsertBookCustomer } from '../../shared/schema';

const router = express.Router();

// Get all book customers
router.get('/', async (req, res) => {
  try {
    const customers = await db
      .select()
      .from(bookCustomers)
      .orderBy(desc(bookCustomers.createdAt));

    res.json(customers);
  } catch (error) {
    console.error('Error fetching book customers:', error);
    res.status(500).json({ error: 'Failed to fetch book customers' });
  }
});

// Create new book customer
router.post('/', async (req, res) => {
  try {
    const customerData: InsertBookCustomer = req.body;
    
    const [newCustomer] = await db
      .insert(bookCustomers)
      .values(customerData)
      .returning();

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating book customer:', error);
    res.status(500).json({ error: 'Failed to create book customer' });
  }
});

// Update book customer
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedCustomer] = await db
      .update(bookCustomers)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(bookCustomers.id, id))
      .returning();

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Book customer not found' });
    }

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating book customer:', error);
    res.status(500).json({ error: 'Failed to update book customer' });
  }
});

// Delete book customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedCustomer] = await db
      .delete(bookCustomers)
      .where(eq(bookCustomers.id, id))
      .returning();

    if (!deletedCustomer) {
      return res.status(404).json({ error: 'Book customer not found' });
    }

    res.json({ success: true, message: 'Book customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting book customer:', error);
    res.status(500).json({ error: 'Failed to delete book customer' });
  }
});

export default router;