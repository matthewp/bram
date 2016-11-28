const swPrecache = require('sw-precache');
const rootDir = 'docs';

swPrecache.write(__dirname + '/../service-worker.js', {
  staticFileGlobs: [
    `${rootDir}/styles.css`,
    `${rootDir}/bram.umd.js`,
    `${rootDir}/examples/tabs/tabs.js`,
    `${rootDir}/examples/todos/app.js`,
    `${rootDir}/examples/pull-requests/prs.js`,
    `${rootDir}/scripts/highlight.pack.js`
  ],
  stripPrefix: rootDir
});
