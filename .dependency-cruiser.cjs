module.exports = {
  forbidden: [
    { name: 'core-is-pure', severity: 'error', from: { path: '^src/core/(?!.*\\.test\\.(ts|tsx)$)' }, to: { path: '^src/(?!core)' } },
    { name: 'hub-does-not-import-other-features', severity: 'error', from: { path: '^src/features/hub/' }, to: { path: '^src/features/(?!hub/)' } },
    { name: 'voice-does-not-import-other-features', severity: 'error', from: { path: '^src/features/voice/' }, to: { path: '^src/features/(?!voice/)' } },
    { name: 'scan-nav-does-not-import-other-features', severity: 'error', from: { path: '^src/features/scan-nav/' }, to: { path: '^src/features/(?!scan-nav/)' } },
    { name: 'keyboard-does-not-import-other-features', severity: 'error', from: { path: '^src/features/keyboard/' }, to: { path: '^src/features/(?!keyboard/)' } },
    { name: 'lab-does-not-import-other-features', severity: 'error', from: { path: '^src/features/lab/' }, to: { path: '^src/features/(?!lab/)' } },
    { name: 'profile-does-not-import-other-features', severity: 'error', from: { path: '^src/features/profile/' }, to: { path: '^src/features/(?!profile/)' } },
    { name: 'ar-menu-does-not-import-other-features', severity: 'error', from: { path: '^src/features/ar-menu/' }, to: { path: '^src/features/(?!ar-menu/)' } },
    { name: 'features-only-shared-and-core', severity: 'error', from: { path: '^src/features/(?!.*\\.test\\.(ts|tsx)$)' }, to: { path: '^src/(?!features/|shared/|core/)' } },
    { name: 'features-exposed-through-index', severity: 'error', from: { path: '^src/(app|shared|infrastructure)/' }, to: { path: '^src/features/[^/]+/(?!index\\.ts$)' } },
    { name: 'infrastructure-only-core', severity: 'error', from: { path: '^src/infrastructure' }, to: { path: '^src/(?!infrastructure|core)' } },
    { name: 'shared-only-core', severity: 'error', from: { path: '^src/shared' }, to: { path: '^src/(?!shared|core)' } },
    { name: 'no-orphans-except-entry', severity: 'warn', from: { orphan: true, pathNot: ['**/*.test.ts', '**/*.test.tsx', 'src/main.tsx'] }, to: {} }
  ],
  options: { doNotFollow: { path: 'node_modules' }, exclude: 'node_modules|dist|public', includeOnly: '^src' }
};
