"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categories, presets, templates } from "@/lib/templates";

/* ------------------------------------------------------------------ icons */

function Icon({ name, size = 16 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" /></>,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    trash: <><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="m6 7 1 13h10l1-13" /></>,
    spark: <><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m6 6 2.5 2.5" /><path d="m15.5 15.5 2.5 2.5" /><path d="m18 6-2.5 2.5" /><path d="m8.5 15.5-2.5 2.5" /></>,
    file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

/* ------------------------------------------------------------------ helpers */

function readSelectionFromUrl() {
  if (typeof window === "undefined") return [];
  const raw = new URLSearchParams(window.location.search).get("t");
  if (!raw) return [];
  return raw.split(",").filter((id) => templates.some((t) => t.id === id));
}

/* --------------------------------------------------------------------- page */

export default function Home() {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef(null);

  // Restore a shared selection from the URL on first load.
  useEffect(() => {
    setSelected(readSelectionFromUrl());
  }, []);

  // Keep the URL in sync so a selection can be shared with a single link.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (selected.length) url.searchParams.set("t", selected.join(","));
    else url.searchParams.delete("t");
    window.history.replaceState(null, "", url);
  }, [selected]);

  // Ask the Node.js API to build the file whenever inputs change.
  useEffect(() => {
    if (selected.length === 0 && !custom.trim()) {
      setResult(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setGenerating(true);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selected, custom }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Generation failed");
        setResult(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") setResult(null);
      } finally {
        if (!controller.signal.aborted) setGenerating(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selected, custom]);

  // Cmd/Ctrl + K focuses the search box.
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleTemplate = useCallback((id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);

  const visibleTemplates = useMemo(() => {
    const term = query.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = category === "all" || template.category === category;
      const matchesTerm =
        !term ||
        template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.id.includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [query, category]);

  const content = result?.content ?? "";
  const lines = useMemo(() => content.split("\n"), [content]);

  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const area = document.createElement("textarea");
      area.value = content;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ".gitignore";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="gitignore generator home">
            <span className="brand-mark"><Icon name="file" size={18} /></span>
            <span className="brand-name">gitignore<span>.generator</span></span>
          </a>
          <div className="header-meta">
            <span className="status-dot" />
            <span>No signup. No tracking. Just files.</span>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <div className="eyebrow"><Icon name="spark" size={13} /> Built for every kind of project</div>
          <h1>One clean <code>.gitignore</code>,<br />made for <em>your</em> stack.</h1>
          <p>
            Pick a language, a framework, your editor and OS. We merge the rules,
            remove duplicates and hand you a file that is ready to commit.
          </p>
          <div className="hero-stats">
            <span><strong>{templates.length}</strong> templates</span>
            <span className="stat-divider" />
            <span><strong>{categories.length}</strong> categories</span>
            <span className="stat-divider" />
            <span><strong>0</strong> dependencies at runtime</span>
          </div>
        </section>

        <section className="workspace">
          {/* --------------------------------------------------- left column */}
          <div className="builder panel">
            <div className="panel-head">
              <div>
                <h2>Build your file</h2>
                <p>Choose everything your project needs to ignore.</p>
              </div>
              {selected.length > 0 && (
                <button className="text-button" onClick={() => setSelected([])}>
                  <Icon name="trash" size={14} /> Clear all
                </button>
              )}
            </div>

            <div className="search-wrap">
              <Icon name="search" size={17} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates…"
                aria-label="Search templates"
              />
              {query ? (
                <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search">×</button>
              ) : (
                <kbd>⌘ K</kbd>
              )}
            </div>

            <div className="presets">
              <span className="presets-label">Quick start</span>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className="preset-chip"
                  onClick={() => setSelected(preset.templates)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="category-tabs" role="tablist" aria-label="Template categories">
              <button
                role="tab"
                aria-selected={category === "all"}
                className={category === "all" ? "tab active" : "tab"}
                onClick={() => setCategory("all")}
              >
                All <span>{templates.length}</span>
              </button>
              {categories.map((item) => {
                const count = templates.filter((t) => t.category === item.id).length;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={category === item.id}
                    className={category === item.id ? "tab active" : "tab"}
                    onClick={() => setCategory(item.id)}
                  >
                    <span className="tab-icon">{item.icon}</span> {item.label}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="template-grid">
              {visibleTemplates.map((template) => {
                const isSelected = selected.includes(template.id);
                return (
                  <button
                    key={template.id}
                    className={isSelected ? "template-card selected" : "template-card"}
                    onClick={() => toggleTemplate(template.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="template-icon">{template.icon}</span>
                    <span className="template-body">
                      <span className="template-name">{template.name}</span>
                      <span className="template-description">{template.description}</span>
                    </span>
                    <span className="checkbox">{isSelected && <Icon name="check" size={13} />}</span>
                  </button>
                );
              })}
              {visibleTemplates.length === 0 && (
                <div className="no-results">
                  <span>Nothing matched “{query}”.</span>
                  <button onClick={() => { setQuery(""); setCategory("all"); }}>Reset filters</button>
                </div>
              )}
            </div>

            <div className="custom-block">
              <button className="custom-toggle" onClick={() => setShowCustom((value) => !value)}>
                <Icon name={showCustom ? "check" : "plus"} size={14} />
                Custom rules
                <span>{custom.trim() ? "added" : "optional"}</span>
              </button>
              {showCustom && (
                <textarea
                  value={custom}
                  onChange={(event) => setCustom(event.target.value)}
                  placeholder={"# e.g.\n/my-private-folder\n*.secret"}
                  spellCheck={false}
                  rows={5}
                  aria-label="Custom gitignore rules"
                />
              )}
            </div>
          </div>

          {/* -------------------------------------------------- right column */}
          <div className="preview-column">
            <div className="panel preview">
              <div className="preview-head">
                <div className="file-label"><Icon name="file" size={15} /> .gitignore</div>
                <div className="preview-actions">
                  <button className="action-button" onClick={copyToClipboard} disabled={!content}>
                    <Icon name={copied ? "check" : "copy"} size={14} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button className="action-button primary" onClick={download} disabled={!content}>
                    <Icon name="download" size={14} /> Download
                  </button>
                </div>
              </div>

              <div className="preview-meta">
                {result ? (
                  <>
                    <span><strong>{result.templateCount}</strong> selected</span>
                    <span className="stat-divider" />
                    <span><strong>{result.lineCount}</strong> lines</span>
                    {generating && <span className="generating">updating…</span>}
                  </>
                ) : (
                  <span>Nothing selected yet</span>
                )}
              </div>

              <div className={content ? "code-view" : "code-view empty"}>
                {content ? (
                  <div className="code-inner">
                    {lines.map((line, index) => (
                      <div className="code-line" key={index}>
                        <span className="line-number">{index + 1}</span>
                        <span
                          className={
                            "line-text" +
                            (line.trim().startsWith("#") ? " comment" : "") +
                            (line.trim().startsWith("!") ? " negation" : "")
                          }
                        >
                          {line || " "}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon"><Icon name="file" size={26} /></div>
                    <p>Your <code>.gitignore</code> will appear here.</p>
                    <span>Select a template on the left, or try a quick start preset.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="tip">
              <span className="tip-icon">i</span>
              <p>
                Rules are merged on the server, duplicates are removed and every
                group is labelled — so you can still tell where each rule came from.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Built with Next.js, Node.js and a little bit of CSS.</span>
        <span>Works entirely offline once loaded.</span>
      </footer>
    </div>
  );
}
