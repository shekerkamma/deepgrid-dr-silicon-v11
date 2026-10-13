import type {Metadata} from 'next';

// Client page, so the title is set here. Like /plan and /portfolio: plan targets, not offered to search engines.
export const metadata: Metadata = {title: 'Investor and buyer brief · DeepGrid Semi', robots: {index: false, follow: false}};

export default function Layout({children}: {children: React.ReactNode}) {
  return children;
}
