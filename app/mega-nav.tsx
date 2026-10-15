'use client';
// v3 primary menu: dropdowns per subject, on the pattern of deepgrid-platform-v2's menu (and its lessons).
// - Menu aim: while a panel is open, another button takes over only after the pointer rests on it (180 ms), and
//   leaving closes after 280 ms, so a pointer crossing a neighbour on its way to a link keeps the panel.
// - One-column panels hang under their own button and are nudged back inside the viewport.
// - Escape closes and returns focus; Enter/Space open; the phone sheet scrolls and expands groups inline.
// Notes under each link are the target page's own heading, so the menu never says what the page does not.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { url, byId, type RouteId } from './routes';

type Item = { label: string; href: string; note?: string };
type Menu = { id: string; label: string; match: RouteId[]; items: Item[] };

const a = (path: string, hash = '') => url(path) + (hash ? '#' + hash : '');

const menuDefinitions: Menu[] = [
  {
    id: 'investors', label: 'Investors', match: ['brief', 'plan', 'portfolio'],
    items: [
      { label: 'Investment brief', href: a('/portfolio/brief'), note: 'What first-silicon funding buys, and what remains to be proven' },
      { label: 'Portfolio economics', href: a('/portfolio'), note: 'Readiness, unit costs and revenue assumptions' },
      { label: 'Business plan', href: a('/plan'), note: 'Revenue, cash and use of funds; disclosed plan targets' },
      { label: 'Markets & qualification', href: url('/portfolio/brief') + '?view=use-cases', note: 'First markets, approval windows and evaluation gaps' },
      { label: 'Request a discussion', href: url('/contact') + '?intent=investor', note: 'Investment, strategic partnership or data-room enquiry' },
    ],
  },
  {
    id: 'products', label: 'Products', match: ['products', 'procurement'],
    items: [
      { label: 'All product architectures', href: a('/products'), note: 'Motion, power, sensing, interfaces and integration' },
      { label: 'DG32 safety MCU', href: a('/products/sku-4'), note: 'Lockstep control and the hardware fault path' },
      { label: 'BLDC motor controller', href: a('/products/sku-1'), note: 'Motor control and its power stage' },
      { label: 'D100 Drone SoC', href: a('/products/d100'), note: 'Flight safety and perception compute' },
      { label: 'DG32 vs STM32G0', href: a('/procurement'), note: 'Control capabilities, electrical limits and readiness' },
    ],
  },
  {
    id: 'technology', label: 'Technology', match: ['technology', 'safety', 'control', 'die', 'package', 'evidence'],
    items: [
      { label: 'DG32 architecture', href: a('/technology'), note: 'DG32 control, fault and domain boundaries' },
      { label: 'Hardware fault response', href: a('/technology/safety'), note: 'From a wrong value to a safe bridge' },
      { label: 'Motor-control timing', href: a('/technology/control-loop'), note: 'The CPU runs two regulators, not the loop' },
      { label: 'Die architecture', href: a('/technology/die'), note: 'Functional blocks and a fixed safety core' },
      { label: 'Pinout & package', href: a('/technology/package'), note: '44 signals in a 9 × 9 mm package' },
      { label: 'Validation & readiness', href: a('/evidence'), note: 'Simulation, post-route evidence and silicon milestones' },
    ],
  },
  {
    id: 'usecases', label: 'Applications', match: ['applications', 'uc-motors', 'uc-vehicles', 'uc-defence', 'uc-grid', 'uc-boards'],
    items: [
      { label: 'Applications overview', href: a('/applications'), note: 'Match a system requirement to a product architecture' },
      { label: 'Motors and drives', href: a('/use-cases/motors'), note: 'One chip runs the motor, another can stop it safely' },
      { label: 'Vehicles', href: a('/use-cases/vehicles'), note: 'The battery, the brakes, the radar, the bus and the wiring zones' },
      { label: 'Defence, avionics and drones', href: a('/use-cases/defence'), note: 'Screened parts, and a failsafe that does not depend on software' },
      { label: 'Grid and metering', href: a('/use-cases/grid'), note: 'Measure the power and record tampering' },
      { label: 'Power supervision & interfaces', href: a('/use-cases/boards'), note: 'Supervisors and transceivers, where the volume is' },
    ],
  },
  {
    id: 'resources', label: 'Resources', match: ['resources', 'docs', 'videos', 'read', 'ask'],
    items: [
      { label: 'Technical specifications & guides', href: a('/resources/docs'), note: 'Datasheets, guides and the documents behind the claims' },
      { label: 'Architecture & electrical specifications', href: a('/resources') },
      { label: 'Product & system walkthroughs', href: a('/resources/videos') },
      { label: 'Ask DeepGrid', href: a('/ask'), note: 'Product questions with engineering references' },
    ],
  },
  {
    id: 'about', label: 'Company', match: ['about', 'team', 'recognition', 'company'],
    items: [
      { label: 'Company profile', href: a('/about'), note: 'A semiconductor company for edge AI, in Hyderabad' },
      { label: 'Portfolio strategy', href: a('/company'), note: 'First markets, product choices and development milestones' },
      { label: 'Leadership & team', href: a('/about/team'), note: 'Founders, board, engineers, advisors and partners' },
      { label: 'Achievements', href: a('/about/recognition'), note: 'Milestones and recognition' },
      // One extra About link, set only by builds that pass NEXT_PUBLIC_EXTRA_MENU_URL/_LABEL/_NOTE (the internal droplet:
      // scripts/build-droplet.sh). Next inlines them at build time and every word comes from the environment, so a
      // public build carries neither the link nor any label for it.
      ...(process.env.NEXT_PUBLIC_EXTRA_MENU_URL ? [{ label: process.env.NEXT_PUBLIC_EXTRA_MENU_LABEL || '', href: process.env.NEXT_PUBLIC_EXTRA_MENU_URL, note: process.env.NEXT_PUBLIC_EXTRA_MENU_NOTE }] : []),
    ],
  },
];

export const menus = ['products','usecases','technology','resources','about','investors'].map(id => menuDefinitions.find(menu => menu.id === id)!);

const canHover = () => typeof matchMedia !== 'undefined' && matchMedia('(min-width: 1101px) and (hover: hover)').matches;

export function MegaNav({ route, onNavigate, label = 'Primary navigation', compact = false }: { route: RouteId; onNavigate?: () => void; label?: string; compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const menuId = 'menu-' + useId().replace(/[^a-zA-Z0-9_-]/g, '') + '-';
  const root = useRef<HTMLElement>(null);
  const closing = useRef<number | undefined>(undefined);
  const switching = useRef<number | undefined>(undefined);

  const enter = (id: string) => {
    if (!canHover()) return;
    window.clearTimeout(closing.current);
    window.clearTimeout(switching.current);
    setOpen((cur) => {
      if (!cur || cur === id) return id;
      switching.current = window.setTimeout(() => setOpen(id), 180);
      return cur;
    });
  };
  const leave = () => {
    if (!canHover()) return;
    window.clearTimeout(switching.current);
    window.clearTimeout(closing.current);
    closing.current = window.setTimeout(() => setOpen(null), 280);
  };

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null); };
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const was = open; setOpen(null);
      (root.current?.querySelector(`[aria-controls="${menuId}${was}"]`) as HTMLElement | null)?.focus();
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open, menuId]);

  // Keep an open panel inside the viewport.
  useLayoutEffect(() => {
    const el = open ? (root.current?.querySelector('#' + menuId + open) as HTMLElement | null) : null;
    if (!el || getComputedStyle(el).position === 'static') return;
    el.style.translate = '';
    const r = el.getBoundingClientRect(), pad = 12;
    const dx = r.right > innerWidth - pad ? innerWidth - pad - r.right : r.left < pad ? pad - r.left : 0;
    if (dx) el.style.translate = dx + 'px 0';
  }, [open]);

  return (
    <nav className="mega-nav" aria-label={label} ref={root}>
      {!compact && <a href={url('/')} className={'mega-home' + (route === 'home' ? ' active' : '')} aria-current={route === 'home' ? 'page' : undefined} onClick={onNavigate}>
        <img src={url('/brand/deepgrid-d-64.png')} alt="" aria-hidden="true" width={20} height={20} />
        Deepgrid Semi
      </a>}
      {menus.map((m) => {
        const isOpen = open === m.id;
        const parent = byId[route].parent;
        const active = m.match.includes(route) || (parent === 'products' && route !== 'portfolio' && m.id === 'products');
        return (
          <div key={m.id} className="mega-item" onMouseEnter={() => enter(m.id)} onMouseLeave={leave}>
            <button type="button" className={'mega-trigger' + (active ? ' active' : '')} aria-expanded={isOpen} aria-controls={menuId + m.id} onClick={() => setOpen(isOpen ? null : m.id)}>
              {m.label}
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div id={menuId + m.id} className="mega-panel" hidden={!isOpen}>
              <ul>
                {m.items.map((it) => (
                  <li key={it.href + it.label}>
                    <a href={it.href} aria-current={it.href === url(byId[route].href) ? 'page' : undefined} onClick={() => { setOpen(null); onNavigate?.(); }}
                      {...(/^https?:\/\//.test(it.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      <span>{it.label}</span>
                      {it.note && <small>{it.note}</small>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      <a href={url('/contact')} className={'mega-link' + (route === 'contact' ? ' active' : '')} aria-current={route === 'contact' ? 'page' : undefined} onClick={onNavigate}>
        Contact
      </a>
    </nav>
  );
}
