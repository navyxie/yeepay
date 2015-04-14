TESTS = $(shell find test -type f -name "*.js")

test:
	./node_modules/.bin/mocha \
		$(TESTS)


.PHONY: test