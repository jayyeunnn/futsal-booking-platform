import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

/**
 * UploadThing Next.js route handler.
 * Exposes POST/GET at /api/uploadthing for file router endpoints.
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
