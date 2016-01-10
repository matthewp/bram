define \n

endef

modules = node_modules/ccompute/dist/compute.js\
          lib/bram.js

dist/bram.js: ${modules}
	echo ${\n} > $@
	echo "(function(undefined) {" >> $@
	echo "'use strict';" >> $@
	for mod in ${modules} ; do \
    cat >> $@ $$mod && echo ${\n} >> $@ ; \
	done
	echo "})();" >> $@
	sed -i.bak 's/var ccompute = require.*/var ccompute = can.compute;/g' dist/bram.js

all: dist/bram.js

watch:
	find lib -name "*.js" | entr make all
