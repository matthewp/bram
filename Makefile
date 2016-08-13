define \n

endef

modules = src/bram.js \
	src/bindings.js \
  src/expression.js \
	src/inspect.js \
  src/hydrate.js \
  src/scope.js \
  src/model.js

dist/bram.js: ${modules}
	echo ${\n} > $@
	echo "(function(undefined) {" >> $@
	echo "'use strict';" >> $@
	for mod in ${modules} ; do \
    cat >> $@ $$mod && echo ${\n} >> $@ ; \
	done
	echo "})();" >> $@

all: dist/bram.js

release: dist/bram.js
	uglifyjs dist/bram.js > dist/bram.min.js

watch:
	find src -name "*.js" | entr make all
