import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue, { rules } from 'eslint-plugin-vue'
import skipFormatting, { ignores } from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
    rules: {
      'vue/muti-words-component-names': [
        'warn',
        {
          ignores: ['index'],
        },
      ],
      'prettier/prettier': {
        semi: false,
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        trailingComma: 'all',
        endOfLine: 'auto',
      },
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
])
