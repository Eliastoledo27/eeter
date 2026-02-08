import { getModulesForRole, type UserRole } from '../config/roles';

console.log('--- RUNNING RBAC TESTS ---');

const tests: Array<{
  role: UserRole
  expectedModules: string[]
  desc: string
}> = [
    {
      role: 'admin',
      expectedModules: ['dashboard', 'catalog', 'academy', 'ranking', 'users', 'products', 'messages'],
      desc: 'Admin should have access to all modules'
    },
    {
      role: 'support',
      expectedModules: ['dashboard', 'catalog', 'academy', 'users'],
      desc: 'Support should have access to support modules'
    },
    {
      role: 'reseller',
      expectedModules: ['dashboard', 'catalog', 'academy', 'ranking', 'messages'],
      desc: 'Reseller should have access to sales modules'
    },
    {
      role: 'user',
      expectedModules: ['dashboard', 'catalog', 'academy', 'messages'],
      desc: 'User should have basic access'
    }
  ];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  const modules = getModulesForRole(test.role).map(m => m.id);
  const missing = test.expectedModules.filter(m => !modules.includes(m));
  const extra = modules.filter(m => !test.expectedModules.includes(m));

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✅ ${test.desc}`);
    passed++;
  } else {
    console.log(`❌ ${test.desc}`);
    console.log(`   Expected: ${test.expectedModules.join(', ')}`);
    console.log(`   Got:      ${modules.join(', ')}`);
    failed++;
  }
});

console.log('--------------------------');
console.log(`Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
