// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { invoiceTemplates } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { generateInvoiceImage } from "../utils/invoice-generator";

const router = Router();

const InvoiceTemplateConfigSchema = z.object({
  colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    text: z.string().optional(),
    background: z.string().optional(),
    border: z.string().optional(),
  }).optional(),
  fonts: z.object({
    family: z.string().optional(),
    size: z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
      small: z.string().optional(),
    }).optional(),
  }).optional(),
  layout: z.object({
    orientation: z.enum(["portrait", "landscape"]).optional(),
    paperSize: z.enum(["a4", "letter", "a5"]).optional(),
    margins: z.object({
      top: z.number().optional(),
      right: z.number().optional(),
      bottom: z.number().optional(),
      left: z.number().optional(),
    }).optional(),
  }).optional(),
  qr_settings: z.object({
    enabled: z.boolean().optional(),
    position: z.enum(["top-right", "top-left", "bottom-right", "bottom-left"]).optional(),
    size: z.number().optional(),
  }).optional(),
  logo_url: z.string().optional(),
  header: z.object({
    show_business_name: z.boolean().optional(),
    show_logo: z.boolean().optional(),
    show_contact_info: z.boolean().optional(),
  }).optional(),
  footer: z.object({
    show_terms: z.boolean().optional(),
    show_thank_you: z.boolean().optional(),
    custom_text: z.string().optional(),
  }).optional(),
  fields: z.object({
    show_customer_info: z.boolean().optional(),
    show_payment_method: z.boolean().optional(),
    show_notes: z.boolean().optional(),
    show_tax: z.boolean().optional(),
  }).optional(),
}).passthrough();

const CreateInvoiceTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(255),
  config: InvoiceTemplateConfigSchema,
  isDefault: z.boolean().optional().default(false),
});

const UpdateInvoiceTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  config: InvoiceTemplateConfigSchema.optional(),
  isDefault: z.boolean().optional(),
});

const PreviewInvoiceSchema = z.object({
  config: InvoiceTemplateConfigSchema,
  orderId: z.string().min(1, "Order ID is required"),
});

router.get("/", async (req, res) => {
  try {
    const { limit = "50", offset = "0" } = req.query;

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    if (isNaN(limitNum) || isNaN(offsetNum) || limitNum < 1 || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid pagination parameters"
      });
    }

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoiceTemplates);

    const templates = await db
      .select()
      .from(invoiceTemplates)
      .orderBy(sql`${invoiceTemplates.isDefault} DESC, ${invoiceTemplates.createdAt} DESC`)
      .limit(limitNum)
      .offset(offsetNum);

    res.json({
      success: true,
      templates,
      pagination: {
        total: Number(totalCount[0]?.count || 0),
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + templates.length < Number(totalCount[0]?.count || 0)
      }
    });
  } catch (error) {
    console.error("Error fetching invoice templates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invoice templates",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const validatedData = CreateInvoiceTemplateSchema.parse(req.body);

    if (validatedData.isDefault) {
      await db
        .update(invoiceTemplates)
        .set({ isDefault: false })
        .where(eq(invoiceTemplates.isDefault, true));
    }

    const result = await db
      .insert(invoiceTemplates)
      .values({
        name: validatedData.name,
        config: validatedData.config,
        isDefault: validatedData.isDefault || false,
      })
      .returning();

    res.status(201).json({
      success: true,
      template: result[0],
      message: `Invoice template "${validatedData.name}" created successfully`
    });
  } catch (error) {
    console.error("Error creating invoice template:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create invoice template",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateInvoiceTemplateSchema.parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No update data provided"
      });
    }

    const existing = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invoice template not found"
      });
    }

    if (validatedData.isDefault === true) {
      await db
        .update(invoiceTemplates)
        .set({ isDefault: false })
        .where(eq(invoiceTemplates.isDefault, true));
    }

    const deepMerge = (target: any, source: any): any => {
      const output = { ...target };
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };

    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.config !== undefined) {
      updateData.config = deepMerge(existing[0].config, validatedData.config);
    }
    if (validatedData.isDefault !== undefined) updateData.isDefault = validatedData.isDefault;

    const result = await db
      .update(invoiceTemplates)
      .set(updateData)
      .where(eq(invoiceTemplates.id, id))
      .returning();

    res.json({
      success: true,
      template: result[0],
      message: `Invoice template updated successfully`
    });
  } catch (error) {
    console.error("Error updating invoice template:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update invoice template",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const template = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id))
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invoice template not found"
      });
    }

    if (template[0].isDefault) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete default template. Set another template as default first."
      });
    }

    const result = await db
      .delete(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id))
      .returning();

    res.json({
      success: true,
      message: "Invoice template deleted successfully",
      deletedTemplate: result[0]
    });
  } catch (error) {
    console.error("Error deleting invoice template:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete invoice template",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/:id/set-default", async (req, res) => {
  try {
    const { id } = req.params;

    const template = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id))
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Invoice template not found"
      });
    }

    await db
      .update(invoiceTemplates)
      .set({ isDefault: false })
      .where(eq(invoiceTemplates.isDefault, true));

    const result = await db
      .update(invoiceTemplates)
      .set({ isDefault: true })
      .where(eq(invoiceTemplates.id, id))
      .returning();

    res.json({
      success: true,
      template: result[0],
      message: `Template "${result[0].name}" set as default`
    });
  } catch (error) {
    console.error("Error setting default invoice template:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set default template",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/preview", async (req, res) => {
  try {
    const validatedData = PreviewInvoiceSchema.parse(req.body);
    const { config, orderId } = validatedData;

    const imageBuffer = await generateInvoiceImage(orderId, config);

    const base64Image = imageBuffer.toString('base64');
    const imageBase64 = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      imageBase64
    });
  } catch (error) {
    console.error("Error generating invoice preview:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
          details: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      error: "Failed to generate invoice preview",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
