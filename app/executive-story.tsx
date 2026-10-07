'use client';
import { createContext, useContext } from 'react';
import routes from './executive-routes.json';
import type { RouteId } from './routes';
import { url } from './routes';
import './executive-story.css';
export const StoryRoute = createContext<RouteId>('home');
export const routeStories = routes;
export function useRouteStory() {
  return routes[useContext(StoryRoute)];
}
export function DecisionClose({ route }: { route: RouteId }) {
  const s = routes[route];
  return (
    <section className="executive-decision" aria-label="Your next decision">
      <p className="dr-kicker">YOUR NEXT DECISION</p>
      <h2>{s.decision}</h2>
      <a className="text-link" href={url(s.next)}>
        Take the next step ↗
      </a>
    </section>
  );
}
