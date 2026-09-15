<script lang="ts">
  import { SAVE_FILE_NAME } from "../constants.ts";
  import { readSaveFile, SaveParseError } from "../save/parse.ts";
  import { load } from "../save/store.svelte.ts";

  let dragging = $state(false);
  let error = $state<string | null>(null);
  let input = $state<HTMLInputElement | null>(null);

  async function accept(files: FileList | null): Promise<void> {
    const file = files?.item(0);
    if (file === null || file === undefined) return;
    error = null;
    try {
      load(await readSaveFile(file), file.name);
    } catch (cause) {
      error = cause instanceof SaveParseError ? cause.message : "The file could not be read.";
    }
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault();
    dragging = false;
    void accept(event.dataTransfer?.files ?? null);
  }
</script>

<div
  class="drop card"
  class:dragging
  ondragover={(event) => {
    event.preventDefault();
    dragging = true;
  }}
  ondragleave={() => {
    dragging = false;
  }}
  ondrop={onDrop}
  role="region"
  aria-label="Save file loader"
>
  <h2>Load your save</h2>
  <p class="muted">
    Drop your <code>{SAVE_FILE_NAME}</code> file here, or pick it below. The file stays in your browser. Nothing is
    uploaded.
  </p>

  <div class="actions">
    <button type="button" class="primary" onclick={() => input?.click()}>Choose file</button>
    <input
      bind:this={input}
      type="file"
      accept=".json,application/json"
      hidden
      onchange={(event) => void accept(event.currentTarget.files)}
    />
  </div>

  {#if error !== null}
    <p class="error" role="alert">{error}</p>
  {/if}

  <details>
    <summary class="small muted">Where is the file?</summary>
    <ul class="small muted paths">
      <li><b>Steam, Linux</b>: <code>~/.local/share/Steam/userdata/&lt;id&gt;/1794680/remote/SaveData</code></li>
      <li>
        <b>Steam, Windows</b>: <code>%USERPROFILE%\AppData\Roaming\Vampire_Survivors_&lt;id&gt;\saves</code> or the same
        <code>userdata</code> path under the Steam folder
      </li>
      <li><b>Steam, macOS</b>: <code>~/Library/Application Support/Steam/userdata/&lt;id&gt;/1794680/remote</code></li>
      <li>
        <b>Itch or standalone</b>: <code>~/.config/Vampire_Survivors/saves</code> or the matching
        <code>AppData</code> folder
      </li>
    </ul>
  </details>
</div>

<style>
  .drop {
    border-style: dashed;
    border-width: 2px;
    display: grid;
    gap: 0.6rem;
  }

  .drop.dragging {
    border-color: var(--accent);
    background: #c0392b18;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .error {
    color: var(--accent-soft);
    margin: 0;
  }

  .paths {
    margin: 0.4rem 0 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.25rem;
  }

  code {
    background: var(--bg-sunken);
    border-radius: 4px;
    padding: 0.05rem 0.3rem;
    word-break: break-all;
  }
</style>
