REMOTE_PATH = cisadv@eniac.seas.upenn.edu:public_html/dynamic/irs/

deploy:
	rsync -rv index.html degreeworks.png degree_requirements.js degree_requirements.js.map irs.css $(REMOTE_PATH)

