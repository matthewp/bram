grammar = src/grammar.pegjs

src/grammar.js: ${grammar}
	node_modules/.bin/pegjs src/grammar.pegjs

all: src/grammar.js

watch:
	find src/grammar.pegjs | entr make all
