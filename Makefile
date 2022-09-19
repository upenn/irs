REMOTE_PATH = cisadv@eniac.seas.upenn.edu:public_html/dynamic/irs/

ship:
	rsync -rv index.html degreeworks.png degree_requirements.js degree_requirements.js.map node_modules $(REMOTE_PATH)

