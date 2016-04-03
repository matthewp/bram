.PHONY: test debug

test:
	mocha test/test.js

debug:
	mocha --debug-brk test/test.js
