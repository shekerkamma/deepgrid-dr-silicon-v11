import type {Metadata} from 'next';

// The page is a client component, so its title is set here, in the static HTML. Like /plan, plan targets are not
// offered to search engines: read out of context in a search result they look like results.
export const metadata: Metadata = {title: 'SKU portfolio · DeepGrid Semi', robots: {index: false, follow: false}};

export default function Layout({children}: {children: React.ReactNode}) {
  return children;
}
