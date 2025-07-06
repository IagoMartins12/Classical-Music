// scripts/backup/scheduled-backup.ts
import cron from 'node-cron'
import { performBackup } from './backup'
import { cleanupOldBackups } from './backup-utils'
import fs from 'fs/promises'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'scripts', 'backup', 'logs', 'scheduler.log')

async function log(message: string): Promise<void> {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`
  
  console.log(message)
  await fs.appendFile(LOG_FILE, logMessage).catch(console.error)
}

// Backup diário às 2:00 AM
cron.schedule('0 2 * * *', async () => {
  await log('🕐 Iniciando backup agendado...')
  
  try {
    await performBackup()
    await log('✅ Backup agendado concluído com sucesso')
    
    // Cleanup de backups antigos a cada backup
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30')
    await cleanupOldBackups(retentionDays)
    await log(`🗑️  Cleanup executado (retenção: ${retentionDays} dias)`)
    
  } catch (error) {
    await log(`❌ Erro no backup agendado: ${error}`)
  }
})

// Verificação de saúde a cada hora
cron.schedule('0 * * * *', async () => {
  await log('🏥 Verificação de saúde do sistema de backup')
  
  // Verificar espaço em disco, conectividade do banco, etc.
  // Implementar conforme necessário
})

console.log('⏰ Sistema de backup agendado iniciado')
