/**
 * Renders a JSON-LD structured data block.
 * Usage: <JsonLd data={localBusinessJsonLd(locations)} />
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify of a known-shape object — safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
