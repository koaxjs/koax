#
# Vars
#

BIN = ./node_modules/.bin
.DEFAULT_GOAL := all

#
# Tasks
#

node_modules: package.json
	@npm install
	@touch node_modules

test: node_modules
	@${BIN}/tape -r babel-register -r babel-polyfill test/*

validate: node_modules
	@standard

clean:
	@rm -rf lib

build: clean
	babel src --out-dir lib

all: validate test

init:
	@git init
	@git add .
	@git commit -am "FIRST"
	@hub create koaxjs/koax -d "Control flow inspired by koa and redux and in pursuit of free monads."
	@travis enable
	@git push -u origin master

#
# Phony
#

.PHONY: test validate clean build all init
