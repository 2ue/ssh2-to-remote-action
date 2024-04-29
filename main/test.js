const { execSync } = require('child_process')

execSync('ls -al', { stdio: 'inherit' })
