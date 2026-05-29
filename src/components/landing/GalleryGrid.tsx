"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { Lightbox } from "@/components/shared/Lightbox";

type Photo = { src: string; alt: string };

type Props = {
  photos: Photo[];
};

/**
 * Client wrapper supaya gallery klik-able buat buka lightbox.
 * Server component (`GallerySection`) yang fetch data, lalu pass props.
 */
export function GalleryGrid({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Buka foto: ${image.alt}`}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-zoom-in"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        images={photos.map((p) => p.src)}
        captions={photos.map((p) => p.alt)}
        openIndex={openIndex}
        onClose={() => setOpenIndex(-1)}
        onChange={setOpenIndex}
      />
    </>
  );
}
