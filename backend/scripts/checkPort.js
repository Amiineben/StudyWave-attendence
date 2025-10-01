/**
 * Port Conflict Checker and Resolver
 * Automatically checks if port is in use and provides solutions
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function checkPort(port = 5000) {
  console.log(`🔍 Checking if port ${port} is available...`);
  
  try {
    // Check if port is in use on Windows
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (stdout.trim()) {
      console.log(`❌ Port ${port} is already in use:`);
      console.log(stdout);
      
      // Extract PID from netstat output
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      });
      
      if (pids.size > 0) {
        console.log(`\n💡 To fix this, run one of these commands:`);
        console.log(`\n🔧 Option 1: Kill the process(es):`);
        pids.forEach(pid => {
          console.log(`   taskkill /PID ${pid} /F`);
        });
        
        console.log(`\n🔧 Option 2: Use a different port:`);
        console.log(`   Set PORT=3001 in your .env file`);
        console.log(`   Or: PORT=3001 npm run dev`);
        
        console.log(`\n🔧 Option 3: Update frontend to match:`);
        console.log(`   Update REACT_APP_API_URL in frontend/.env`);
        
        return false;
      }
    } else {
      console.log(`✅ Port ${port} is available!`);
      return true;
    }
  } catch (error) {
    if (error.code === 1) {
      // No output means port is free
      console.log(`✅ Port ${port} is available!`);
      return true;
    } else {
      console.error(`❌ Error checking port ${port}:`, error.message);
      return false;
    }
  }
}

async function killProcessOnPort(port = 5000) {
  console.log(`🔪 Attempting to kill processes on port ${port}...`);
  
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout.trim()) {
      console.log(`✅ No processes found on port ${port}`);
      return true;
    }
    
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && !isNaN(pid)) {
        pids.add(pid);
      }
    });
    
    for (const pid of pids) {
      try {
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Killed process ${pid}`);
      } catch (error) {
        console.log(`⚠️ Could not kill process ${pid}:`, error.message);
      }
    }
    
    // Verify port is now free
    const isNowFree = await checkPort(port);
    return isNowFree;
    
  } catch (error) {
    if (error.code === 1) {
      console.log(`✅ No processes found on port ${port}`);
      return true;
    } else {
      console.error(`❌ Error killing processes on port ${port}:`, error.message);
      return false;
    }
  }
}

async function findAvailablePort(startPort = 5000) {
  console.log(`🔍 Finding available port starting from ${startPort}...`);
  
  for (let port = startPort; port < startPort + 100; port++) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      console.log(`✅ Found available port: ${port}`);
      return port;
    }
  }
  
  console.log(`❌ No available ports found in range ${startPort}-${startPort + 99}`);
  return null;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const port = parseInt(args[1]) || 5000;
  
  console.log('🚀 StudyWave Port Manager\n');
  
  switch (command) {
    case 'check':
      await checkPort(port);
      break;
      
    case 'kill':
      await killProcessOnPort(port);
      break;
      
    case 'find':
      await findAvailablePort(port);
      break;
      
    case 'auto':
      console.log(`🔄 Auto-resolving port ${port} conflicts...`);
      const isAvailable = await checkPort(port);
      if (!isAvailable) {
        const killed = await killProcessOnPort(port);
        if (!killed) {
          const newPort = await findAvailablePort(port + 1);
          if (newPort) {
            console.log(`\n💡 Suggestion: Use PORT=${newPort} in your .env file`);
          }
        }
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/checkPort.js check [port]  - Check if port is available');
      console.log('  node scripts/checkPort.js kill [port]   - Kill processes on port');
      console.log('  node scripts/checkPort.js find [port]   - Find next available port');
      console.log('  node scripts/checkPort.js auto [port]   - Auto-resolve conflicts');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/checkPort.js check 5000');
      console.log('  node scripts/checkPort.js kill 5000');
      console.log('  node scripts/checkPort.js auto 5000');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkPort, killProcessOnPort, findAvailablePort };
