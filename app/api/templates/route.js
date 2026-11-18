import { categories, presets, templates } from "@/lib/templates";

/**
 * GET /api/templates
 * Returns the catalogue so other clients can build their own UI on top of it.
 */
export async function GET() {
  return Response.json({
    categories,
    presets,
    templates: templates.map(({ id, name, icon, category, description }) => ({
      id,
      name,
      icon,
      category,
      description,
    })),
  });
}
