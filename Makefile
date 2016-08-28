define \n

endef

modules = src/bram.js \
  src/map.js \
	src/bindings.js \
  src/expression.js \
	src/inspect.js \
  src/hydrate.js \
  src/scope.js \
  src/model.js \
  src/onchildren.js

bram.js: ${modules}
	echo ${\n} > $@
	echo "(function(undefined) {" >> $@
	echo "'use strict';" >> $@
	for mod in ${modules} ; do \
    cat >> $@ $$mod && echo ${\n} >> $@ ; \
	done
	echo "})();" >> $@

all: bram.js

release: bram.js
	uglifyjs bram.js > bram.min.js

watch:
	find src -name "*.js" | entr make all
