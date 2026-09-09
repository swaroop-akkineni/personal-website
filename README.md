# A life in messages

A responsive, iMessage-inspired personal website. Plain HTML, CSS, and JavaScript; no dependencies or build step.

## Make it yours

Edit `messages.json` to change the introduction, sample milestone, and profile links. Edit `index.html` for the header name and initial. The milestone is sample copy, not a verified biography.

Each section has a unique lowercase `id`, accessible `label`, displayed `dateLabel`, and `messages` array. Optional fields are `date` (`YYYY-MM-DD`), `sample`, and `receipt`. Sections and messages display in array order.

- Text messages use `type: "incoming"` or `"outgoing"` and a `paragraphs` array. Use `\n` for a line break. Optional fields: `label`, `title`, `footerLabel`, and `tail: true`.
- Link cards use `type: "link"`, `url`, `artTitle`, `artCaption`, `title`, and `description`. Links support HTTP, HTTPS, and email URLs.

`render-messages.js` handles the UI. `renderMessages(data)` accepts an array or a JSON string and returns escaped HTML. HTML inside message text displays literally. Colors and layout live in `styles.css`.

The renderer fetches `messages.json` using a relative URL, so it works on GitHub Pages, including repository subpaths. The page requires JavaScript and an HTTP preview; opening `index.html` directly with `file://` cannot load the JSON.

Run the renderer check with `node test-messages.cjs`.

## Preview

Run `python3 -m http.server 8000 --bind 127.0.0.1` in this directory and visit http://127.0.0.1:8000.

## Publish on GitHub Pages

1. Push these files to a GitHub repository on the `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, then **main** and **/(root)**, and save.
4. GitHub will show your published URL there when deployment completes.

For a repository named `YOUR-USERNAME.github.io`, the site lives at `https://YOUR-USERNAME.github.io/`. Other repository names publish at `https://YOUR-USERNAME.github.io/REPOSITORY/`. The relative stylesheet link works with either.

See [GitHub’s publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
