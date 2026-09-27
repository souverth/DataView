<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsModal } from '~/core/contexts/useSettingsModal';

const search = defineModel<string>('search', { default: '' });

defineProps<{
  isShowButtonCreate: boolean;
  isShowButtonRestore?: boolean;
}>();

const emit = defineEmits(['create', 'restore']);
const { openSettings } = useSettingsModal();
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative flex-1 min-w-0">
      <Icon
        name="hugeicons:search-01"
        class="absolute left-2.5 -translate-y-1/2 top-1/2 size-4"
      />
      <Input
        type="text"
        v-model="search"
        placeholder="Search workspaces..."
        class="pl-10 w-full h-8"
      />
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <Button
        v-if="isShowButtonRestore"
        type="button"
        variant="outline"
        size="sm"
        @click="emit('restore')"
      >
        <Icon name="lucide:upload" />
        Restore Data
      </Button>
      <Button
        v-if="isShowButtonCreate"
        variant="outline"
        size="sm"
        @click="emit('create')"
      >
        <Icon name="lucide:plus" />
        New Workspace
      </Button>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            @click="openSettings()"
          >
            <Icon name="hugeicons:settings-01" class="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent> Settings </TooltipContent>
      </Tooltip>
    </div>
  </div>
</template>
