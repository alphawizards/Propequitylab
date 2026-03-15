# PropEquityLab Database Backup Script
# Runs daily at 2:00 AM via OpenClaw cron

param(
    [string]$BackupDir = "C:\backups\propequitylab",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$pgDump = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

# Create backup directory if needed
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$backupFile = Join-Path $BackupDir "propequitylab_$timestamp.sql"

try {
    Write-Output "[$(Get-Date)] Starting database backup..."
    
    # Run pg_dump (verbose output goes to stderr, redirect to stdout)
    $result = & $pgDump -h localhost -U postgres -d propequitylab -f $backupFile --no-owner --no-privileges --format=plain 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }
    
    # Compress the backup
    $compressedFile = "$backupFile.zip"
    Compress-Archive -Path $backupFile -DestinationPath $compressedFile -Force
    Remove-Item $backupFile -Force
    
    $finalSize = (Get-Item $compressedFile).Length / 1MB
    Write-Output ("[$(Get-Date)] Backup completed: propequitylab_$timestamp.sql.zip ({0:N2} MB)" -f $finalSize)
    
    # Clean up old backups
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    Get-ChildItem $BackupDir -Filter "*.zip" | 
        Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
        ForEach-Object {
            Remove-Item $_.FullName -Force
            Write-Output "[$(Get-Date)] Deleted old backup: $($_.Name)"
        }
    
    # Log success
    Add-Content -Path "$BackupDir\backup.log" -Value ("[$(Get-Date)] SUCCESS: propequitylab_$timestamp.sql.zip ({0:N2} MB)" -f $finalSize)
    
} catch {
    $errorMsg = $_.Exception.Message
    Write-Error "[$(Get-Date)] BACKUP FAILED: $errorMsg"
    Add-Content -Path "$BackupDir\backup.log" -Value "[$(Get-Date)] FAILED: $errorMsg"
    exit 1
}
