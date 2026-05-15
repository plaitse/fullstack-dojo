import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: './openapi.json',
    output: {
      target: './src/generated/api-client.ts',
      client: 'fetch',
      mode: 'tags-split',
      clean: true,
    },
  },
});
