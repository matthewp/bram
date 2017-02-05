.PHONY: bram bram-umd minify guide site styles all

bram:
	node_modules/.bin/rollup -o bram.js src/bram.js

bram-umd:
	node_modules/.bin/rollup -o bram.umd.js -f umd -n Bram src/global.js

minify:
	node_modules/.bin/babili bram.js > bram.min.js
	node_modules/.bin/babili bram.umd.js > bram.umd.min.js

styles:
	node_modules/.bin/cleancss -o docs/styles/styles.min.css docs/styles.css

guide:
	node docs/scripts/guide.js > docs/guide.html
	node docs/scripts/guide.js hello-world > docs/hello-world.html
	node docs/scripts/guide.js compat > docs/compat.html

site: guide
	cp bram.umd.js docs/
	cp node_modules/@webcomponents/custom-elements/custom-elements.min.js docs/scripts
	cp node_modules/@webcomponents/shadydom/shadydom.min.js docs/scripts
	node docs/scripts/api.js > docs/api.html
	node docs/scripts/sw-precache.js

all: bram bram-umd minify

watch:
	find src -name "*.js" | entr make bram-umd
