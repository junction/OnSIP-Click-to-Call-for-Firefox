
CHROMEDIR = chrome
CONTENTDIR = $(CHROMEDIR)/content

CONTENT = \
	$(CONTENTDIR)/Fat.js \
	$(CONTENTDIR)/HttpRequest.js \
	$(CONTENTDIR)/JnDocument.js \
	$(CONTENTDIR)/app.js \
	$(CONTENTDIR)/onsip.css \
	$(CONTENTDIR)/onsip.js \
	$(CONTENTDIR)/onsip.xul \
	$(CONTENTDIR)/preferences.js \
	$(CONTENTDIR)/options/options.css \
	$(CONTENTDIR)/options/options.js \
	$(CONTENTDIR)/options/options.xul \
	$(CONTENTDIR)/options/pages/general.xul

onsip.xpi: $(CHROMEDIR)/onsip.jar chrome.manifest install.rdf
	zip onsip.xpi $(CHROMEDIR) $(CHROMEDIR)/onsip.jar chrome.manifest install.rdf

$(CHROMEDIR)/onsip.jar: $(CONTENT)
	cd $(CHROMEDIR); zip -r onsip.jar ./content ./locale ./skin -x \*~ -x \#* -x \*.svn*

clean:
	rm -f $(CHROMEDIR)/onsip.jar onsip.xpi
