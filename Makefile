COMPILE=node_modules/.bin/compile
MIN=node_modules/.bin/terser
ROLLUP=node_modules/.bin/rollup
CLEANCSS=node_modules/.bin/cleancss

all: bram.js bram.min.js

bram.js: src/bram.js
	$(COMPILE) -o $@ -f es $^
.PHONY: bram

bram.min.js: bram.js
	$(MIN) $^ > $@

clean:
	@rm -f bram.js bram.min.js
.PHONY: clean

styles:
	$(CLEANCSS) -o docs/styles/styles.min.css docs/styles.css
.PHONY: styles

guide:
	node docs/scripts/guide.js > docs/guide.html
	node docs/scripts/guide.js hello-world > docs/hello-world.html
	node docs/scripts/guide.js compat > docs/compat.html
.PHONY: guide

site: guide
	cp bram.js docs/
	node docs/scripts/api.js > docs/api.html
	node docs/scripts/sw-precache.js
.PHONY: site

serve:
	http-server -p 3228
.PHONY: serve

watch:
	find src -name "*.js" | entr make bram.js
.PHONY: watch

dev:
	make watch & make serve
.PHONY: dev

deploy:
	aws s3 sync docs s3://bramjs.org
.PHONY: deploy

