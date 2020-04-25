import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

const format = process.env.BUNDLE_FORMAT || 'esm';

export default {
    input: 'build/index.js',
    ...(pkg.dependencies
        ? { external: Object.keys(pkg.dependencies) }
        : undefined),
    output: {
        file: `build/bundle.${format}.js`,
        format
    }
};
