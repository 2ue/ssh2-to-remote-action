import { run } from './main'

// GitHub Action 入口点
run().catch(error => {
  console.error('Action failed:', error)
  process.exit(1)
})
