import { templateMap } from "@/lib/templates";

/**
 * POST /api/generate
 *
 * Body: { selected: string[], custom?: string }
 * Returns a single, ready-to-save .gitignore string plus small stats.
 *
 * All merging happens on the server (Node.js), so the browser only needs to
 * send a handful of template IDs.
 */
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const selected = Array.isArray(body?.selected) ? body.selected : [];
  const custom = typeof body?.custom === "string" ? body.custom : "";

  // Ignore unknown IDs and duplicates, preserving the order chosen by the user.
  const ids = [...new Set(selected)].filter((id) =>
    typeof id === "string" && templateMap.has(id)
  );

  if (ids.length === 0 && !custom.trim()) {
    return Response.json(
      { error: "Select at least one template or add a custom rule." },
      { status: 400 }
    );
  }

  const chosen = ids.map((id) => templateMap.get(id));
  const seen = new Set();
  const sections = [];

  for (const template of chosen) {
    const lines = [];
    let previousWasBlank = false;

    for (const raw of template.patterns.split("\n")) {
      const line = raw.replace(/\s+$/, "");

      // Keep a single blank line between groups so sections stay readable.
      if (!line.trim()) {
        if (lines.length && !previousWasBlank) {
          lines.push("");
          previousWasBlank = true;
        }
        continue;
      }

      if (seen.has(line.trim())) continue;
      seen.add(line.trim());
      lines.push(line);
      previousWasBlank = false;
    }

    while (lines.length && !lines[lines.length - 1]) lines.pop();

    sections.push(`# ${"=".repeat(3)} ${template.name} ${"=".repeat(3)}\n${lines.join("\n")}`);
  }

  const customLines = custom
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim() && !seen.has(line.trim()));

  if (customLines.length) {
    sections.push(`# ${"=".repeat(3)} Custom rules ${"=".repeat(3)}\n${customLines.join("\n")}`);
  }

  const header = [
    "# ----------------------------------------------------------------------------",
    "# Generated with gitignore-generator",
    `# Templates: ${chosen.map((t) => t.name).join(", ") || "Custom only"}`,
    "# ----------------------------------------------------------------------------",
  ].join("\n");

  const content = `${header}\n\n${sections.join("\n\n")}\n`;
  const lineCount = content.split("\n").length - 1;

  return Response.json({
    content,
    lineCount,
    templateCount: chosen.length,
    templates: chosen.map((t) => ({ id: t.id, name: t.name, icon: t.icon })),
  });
}

/** Small helper for discovering the endpoint. */
export async function GET() {
  return Response.json({
    endpoint: "/api/generate",
    method: "POST",
    body: { selected: ["node", "vscode"], custom: "# my own rules\n/my-folder" },
  });
}
