import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Pre-configured UploadThing client helpers + React components.
 * Import `<UploadButton />` / `<UploadDropzone />` directly in client components.
 */
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
