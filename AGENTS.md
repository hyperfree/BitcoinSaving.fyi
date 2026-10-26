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

- Appearance is managed by the shared ThemeSwitch with an early head script and a root `dark` class; this keeps system preference, saved choice, and portaled dialogs consistent without a light flash.
- Banknote cards scope their surface tokens and dark-mode inactive filters separately so selected/hovered imagery and light-mode styling remain independent.
- Buttons, inputs and chips use the `rounded-control` radius token (and `rounded-control-inner` for elements nested inside a control) instead of `rounded-full`; only the floating dock and dot markers stay fully round, so all controls share one squircle language.
