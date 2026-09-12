import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: "ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name=/^(memo|useCallback|useMemo)$/]",
                    message: 'React Compiler가 메모이제이션을 담당합니다. 수동 memo API를 사용하지 마세요.',
                },
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'React',
                    property: 'memo',
                    message: 'React Compiler가 메모이제이션을 담당합니다. React.memo를 사용하지 마세요.',
                },
            ],
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        '.claude/**',
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
    ]),
])

export default eslintConfig
