import config from '../configs/rollup.config.ts';

export default {
    ...config,
    external: [...config.external, 'http', 'https']
};
