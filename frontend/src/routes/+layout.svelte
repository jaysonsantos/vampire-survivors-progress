<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import "../app.css";
  import { clear, restore, saveStore } from "$lib/save/store.svelte.ts";

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
    <div class="brand">
      <img src="{base}/favicon.svg" alt="" />
      <span>Vampire Survivors Progress</span>
    </div>

    <nav class="tabs" aria-label="Sections">
      {#each TABS as tab (tab.href)}
        <a href="{base}/{tab.href}" aria-current={isCurrent(tab.href) ? "page" : undefined}>{tab.label}</a>
      {/each}
    </nav>

    {#if saveStore.loaded}
      <div class="loaded small">
        <span class="muted">{saveStore.source ?? "save"}</span>
        <button type="button" onclick={clear}>Unload</button>
      </div>
    {/if}
  </header>

  <main>
    {@render children()}
  </main>

  <footer class="small muted">
    <p>
      Everything runs in your browser. Your save is never uploaded. This is a fan tool and is not connected to poncle.
    </p>
  </footer>
</div>

<style>
  .loaded {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  footer {
    margin-top: 2.5rem;
    border-top: 1px solid var(--border);
    padding-top: 0.75rem;
  }
</style>
