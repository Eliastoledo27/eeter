param (
    [string]$Action = "Reset" # Options: Reset, Stop, Audit
)

$LogFile = "$PSScriptRoot\..\logs\network_audit.log"
$TargetPorts = @(3000, 3001)

# Ensure log directory exists
$LogDir = Split-Path $LogFile
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

function Log-Message {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    Write-Host $LogEntry -ForegroundColor Cyan
}

function Get-PortProcess {
    param([int]$Port)
    $Netstat = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"
    if ($Netstat) {
        # Parse PID (last token) from the first match
        # We assume one process owns the port, even if binding multiple interfaces
        $FirstMatch = $Netstat | Select-Object -First 1
        $Parts = $FirstMatch.ToString().Trim() -split "\s+"
        $TargetPid = $Parts[-1]
        return $TargetPid
    }
    return $null
}

function Stop-Port {
    param([int]$Port)
    $PidToDelete = Get-PortProcess -Port $Port
    if ($PidToDelete) {
        Log-Message "Found process $PidToDelete listening on port $Port. Stopping..."
        try {
            Stop-Process -Id $PidToDelete -Force -ErrorAction Stop
            Log-Message "Process $PidToDelete stopped successfully."
        } catch {
            Log-Message "Error stopping process ${PidToDelete}: $_"
        }
    } else {
        Log-Message "No process found listening on port $Port."
    }
}

function Verify-Closed {
    param([int]$Port)
    $PidCheck = Get-PortProcess -Port $Port
    if ($PidCheck) {
        Log-Message "WARNING: Port $Port is still open (PID $PidCheck)."
        return $false
    } else {
        Log-Message "Verified: Port $Port is closed."
        return $true
    }
}

Log-Message "=== Starting Network Management Procedure (Action: $Action) ==="

if ($Action -eq "Audit" -or $Action -eq "Reset" -or $Action -eq "Stop") {
    Log-Message "Step 1: Identifying open ports..."
    foreach ($Port in $TargetPorts) {
        $PidFound = Get-PortProcess -Port $Port
        if ($PidFound) {
            $ProcName = (Get-Process -Id $PidFound).ProcessName
            Log-Message "Port $Port is OPEN (PID: $PidFound, Process: $ProcName)"
        } else {
            Log-Message "Port $Port is CLOSED"
        }
    }
}

if ($Action -eq "Reset" -or $Action -eq "Stop") {
    Log-Message "Step 2: Stopping services on target ports..."
    foreach ($Port in $TargetPorts) {
        Stop-Port -Port $Port
    }

    Log-Message "Step 3: Verifying port closure..."
    foreach ($Port in $TargetPorts) {
        Verify-Closed -Port $Port
    }
}

if ($Action -eq "Reset") {
    Log-Message "Step 4: Ready to reopen ports."
    Log-Message "Instruction: Run 'npm run dev' to restart the application services."
    # Note: We don't auto-start here because it blocks the script or requires a new window context.
    # The agent/user should trigger the start command.
}

Log-Message "=== Procedure Completed ==="
