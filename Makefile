REMOTE_PATH = cisadv@eniac.seas.upenn.edu:public_html/dynamic/irs/

deploy:
	rsync -rv index.html degreeworks-faculty.png degreeworks-student.png forkme_right_green_007200.png degree_requirements.js degree_requirements.js.map irs.css $(REMOTE_PATH)

