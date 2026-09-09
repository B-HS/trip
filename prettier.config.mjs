import base from 'feconfig-bhs/prettier.config.js'

const prettierConfig = {
    ...base,
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindStylesheet: './app/globals.css',
}

export default prettierConfig
