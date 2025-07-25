// scripts/backup/backup-utils.ts
import fs from 'fs/promises'
import path from 'path'

// Utilitário para cleanup de backups antigos
export async function cleanupOldBackups(daysToKeep: number = 30): Promise<void> {
  const backupsDir = path.join(process.cwd(), 'backups')
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  try {
    const entries = await fs.readdir(backupsDir, { withFileTypes: true })
    let removedCount = 0
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = path.join(backupsDir, entry.name)
        const stats = await fs.stat(dirPath)
        
        if (stats.birthtime < cutoffDate) {
          await fs.rm(dirPath, { recursive: true })
          console.log(`🗑️  Removido backup antigo: ${entry.name}`)
          removedCount++
        }
      }
    }
    
    console.log(`✅ Cleanup concluído: ${removedCount} backups removidos (mantidos dos últimos ${daysToKeep} dias)`)
  } catch (error) {
    console.error('❌ Erro durante cleanup:', error)
  }
}

// Utilitário para verificar integridade do backup
export async function verifyBackupIntegrity(backupPath: string): Promise<boolean> {
  try {
    const backupContent = await fs.readFile(backupPath, 'utf8')
    const backupData = JSON.parse(backupContent)
    
    // Verificações básicas
    const hasTimestamp = !!backupData.timestamp
    const hasMetadata = !!backupData.metadata
    const hasData = !!backupData.data && typeof backupData.data === 'object'
    
    let totalRecords = 0
    for (const [collection, data] of Object.entries(backupData.data)) {
      if (Array.isArray(data)) {
        totalRecords += data.length
      }
    }
    
    const recordsMatch = totalRecords === backupData.metadata.totalRecords
    
    console.log('🔍 Verificação de integridade:')
    console.log(`   Timestamp: ${hasTimestamp ? '✓' : '✗'}`)
    console.log(`   Metadata: ${hasMetadata ? '✓' : '✗'}`)
    console.log(`   Dados: ${hasData ? '✓' : '✗'}`)
    console.log(`   Contagem de registros: ${recordsMatch ? '✓' : '✗'} (${totalRecords}/${backupData.metadata.totalRecords})`)
    
    const isValid = hasTimestamp && hasMetadata && hasData && recordsMatch
    console.log(`📋 Resultado: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`)
    
    return isValid
  } catch (error) {
    console.error('❌ Erro verificando integridade:', error)
    return false
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2]
  const args = process.argv.slice(3)
  
  switch (command) {
    case 'cleanup':
      const days = parseInt(args[0]) || 30
      await cleanupOldBackups(days)
      break
      
    case 'verify':
      const backupPath = args[0]
      if (!backupPath) {
        console.error('❌ Forneça o caminho do backup para verificar')
        process.exit(1)
      }
      await verifyBackupIntegrity(backupPath)
      break
      
    default:
      console.log('🔧 Utilitários de Backup')
      console.log('')
      console.log('Comandos disponíveis:')
      console.log('  cleanup <days>  - Limpar backups antigos')
      console.log('  verify <path>   - Verificar integridade do backup')
      console.log('')
      console.log('Exemplos:')
      console.log('  tsx scripts/backup/backup-utils.ts cleanup 30')
      console.log('  tsx scripts/backup/backup-utils.ts verify ./backups/backup-xxx/backup.json')
  }
}

if (require.main === module) {
  main().catch(console.error)
}
