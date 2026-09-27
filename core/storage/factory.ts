/**
 * Factory that builds the storage APIs used by the Pinia stores.
 * All data lives in the browser: IDB entity storage singletons (localforage / IndexedDB).
 */
import {
  workspaceStorage,
  connectionStorage,
  workspaceStateStorage,
  tabViewStorage,
  quickQueryLogStorage,
  rowQueryFileStorage,
  environmentTagStorage,
  appConfigStorage,
  agentStateStorage,
  migrationStateStorage,
} from './entities';
import type { StorageApis } from './types';

/**
 * Returns the storage implementation.
 * Call this once at store initialization — do NOT call on every operation.
 */
export function createStorageApis(): StorageApis {
  return {
    workspaceStorage: {
      getAll: () => workspaceStorage.getAll(),
      getOne: id => workspaceStorage.getOne(id),
      create: ws => workspaceStorage.create(ws),
      update: ws => workspaceStorage.update(ws),
      /** Cascade: deletes connections, states, logs, files */
      delete: async id => {
        const deleted = await workspaceStorage.delete(id);
        if (!deleted) return null;
        const conns = await connectionStorage.getMany({
          workspaceId: id,
        } as never);
        await Promise.all(conns.map(c => connectionStorage.delete(c.id)));
        await Promise.all(
          (await tabViewStorage.getAll())
            .filter(tv => tv.workspaceId === id)
            .map(tv => tabViewStorage.delete(tv.id))
        );
        await rowQueryFileStorage.deleteFileByWorkspaceId({ wsId: id });
        await workspaceStateStorage.delete(id);
        await quickQueryLogStorage.deleteByConnectionProps({ workspaceId: id });
        return deleted;
      },
    },
    connectionStorage:
      connectionStorage as unknown as StorageApis['connectionStorage'],
    workspaceStateStorage:
      workspaceStateStorage as unknown as StorageApis['workspaceStateStorage'],
    tabViewStorage: tabViewStorage as unknown as StorageApis['tabViewStorage'],
    quickQueryLogStorage: {
      getAll: () => quickQueryLogStorage.getAll(),
      getByContext: ctx => quickQueryLogStorage.getByContext(ctx),
      create: log => quickQueryLogStorage.create(log),
      delete: props => quickQueryLogStorage.deleteByConnectionProps(props),
    },
    rowQueryFileStorage:
      rowQueryFileStorage as unknown as StorageApis['rowQueryFileStorage'],
    environmentTagStorage:
      environmentTagStorage as unknown as StorageApis['environmentTagStorage'],
    appConfigStorage: {
      get: () => appConfigStorage.get(),
      save: state => appConfigStorage.save(state),
      delete: () => appConfigStorage.deleteConfig(),
    },
    agentStorage: {
      get: () => agentStateStorage.get(),
      save: state => agentStateStorage.save(state),
      delete: () => agentStateStorage.deleteState(),
    },
    migrationStateStorage: {
      get: () => migrationStateStorage.get(),
      save: names => migrationStateStorage.save(names),
      clear: () => migrationStateStorage.clear(),
    },
  };
}
