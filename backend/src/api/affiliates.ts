import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { CommissionService } from '../services/commission-service';

const router = Router();

// GET /api/affiliates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { affiliateId, action } = req.query;
      
      if (action === 'commission-history' && affiliateId) {
        // GET /api/affiliates?action=commission-history&affiliateId=xxx - Get commission history
        const history = await CommissionService.getCommissionHistory(affiliateId as string);
        res.json(history);
        
      } else if (action === 'commission-summary' && affiliateId) {
        // GET /api/affiliates?action=commission-summary&affiliateId=xxx - Get commission summary
        const summary = await CommissionService.getCommissionSummary(affiliateId as string);
        if (!summary) {
          return res.status(404).json({ error: 'Affiliate not found' });
        }
        res.json(summary);
        
      } else if (action === 'list') {
        // GET /api/affiliates?action=list - Get all affiliates
        const affiliates = await storage.getCustomers(100);
        const affiliateList = affiliates.filter(customer => customer.isAffiliate);
        res.json(affiliateList);
        
      } else {
        return res.status(400).json({ 
          error: 'Invalid action. Use: commission-history, commission-summary, or list' 
        });
      }
    
  } catch (error) {
    console.error('Affiliates API error:', error);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});

// POST /api/affiliates
router.post('/', async (req: Request, res: Response) => {
  try {
    const { action, affiliateId, amount, paymentReference } = req.body;
    
    if (action === 'mark-commission-paid') {
      // POST /api/affiliates - Mark commission as paid
      if (!affiliateId || !amount) {
        return res.status(400).json({ 
          error: 'Affiliate ID and amount are required' 
        });
      }

      const result = await CommissionService.markCommissionAsPaid(
        affiliateId, 
        parseFloat(amount), 
        paymentReference
      );

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({
        success: true,
        message: result.message
      });
      
    } else {
      return res.status(400).json({ 
        error: 'Invalid action. Use: mark-commission-paid' 
      });
    }
    
  } catch (error) {
    console.error('Affiliates POST API error:', error);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});

export default router;