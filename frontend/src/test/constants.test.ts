import { describe, it, expect } from 'vitest';
import { CATEGORIES, PRIORITIES, STATUSES, getCategoryInfo, getPriorityInfo, getStatusInfo } from '@/lib/constants';
import {
  COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES,
  type ComplaintCategory, type ComplaintPriority, type ComplaintStatus,
} from '@/lib/types';

describe('constants', () => {
  it('covers every enum value of the schema', () => {
    expect(CATEGORIES.map((c) => c.value).sort()).toEqual([...COMPLAINT_CATEGORIES].sort());
    expect(PRIORITIES.map((p) => p.value).sort()).toEqual([...COMPLAINT_PRIORITIES].sort());
    expect(STATUSES.map((s) => s.value).sort()).toEqual([...COMPLAINT_STATUSES].sort());
  });

  it('looks up category info and falls back to Other for unknown values', () => {
    expect(getCategoryInfo('water' as ComplaintCategory).label).toBe('Water');
    expect(getCategoryInfo('nonsense' as ComplaintCategory).value).toBe('other');
  });

  it('looks up priority info and falls back to Medium', () => {
    expect(getPriorityInfo('urgent' as ComplaintPriority).label).toBe('Urgent');
    expect(getPriorityInfo('nonsense' as ComplaintPriority).value).toBe('medium');
  });

  it('looks up status info and falls back to Pending', () => {
    expect(getStatusInfo('resolved' as ComplaintStatus).label).toBe('Resolved');
    expect(getStatusInfo('nonsense' as ComplaintStatus).value).toBe('pending');
  });
});
