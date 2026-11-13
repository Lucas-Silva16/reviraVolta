export function BottleArt() {
  return <div className="bottle-scene" aria-hidden="true"><svg viewBox="0 0 460 285" fill="none">
    <defs><linearGradient id="water" x1="210" y1="80" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stopColor="var(--accent)"/><stop offset="1" stopColor="var(--water)"/></linearGradient><linearGradient id="glass" x1="190" y1="60" x2="290" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="var(--surface)"/><stop offset="1" stopColor="var(--accent)"/></linearGradient></defs>
    <ellipse cx="233" cy="245" rx="142" ry="18" fill="var(--ink)" opacity=".08"/>
    <circle cx="233" cy="135" r="108" fill="var(--surface-strong)"/>
    <path d="M114 160c-35-4-52-25-44-53 33 3 50 21 44 53Z" fill="var(--water)"/><path d="M117 212c-8-40-8-67-27-85" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M111 190c-34 4-56-12-56-39 34-5 54 8 56 39Z" fill="var(--accent)"/>
    <path d="M341 207c1-42 13-77 34-105" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"/><path d="M352 160c-19-28-11-49 12-57 16 26 12 45-12 57Z" fill="var(--water)"/><path d="M355 156c29-16 49-9 53 15-25 17-46 10-53-15Z" fill="var(--accent)"/>
    <g transform="rotate(9 230 140)"><path d="M207 46h45v24c0 13 32 19 32 44v108c0 12-9 20-22 20h-64c-13 0-22-8-22-20V114c0-25 31-31 31-44V46Z" fill="url(#glass)" stroke="var(--ink)" strokeWidth="2"/><path d="M180 135c21-11 38 10 55 4 20-6 30-11 45-4v86c0 10-7 17-18 17h-64c-11 0-18-7-18-17v-86Z" fill="url(#water)"/><rect x="203" y="30" width="53" height="24" rx="7" fill="var(--primary)"/><path d="M211 36v12m9-12v12m9-12v12m9-12v12m9-12v12" stroke="var(--accent)" strokeWidth="2"/><path d="M191 108v99" stroke="white" strokeWidth="6" opacity=".55" strokeLinecap="round"/><circle cx="230" cy="179" r="25" fill="var(--surface)"/><path d="M230 162c-4 7-12 15-12 21a12 12 0 0 0 24 0c0-6-8-14-12-21Z" fill="var(--primary)"/></g>
    <path d="M312 73c20 10 33 29 35 50m-7-5 7 7 5-9M151 218c-20-10-33-29-35-50m7 5-7-7-5 9" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="150" cy="76" r="5" fill="var(--water)"/><circle cx="316" cy="199" r="4" fill="var(--water)"/><path d="M328 41v12m-6-6h12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
  </svg><span className="art-label">A tua garrafa tem mais voltas para dar.</span></div>;
}
