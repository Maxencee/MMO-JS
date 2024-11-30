import { defineConfig } from '@rsbuild/core';

export default defineConfig({
    html: {
        template: './index.html',
    },
    source: {
        entry: {
            index: './main.js',
        }
    }
});