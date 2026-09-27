import { describe, expect, it } from 'vitest';
import { getTabViewMinWidth } from '@/components/modules/app-shell/tab-view-container/tabViewContainerLayout';

describe('getTabViewMinWidth', () => {
  it('returns collapsed width when the sidebar is hidden', () => {
    expect(
      getTabViewMinWidth({
        primarySideBarWidth: 320,
        sidebarWidthPercentage: 0,
      })
    ).toBe('2.25rem');
  });

  it('matches the primary sidebar width when it is visible', () => {
    expect(
      getTabViewMinWidth({
        primarySideBarWidth: 320,
        sidebarWidthPercentage: 30,
      })
    ).toBe('320px');
  });
});
