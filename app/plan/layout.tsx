import type {Metadata} from 'next';

// The page is a client component, so its title is set here, in the static HTML. Published (owner, 2026-10-12)
// but not offered to search engines: plan targets read out of context in a search result look like results.
export const metadata: Metadata = {title: 'Business plan · DeepGrid Semi', robots: {index: false, follow: false}};

export default function Layout({children}: {children: React.ReactNode}) {
  return children;
}
