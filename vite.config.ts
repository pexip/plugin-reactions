export default {
  base: '/plugin/',
  build: {
      target: 'esnext',
      rollupOptions: {
          output: {
              entryFileNames: `assets/[name].js`,
          },
      },
  },
};
