import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const ignoredPaths = [
  '.next/**',
  'out/**',
  'node_modules/**',
  'next-env.d.ts',
];

const config = [
  { ignores: ignoredPaths },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
