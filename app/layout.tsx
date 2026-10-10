import type {Metadata} from 'next';
import './globals.css';
import './ux.css';
import './dr.css';
// Shared story-page layer (beats, indexes, register tables, st-link). Loaded once here: imported per page it
// became a CSS-only chunk shared by five entries, and the bundler preloaded a JS stub it never emitted.
import './story.css';
import './visual-refinement.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './company-pages.css';
import './v3.css';
import './modern-v11.css';
import './site-refinement.css';
import './theme-dgs.css';
import {url} from './routes';
export const metadata:Metadata={title:'DeepGrid Semi: Silicon for Physical Systems',description:'Motion, power, sensing, interfaces and safety: explore DeepGrid’s mature-node silicon portfolio, strategy and DG32 engineering evidence.',icons:{icon:url('/brand/deepgrid-d-64.png'),apple:url('/brand/deepgrid-d-192.png')}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 // content is rewritten by scripts/package-pages.mjs to the real PAGES_BASE; "/" is the dev value.
 return <html lang="en" className="dark"><head><meta name="site-base" content="/"/><meta name="theme-color" content="#0a0a0a"/>{/* Paths are lower case. A typed /About lands on /about before paint, locally and on Pages (static asset folders keep their case). */}<script dangerouslySetInnerHTML={{__html:"(function(){var p=location.pathname;if(!/[A-Z]/.test(p))return;var m=document.querySelector('meta[name=site-base]');var b=m?m.content:'/';if(p.toLowerCase().indexOf(b.toLowerCase())!==0)return;var r=p.slice(b.length);if(/^(downloads|_next|graphrag|media|decks|diagrams|images|models|ort|brand|vendor)\\//i.test(r))return;location.replace(b+r.toLowerCase()+location.search+location.hash)})()"}}/></head><body>{children}</body></html>;
}
