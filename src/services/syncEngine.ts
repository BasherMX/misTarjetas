// Motor de Sincronización Local-First Bidireccional (Delta Sync + Last-Write-Wins)
import { db } from '../db/schema';
import { supabase } from '../lib/supabase';
import type { SyncStatus } from '../types';

const LAST_SYNC_KEY = 'mistarjetas_last_sync_timestamp';

export class SyncEngine {
  private static isSyncing = false;

  // Ejecuta un ciclo de sincronización completo (Push cambios locales -> Pull deltas remotos)
  public static async syncAll(userId: string): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) return { success: true };
    this.isSyncing = true;

    try {
      // 1. Sincronizar cambios locales pendientes hacia Supabase (Push)
      await this.pushLocalChanges(userId);

      // 2. Obtener cambios remotos más recientes que la última sincronización (Pull Delta)
      const lastSync = localStorage.getItem(LAST_SYNC_KEY) || '1970-01-01T00:00:00.000Z';
      const nowSync = new Date().toISOString();

      await this.pullRemoteTable('accounts', lastSync);
      await this.pullRemoteTable('categories', lastSync);
      await this.pullRemoteTable('msi_plans', lastSync);
      await this.pullRemoteTable('transactions', lastSync);
      await this.pullRemoteTable('reconciliations', lastSync);

      localStorage.setItem(LAST_SYNC_KEY, nowSync);
      this.isSyncing = false;
      return { success: true };
    } catch (err: any) {
      this.isSyncing = false;
      return { success: false, error: err.message || 'Error en sincronización' };
    }
  }

  // Push: Enviar registros modificados/creados/eliminados en Dexie hacia Supabase
  private static async pushLocalChanges(userId: string) {
    const tables: Array<keyof typeof db & string> = [
      'accounts',
      'categories',
      'msi_plans',
      'transactions',
      'reconciliations',
    ];

    for (const tableName of tables) {
      const table = (db as any)[tableName];
      const pendingItems = await table
        .where('sync_status')
        .notEqual('synced' as SyncStatus)
        .toArray();

      for (const item of pendingItems) {
        const { sync_status, ...payload } = item;
        payload.user_id = userId;

        if (sync_status === 'deleted') {
          payload.deleted_at = payload.deleted_at || new Date().toISOString();
        }

        const { error } = await supabase.from(tableName).upsert(payload);
        if (!error) {
          await table.update(item.id, { sync_status: 'synced' });
        }
      }
    }
  }

  // Pull: Descargar cambios incrementales desde Supabase y aplicar resolución Last-Write-Wins (LWW)
  private static async pullRemoteTable(tableName: string, lastSync: string) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .gt('updated_at', lastSync);

    if (error || !data) return;

    const table = (db as any)[tableName];
    for (const remoteRecord of data) {
      const localRecord = await table.get(remoteRecord.id);

      if (!localRecord) {
        // Registro nuevo remoto
        await table.put({ ...remoteRecord, sync_status: 'synced' });
      } else {
        // Last-Write-Wins: Comparar timestamps de modificación
        const localDate = new Date(localRecord.updated_at).getTime();
        const remoteDate = new Date(remoteRecord.updated_at).getTime();

        if (remoteDate >= localDate && localRecord.sync_status === 'synced') {
          await table.put({ ...remoteRecord, sync_status: 'synced' });
        }
      }
    }
  }
}
