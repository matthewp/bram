.PHONY: bram bram-umd minify site

bram:
	node_modules/.bin/rollup -o bram.js src/bram.js

bram-umd:
	node_modules/.bin/rollup -o bram.umd.js -f umd -n Bram src/global.js

minify:
	node_modules/.bin/babili bram.js > bram.min.js
	node_modules/.bin/babili bram.umd.js > bram.umd.min.js

site:
	cp bram.umd.js docs/
	cp node_modules/@webcomponents/custom-elements/custom-elements.min.js docs/scripts
	cp node_modules/@webcomponents/shadydom/shadydom.min.js docs/scripts

all: bram bram-umd minify

watch:
	find src -name "*.js" | entr make bram-umd
