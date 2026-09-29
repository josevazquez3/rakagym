export const PAGE_SIZE = 10;

export function getPageCount(total: number) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), totalPages);
}
