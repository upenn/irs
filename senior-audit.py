import sys, os

for worksheet in sys.argv[1:]:
    os.system(f"node degree_requirements.js {worksheet} {worksheet}.analysis.txt")
    pass
