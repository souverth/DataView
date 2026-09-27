<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useHotkeys } from '~/core/composables/useHotKeys';
import { isPWA } from '~/core/helpers';
import { useAppConfigStore } from '~/core/stores/appConfigStore';
import { useTabViewsStore } from '~/core/stores/useTabViewsStore';
import { ActivityBarHorizontal } from '../../activity-bar';
import { getTabViewMinWidth } from '../tabViewContainerLayout';
import TabViews from './TabViews.vue';

const props = defineProps<{
  primarySideBarWidth: number;
}>();

const route = useRoute();

const appConfigStore = useAppConfigStore();
const tabsStore = useTabViewsStore();

const { isPrimarySidebarCollapsed, isSecondSidebarCollapsed } =
  storeToRefs(appConfigStore);

const isPWAApp = computed(() => isPWA());

const minWidth = computed(() => {
  return getTabViewMinWidth({
    primarySideBarWidth: props.primarySideBarWidth,
    sidebarWidthPercentage: appConfigStore.layoutSize[0],
  });
});

const isAccessRightPanel = computed(() => {
  if (route.meta.notAllowRightPanel) return false;
  return true;
});

// Tab keyboard shortcuts
useHotkeys([
  {
    key: 'meta+w',
    callback: () => {
      if (tabsStore.activeTab) {
        tabsStore.closeTab(tabsStore.activeTab.id);
      }
    },
  },
  {
    key: 'meta+alt+t',
    callback: () => {
      if (tabsStore.activeTab) {
        tabsStore.closeOtherTab(tabsStore.activeTab.id);
      }
    },
  },
]);
</script>

<template>
  <div
    :class="[
      'w-screen h-9 select-none border-b pr-2 bg-sidebar-accent/50!',

      isPWAApp && isPrimarySidebarCollapsed ? 'pl-[6rem]' : '',
      isPWAApp && 'h-10.5 header-tab-view-pwa',
    ]"
  >
    <div class="flex justify-between items-center h-full">
      <div
        class="flex items-center gap-1 h-full px-1"
        :style="{
          minWidth,
          justifyContent: !isPrimarySidebarCollapsed
            ? 'space-between'
            : 'center',
        }"
      >
        <div
          v-if="isPWAApp && !isPrimarySidebarCollapsed"
          class="vitrual-light-trafic-button"
        ></div>

        <div
          :class="['flex justify-center w-full']"
          v-if="!isPrimarySidebarCollapsed"
        >
          <ActivityBarHorizontal />
        </div>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="iconSm"
              @click="appConfigStore.onToggleActivityBarPanel()"
            >
              <Icon
                name="hugeicons:sidebar-left"
                class="size-5!"
                v-if="isPrimarySidebarCollapsed"
              />
              <Icon name="hugeicons:sidebar-left-01" class="size-5!" v-else />

              <!-- <PanelLeftOpen class="size-4" v-if="isPrimarySideBarPanelCollapsed" />
          <PanelLeftClose class="size-4" v-else /> -->
            </Button>
          </TooltipTrigger>
          <TooltipContent> Toggle Left Sidebar (⌘B) </TooltipContent>
        </Tooltip>
      </div>

      <TabViews />

      <div class="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              v-if="isAccessRightPanel"
              variant="ghost"
              size="iconSm"
              @click="appConfigStore.onToggleSecondSidebar()"
            >
              <Icon
                name="hugeicons:sidebar-right"
                class="size-5!"
                v-if="isSecondSidebarCollapsed"
              />
              <Icon name="hugeicons:sidebar-right-01" class="size-5!" v-else />
            </Button>
          </TooltipTrigger>
          <TooltipContent> Toggle Right Sidebar (⌘⌥B) </TooltipContent>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style>
/*TODO: use to control logic , dont use css env() -> import { useScreenSafeArea } from '@vueuse/core' */
.header-tab-view-pwa {
  width: calc(
    env(titlebar-area-width, 100vw) + env(titlebar-area-x)
  ) !important;
}

.vitrual-light-trafic-button {
  min-width: env(titlebar-area-x);
}
</style>
