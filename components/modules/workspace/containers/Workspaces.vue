<script setup lang="ts">
import { ref } from 'vue';
import { ManagementConnectionModal } from '../../connection';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal.vue';
import RestoreDataModal from '../components/RestoreDataModal.vue';
import WorkspaceCard from '../components/WorkspaceCard.vue';
import WorkspaceHeader from '../components/WorkspaceHeader.vue';
import { useWorkspaces } from '../hooks/useWorkspaces';

const {
  workspaceStore,
  connectionStore,
  search,
  workspaceId,
  mappedWorkspaces,
  isOpenSelectConnectionModal,
  isOpenCreateWSModal,
  onSelectWorkspace,
} = useWorkspaces();

const isOpenRestoreDataModal = ref(false);
</script>

<template>
  <CreateWorkspaceModal
    v-model:open="isOpenCreateWSModal"
    :workspaceSeq="workspaceStore.workspaces.length"
    v-if="isOpenCreateWSModal"
  />

  <RestoreDataModal v-model:open="isOpenRestoreDataModal" />

  <ManagementConnectionModal
    v-model:open="isOpenSelectConnectionModal"
    :connections="connectionStore.getConnectionsByWorkspaceId(workspaceId)"
    :workspace-id="workspaceId"
  />
  <div class="flex flex-col h-full overflow-y-auto p-4 space-y-4 relative">
    <WorkspaceHeader
      v-model:search="search"
      @create="isOpenCreateWSModal = true"
      @restore="isOpenRestoreDataModal = true"
      :is-show-button-create="!!mappedWorkspaces.length"
      :is-show-button-restore="!!mappedWorkspaces.length"
    />

    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),300px))] gap-4 justify-start"
      v-if="mappedWorkspaces.length"
    >
      <WorkspaceCard
        v-for="workspace in mappedWorkspaces"
        :workspace="workspace"
        @on-select-workspace="onSelectWorkspace"
      />
    </div>
    <BaseEmpty
      v-else
      title="No workspaces found"
      desc="There is nothing here to show. Let's create your first workspace."
    >
      <div class="flex items-center gap-2">
        <Button variant="default" size="sm" @click="isOpenCreateWSModal = true">
          <Icon name="hugeicons:plus-sign" />
          New Workspace
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="isOpenRestoreDataModal = true"
        >
          <Icon name="lucide:upload" />
          Restore Data
        </Button>
      </div>
    </BaseEmpty>
  </div>
</template>
