#REMOTE_PATH = cisadv@eniac.seas.upenn.edu:public_html/dynamic/irs/
#ship:
#	rsync -rv index.html degreeworks-faculty.png degreeworks-student.png forkme_right_green_007200.png degree_requirements.js degree_requirements.js.map irs.css $(REMOTE_PATH)

# export IRS code to the cis-advising-handbook GH repo
# need to commit & push it from there to prod
export:
	cp index.html degreeworks-faculty.png degreeworks-student.png forkme_right_green_007200.png degree_requirements.js degree_requirements.js.map irs.css /Users/devietti/Desktop/undergrad-chair/cis-advising-handbook/irs/

test:
	npm test


# APC Probation Risk list
# node degree_requirements.js apcProbationList path/to/dwh-report.csv
