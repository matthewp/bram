const swPrecache = require('sw-precache');
const rootDir = 'docs';

swPrecache.write(__dirname + '/../service-worker.js', {
  staticFileGlobs: [
    `${rootDir}/`,
    `${rootDir}/styles.css`,
    `${rootDir}/index.css`,
    `${rootDir}/styles/hljs/atom-one-dark.css`,
    `${rootDir}/bram.umd.js`,
    `${rootDir}/examples/tabs/tabs.js`,
    `${rootDir}/examples/todos/app.js`,
    `${rootDir}/examples/pull-requests/prs.js`,
    `${rootDir}/scripts/highlight.pack.js`,
    `${rootDir}/images/bram.svg`
  ],
  stripPrefix: rootDir
});
