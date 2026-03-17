

## Change Team Credits on Homepage

Replace the current "Made by: Chris Adabla, Eliana Adzo Amaglo, Chris Ameyaw Kwaku Junior" text at the bottom of the home page with "BYTECRAFT".

### File Change
**`src/pages/Index.tsx`** — Update the credits section (around line 111-113):

Replace:
```tsx
<p>Made by: <span className="text-white/80 font-medium">Chris Adabla</span>, <span className="text-white/80 font-medium">Eliana Adzo Amaglo</span>, <span className="text-white/80 font-medium">Chris Ameyaw Kwaku Junior</span></p>
```

With:
```tsx
<p className="text-white/80 font-semibold tracking-widest text-base">BYTECRAFT</p>
```

