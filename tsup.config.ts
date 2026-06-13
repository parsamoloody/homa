import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts',
            'src/core/application.ts', 
            'src/core/request.ts',
            'src/core/response.ts',
            'src/core/router.ts'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean:true
})