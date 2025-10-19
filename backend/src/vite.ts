import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const adminDistPath = path.resolve(__dirname, "..", "public", "admin");
  const mobileDistPath = path.resolve(__dirname, "..", "dist-mobile");

  if (!fs.existsSync(adminDistPath)) {
    throw new Error(
      `Could not find the admin build directory: ${adminDistPath}, make sure to build the admin client first`,
    );
  }

  const hasMobile = fs.existsSync(mobileDistPath);

  // Serve admin frontend at /adminhoang
  app.use('/adminhoang', express.static(adminDistPath, {
    maxAge: 0, // Disable caching for admin assets during development
    setHeaders: (res, filePath) => {
      // Always use no-cache for HTML files
      if (path.extname(filePath) === '.html') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        // For JS/CSS files, also disable cache to ensure latest changes load
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));

  // Serve mobile frontend at root (only if exists)
  if (hasMobile) {
    app.use(express.static(mobileDistPath, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.html') {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
  }

  // Redirect root hash routes to admin (handle both # and %23 encoded)
  app.get('/', (req, res, next) => {
    const hash = req.url.split('#')[1] || req.url.split('%23')[1];
    if (hash) {
      return res.redirect(301, `/adminhoang/#${hash}`);
    }
    next();
  });

  // Redirect /%23/* (URL-encoded hash) to admin
  app.get('/%23/*', (req, res) => {
    const path = req.path.replace('/%23/', '');
    res.redirect(301, `/adminhoang/#/${path}${req.url.includes('?') ? req.url.split('?')[1] : ''}`);
  });

  // Admin SPA fallback for exact /adminhoang path (no trailing slash)
  app.get('/adminhoang', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.resolve(adminDistPath, "index.html"));
  });

  // Admin SPA fallback for /adminhoang/ (WITH trailing slash - for hash routing)
  app.get('/adminhoang/', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.resolve(adminDistPath, "index.html"));
  });

  // Admin SPA fallback for /adminhoang/* paths
  app.get('/adminhoang/*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.resolve(adminDistPath, "index.html"));
  });

  // Mobile SPA fallback (must be LAST, after all API routes) - only if exists
  if (hasMobile) {
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.resolve(mobileDistPath, "index.html"));
    });
  }
}
