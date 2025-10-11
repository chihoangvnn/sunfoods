import type { Express, Request, Response } from "express";
import { db } from "../db";
import { storage } from "../storage";
import { insertCustomerEventsSchema } from "@shared/schema";
import { z } from "zod";

/**
 * 📊 Bot Events Tracking API
 * Auto-collect customer behavioral data from multiple channels
 */
export function registerBotEventsRoutes(app: Express) {
  
  // 🎯 POST /api/bot/events/track - Track any event (generic tracker)
  app.post("/api/bot/events/track", async (req: Request, res: Response) => {
    try {
      const eventData = insertCustomerEventsSchema.parse(req.body);
      
      const event = await storage.trackCustomerEvent(eventData);
      
      res.json({
        success: true,
        event,
        message: "Event tracked successfully"
      });
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to track event"
      });
    }
  });

  // 🌐 POST /api/bot/events/web-session - Auto-collect web analytics from request
  app.post("/api/bot/events/web-session", async (req: Request, res: Response) => {
    try {
      const { customerId, sessionId, utmParams, pageUrl } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: "customerId is required" });
      }

      // Auto-extract device info from User-Agent
      const userAgent = req.headers['user-agent'] || '';
      const deviceType = detectDeviceType(userAgent);
      const browserFingerprint = generateBrowserFingerprint(req);

      // Auto-extract referrer
      const referrerUrl = req.headers['referer'] || req.headers['referrer'] as string;

      // Auto-extract IP and geolocation (basic)
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '';

      const events: any[] = [];

      // Track UTM parameters if provided
      if (utmParams?.utmSource) {
        const utmEvent = await storage.trackCustomerEvent({
          customerId,
          eventType: "utm_tracked",
          eventData: {
            utmSource: utmParams.utmSource,
            utmMedium: utmParams.utmMedium,
            utmCampaign: utmParams.utmCampaign,
            utmTerm: utmParams.utmTerm,
            utmContent: utmParams.utmContent,
            pageUrl,
            deviceType,
            userAgent,
            ipAddress,
          },
          channel: "web",
          sessionId,
        });
        events.push(utmEvent);
      }

      // Track referrer if present
      if (referrerUrl && !referrerUrl.includes(req.hostname)) {
        const referrerEvent = await storage.trackCustomerEvent({
          customerId,
          eventType: "referrer_tracked",
          eventData: {
            referrerUrl,
            pageUrl,
            deviceType,
            browserFingerprint,
          },
          channel: "web",
          sessionId,
        });
        events.push(referrerEvent);
      }

      // Track page view
      const pageViewEvent = await storage.trackCustomerEvent({
        customerId,
        eventType: "page_view",
        eventData: {
          pageUrl,
          deviceType,
          browserFingerprint,
          userAgent,
          ipAddress,
        },
        channel: "web",
        sessionId,
      });
      events.push(pageViewEvent);

      res.json({
        success: true,
        events,
        summary: {
          tracked: events.length,
          deviceType,
          referrer: referrerUrl,
        }
      });
    } catch (error) {
      console.error("Error tracking web session:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to track web session"
      });
    }
  });

  // 📱 POST /api/bot/events/facebook-profile - Auto-collect Facebook profile data
  app.post("/api/bot/events/facebook-profile", async (req: Request, res: Response) => {
    try {
      const { customerId, facebookId, locale, timezone, gender, sessionId } = req.body;

      if (!customerId) {
        return res.status(400).json({ error: "customerId is required" });
      }

      const events: any[] = [];

      // Track Facebook locale
      if (locale) {
        const localeEvent = await storage.trackCustomerEvent({
          customerId,
          eventType: "locale_detected",
          eventData: {
            locale,
            facebookId,
          },
          channel: "facebook",
          sessionId,
        });
        events.push(localeEvent);
      }

      // Track Facebook timezone
      if (timezone !== undefined) {
        const timezoneEvent = await storage.trackCustomerEvent({
          customerId,
          eventType: "timezone_detected",
          eventData: {
            timezone,
            facebookId,
          },
          channel: "facebook",
          sessionId,
        });
        events.push(timezoneEvent);
      }

      // Track Facebook gender
      if (gender) {
        const genderEvent = await storage.trackCustomerEvent({
          customerId,
          eventType: "gender_detected",
          eventData: {
            gender,
            facebookId,
          },
          channel: "facebook",
          sessionId,
        });
        events.push(genderEvent);
      }

      res.json({
        success: true,
        events,
        message: `Tracked ${events.length} Facebook profile events`
      });
    } catch (error) {
      console.error("Error tracking Facebook profile:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to track Facebook profile"
      });
    }
  });

  // 📊 GET /api/bot/events/:customerId/summary - Get customer analytics summary
  app.get("/api/bot/events/:customerId/summary", async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      const { limit = 50, eventType } = req.query;

      // Get customer with updated summary
      const customer = await storage.getCustomer(customerId);
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Get recent events
      const recentEvents = eventType
        ? await storage.getCustomerEventsByType(customerId, eventType as string, Number(limit))
        : await storage.getCustomerEvents(customerId, Number(limit));

      // Extract summary data from customer JSONB fields
      const socialData = customer.socialData as any || {};
      const membershipData = customer.membershipData as any || {};
      const limitsData = customer.limitsData as any || {};

      res.json({
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        },
        analytics: {
          facebook: {
            locale: socialData.fbLocale,
            timezone: socialData.fbTimezone,
            gender: socialData.fbGender,
          },
          web: membershipData.webAnalytics || {},
          behavior: limitsData.behaviorStats || {},
        },
        recentEvents: recentEvents.map(e => ({
          id: e.id,
          eventType: e.eventType,
          channel: e.channel,
          createdAt: e.createdAt,
          data: e.eventData,
        })),
      });
    } catch (error) {
      console.error("Error getting customer summary:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get summary"
      });
    }
  });
}

// Helper functions
function detectDeviceType(userAgent: string): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  
  return "desktop";
}

function generateBrowserFingerprint(req: Request): string {
  const components = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.headers['accept-encoding'],
  ].filter(Boolean);
  
  // Simple hash (in production, use a proper hashing library)
  return Buffer.from(components.join('|')).toString('base64').substring(0, 32);
}
