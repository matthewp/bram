define \n

endef

modules = lib/bram.js

dist/bram.js: ${modules}
	echo ${\n} > $@
	echo "(function(undefined) {" >> $@
	echo "'use strict';" >> $@
	for mod in ${modules} ; do \
    cat >> $@ $$mod && echo ${\n} >> $@ ; \
	done
	echo "})();" >> $@

all: dist/bram.js

watch:
	find lib -name "*.js" | entr make all
