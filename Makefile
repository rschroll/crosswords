SHELL := /bin/bash

www/tags.js: www/list-page.tag www/puzzle-page.tag www/dialog.tag www/about-page.tag
	riot www $@

crosswords.tar.gz: crosswords README.md LICENSE www/index.html www/tags.js www/css/* www/img/* www/js/*
	tar --transform 's_^_crosswords/_' -czf $@ $^

.PHONY: tar click all

tar: crosswords.tar.gz

click:
	( \
	mkdir -p click; \
	PROJECT_EXCLUDES="--exclude .bzr --exclude .git --exclude .hg --exclude .svn --exclude *.qmlproject --exclude *.user --exclude tests --exclude Makefile --exclude .excludes --exclude click/ --exclude *.ubuntuhtmlproject"; \
	for EXCLUDE in `cat .excludes`; \
	do \
	 	PROJECT_EXCLUDES+=" --exclude $$EXCLUDE"; \
	done; \
	rsync -ah $$PROJECT_EXCLUDES ./* click/; \
	click build click; \
	rm -r click \
	)

all: tar click
