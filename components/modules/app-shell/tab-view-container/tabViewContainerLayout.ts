type GetTabViewMinWidthParams = {
  primarySideBarWidth: number;
  sidebarWidthPercentage: number | undefined;
};

export function getTabViewMinWidth({
  primarySideBarWidth,
  sidebarWidthPercentage,
}: GetTabViewMinWidthParams): string {
  if (!sidebarWidthPercentage) {
    return '2.25rem';
  }

  return `${primarySideBarWidth}px`;
}
