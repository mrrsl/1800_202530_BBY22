import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src/");
const publicLocation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public");

export default defineConfig({
    root: projectRoot,
    publicDir: publicLocation,
    envDir: "../",
    plugins: [
    tailwindcss(),
    svelte()
    ],
})
