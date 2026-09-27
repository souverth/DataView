<script setup lang="ts">
import { cn } from '@/lib/utils';
import { isPWA } from '~/core/helpers';

const config = useRuntimeConfig();

const isAppVersion = computed(() => isPWA());
</script>

<template>
  <div
    :class="cn('w-full h-10.5 select-none pr-2 bg-sidebar flex justify-center')"
    v-if="isAppVersion"
  >
    <div class="flex w-full items-center gap-3 py-2 pr-2 pl-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div class="flex items-center space-x-2 pointer-events-none">
          <Avatar class="rounded-md!">
            <AvatarImage src="/logo.png" alt="@unovue" />
          </Avatar>

          <p class="text-xl font-medium">orcaq</p>
        </div>
        <span class="text-sm text-muted-foreground">
          v{{ config.public.version }}
        </span>
      </div>
    </div>
  </div>

  <div class="h-full overflow-y-auto flex flex-col">
    <slot />
  </div>
</template>
