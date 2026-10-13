'use client';
import {useCallback, useEffect, useState} from 'react';
import raw from '../portfolio-data.json';
import {loadLiveTables, toPortfolio, type PortfolioData, type Provenance} from './portfolio-facts';

const built = raw as unknown as PortfolioData;

/** The checked snapshot renders immediately. A bounded, validated refresh replaces all tables together. */
export function usePortfolio() {
  const [request, setRequest] = useState(0);
  const [{d, prov}, setData] = useState<{d: PortfolioData; prov: Provenance & {pending?: boolean}}>({d: built, prov: {live: false, pending: true}});
  useEffect(() => {
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 12000);
    let disposed = false;
    setData(current => ({...current, prov: {...current.prov, pending: true}}));
    void loadLiveTables(fetch, ac.signal).then(result => {
      if (disposed) return;
      if (result && !result.failures.length) setData({d: toPortfolio(result.tables, built.model), prov: {live: true,
        readAt: new Date().toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'})}});
      else setData({d: built, prov: {live: false}});
    }).finally(() => clearTimeout(timeout));
    return () => { disposed = true; clearTimeout(timeout); ac.abort(); };
  }, [request]);
  const refresh = useCallback(() => setRequest(n => n + 1), []);
  return {d, prov, refresh};
}
