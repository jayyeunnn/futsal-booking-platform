import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getSessionUser } from "@/lib/auth-helpers";

const f = createUploadthing();

/**
 * UploadThing file router.
 * Each entry defines an upload endpoint with size/type limits and per-route auth.
 */
export const ourFileRouter = {
  /** Avatar uploads — any signed-in user, 2MB image. */
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getSessionUser();
      if (!user) throw new UploadThingError("Login diperlukan");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, userId: metadata.userId };
    }),

  /** Payment proof — any signed-in user, 4MB image. */
  paymentProof: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getSessionUser();
      if (!user) throw new UploadThingError("Login diperlukan");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, userId: metadata.userId };
    }),

  /** Court photos — admin only, up to 8 images of 4MB each. */
  courtPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(async () => {
      const user = await getSessionUser();
      if (!user) throw new UploadThingError("Login diperlukan");
      if (user.role !== "ADMIN" && user.role !== "STAFF") {
        throw new UploadThingError("Akses ditolak");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, userId: metadata.userId };
    }),

  /** Location thumbnails — admin only. */
  locationThumbnail: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getSessionUser();
      if (!user) throw new UploadThingError("Login diperlukan");
      if (user.role !== "ADMIN") {
        throw new UploadThingError("Akses ditolak");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl ?? file.url, userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
