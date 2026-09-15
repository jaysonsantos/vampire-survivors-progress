<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import "../app.css";
  import WikiLink from "$lib/components/WikiLink.svelte";
  import { clear, restore, saveStore } from "$lib/save/store.svelte.ts";
  import { wikiPageUrl } from "$lib/wiki.ts";

  interface Props {
    children: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  const TABS = [
    { href: "", label: "Overview" },
    { href: "characters", label: "Characters" },
    { href: "stages", label: "Stages" },
    { href: "collection", label: "Collection" },
    { href: "achievements", label: "Achievements" },
  ] as const;

  restore();

  function isCurrent(href: string): boolean {
    const target = href === "" ? `${base}/` : `${base}/${href}`;
    const path = page.url.pathname.endsWith("/") ? page.url.pathname : `${page.url.pathname}/`;
    return href === "" ? path === target : path.startsWith(`${target}/`) || path === `${target}/`;
  }
</script>

<div class="shell">
  <header class="masthead">
    <a class="brand" href="{base}/">
      <img src="{base}/favicon.svg" alt="" />
      <span>Vampire Survivors <span class="brand-accent">Progress</span></span>
    </a>

    <nav class="tabs" aria-label="Sections">
      {#each TABS as tab (tab.href)}
        <a href="{base}/{tab.href}" aria-current={isCurrent(tab.href) ? "page" : undefined}>{tab.label}</a>
      {/each}
    </nav>

    <div class="side small">
      <WikiLink href={wikiPageUrl("home")} label="Wiki" kind="pill" />
      {#if saveStore.loaded}
        <span class="source muted" title={saveStore.source ?? "save"}>{saveStore.source ?? "save"}</span>
        <button type="button" onclick={clear}>Unload</button>
      {/if}
    </div>
  </header>

  <main>
    {@render children()}
  </main>

  <footer class="small muted">
    <p>
      Everything runs in your browser. Your save is never uploaded. This is a fan tool and is not connected to poncle.
      Unlock guides link to the community
      <a href={wikiPageUrl("home")} target="_blank" rel="noopener noreferrer">Vampire Survivors Wiki</a>.
    </p>
  </footer>
</div>

<style>
  .brand-accent {
    color: var(--accent-soft);
  }

  .side {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .source {
    max-width: 14ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  footer {
    margin-top: 3rem;
    border-top: 1px solid var(--border);
    padding-top: 0.75rem;
  }
</style>
