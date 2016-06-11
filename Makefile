UGLIFYJS = node_modules/uglify-js/bin/uglifyjs

all: d3-wheel-of-fortune.min.js

d3-wheel-of-fortune.min.js: d3-wheel-of-fortune.js uglifyjs
	$(UGLIFYJS) $< -c -m -o $@

clean:
	rm -f d3-wheel-of-fortune.min.js

uglifyjs: $(UGLIFYJS)

$(UGLIFYJS):
	npm install uglify-js
