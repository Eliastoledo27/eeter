import { getFirstName, getInitial } from '@/lib/dashboard-utils'

console.log('--- RUNNING DASHBOARD UTILS TESTS ---')

const cases: Array<{ name: string; run: () => void }> = [
  {
    name: 'getFirstName returns first token',
    run: () => {
      const result = getFirstName('Lucas Éter')
      if (result !== 'Lucas') throw new Error(`Expected Lucas, got ${result}`)
    },
  },
  {
    name: 'getFirstName falls back to Hola on empty',
    run: () => {
      const result = getFirstName('   ')
      if (result !== 'Hola') throw new Error(`Expected Hola, got ${result}`)
    },
  },
  {
    name: 'getFirstName falls back to Hola on null',
    run: () => {
      const result = getFirstName(null)
      if (result !== 'Hola') throw new Error(`Expected Hola, got ${result}`)
    },
  },
  {
    name: 'getInitial returns uppercase initial',
    run: () => {
      const result = getInitial('lucas')
      if (result !== 'L') throw new Error(`Expected L, got ${result}`)
    },
  },
  {
    name: 'getInitial falls back to ? on empty',
    run: () => {
      const result = getInitial('   ')
      if (result !== '?') throw new Error(`Expected ?, got ${result}`)
    },
  },
  {
    name: 'getInitial falls back to ? on undefined',
    run: () => {
      const result = getInitial(undefined)
      if (result !== '?') throw new Error(`Expected ?, got ${result}`)
    },
  },
]

let passed = 0
for (const t of cases) {
  try {
    t.run()
    console.log(`✅ ${t.name}`)
    passed++
  } catch (e: unknown) {
    console.error(`❌ ${t.name}`)
    console.error(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}

console.log(`Total: ${passed}/${cases.length}`)
