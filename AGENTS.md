<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Portfolio architecture
- Keep translations in a typed shared content catalog and language state in the shared provider so switching language updates every page without navigation resets.
- Use separate TanStack leaf routes for portfolio sections and a shared portfolio shell so every section can be linked directly and has its own metadata.
- Keep personal contact links and unverified accomplishments clearly unavailable until actual user-supplied URLs and data are provided, rather than fabricating identity or results.
- Define all visual roles, type scales, spacing, surfaces, and effects centrally in src/styles.css; shared Button variants consume these tokens so changes stay consistent across pages.
