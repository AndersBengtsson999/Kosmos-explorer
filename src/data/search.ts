import type {Star} from './catalog';
import {distance} from '../math/coordinates';
export type SortOrder = 'distance' | 'name';
export const PAGE_SIZE = 50;
export function searchStars(stars: Star[], query: string, order: SortOrder) {
  const text = query.trim().toLocaleLowerCase('sv');
  return stars.filter(star => `${star.name} ${star.id}`.toLocaleLowerCase('sv').includes(text))
    .sort((a, b) => order === 'name' ? a.name.localeCompare(b.name, 'sv') : distance(a.position) - distance(b.position));
}
