
const SsHTbsTag = "SS/H/TBS"
const WritingAttribute = "AUWR"
const CsciEthicsCourses = ["EAS 2030", "CIS 4230", "CIS 5230", "LAWM 5060"]
const CisProjectElectives = [
    "NETS 2120","CIS 3410","CIS 3500",
    "CIS 4410","CIS 5410",
    "CIS 4500","CIS 5500",
    "CIS 4550","CIS 5550",
    "CIS 4600","CIS 5600",
    "CIS 5050","CIS 5530",
    "ESE 3500"
]
const SeniorDesign1stSem = ["CIS 4000","ESE 4500","MEAM 4450"]
const SeniorDesign2ndSem = ["CIS 4010","ESE 4510","MEAM 4460"]

enum GradeType {
    PassFail = "PassFail",
    ForCredit = "ForCredit",
}

interface TechElectiveDecision {
    course4d: string,
    course3d: string,
    title: string,
    status: "yes" | "no" | "ask"
}

type Degree = "40cu CSCI" | "40cu ASCS" | "40cu CMPE"

abstract class DegreeRequirement {
    /** How many CUs are needed to fulfill this requirement. Decremented as courses are applied to this requirement,
     * e.g., with 0.5 CU courses */
    public remainingCUs: number = 1.0

    /** The requirement needs courses to be at least this level, e.g., 2000. Use a 4-digit course number */
    public minLevel: number = 0

    /** Used to sort requirements for display */
    readonly displayIndex: number

    constructor(displayIndex: number) {
        this.displayIndex = displayIndex
    }

    /** consider the list `courses` and return one that applies to this requirement. Return `undefined` if nothing in
     * `courses` can be applied to this requirement */
    abstract satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined

    /** internal method for actually applying `c` to this requirement, decrementing CUs for both `c` and `this` */
    protected applyCourse(c: CourseTaken, tag: string): boolean {
        if (c.courseUnitsRemaining > 0 && !(c.courseUnitsRemaining == 1 && this.remainingCUs == 0.5)) {
            if (c.consumedBy == null) {
                c.consumedBy = tag
            }
            const cusToUse = Math.min(c.courseUnitsRemaining, this.remainingCUs)
            // console.log(`${c.courseUnitsRemaining} vs ${this.remainingCUs}: pulling ${cusToUse} from ${c.code()} for ${this}`)
            c.courseUnitsRemaining -= cusToUse
            this.remainingCUs -= cusToUse
            // console.log(`   ${c.courseUnitsRemaining} vs ${this.remainingCUs}: pulled ${cusToUse} from ${c.code()} for ${this}, ${this.remainingCUs > 0}`)
            return true
        }
        return false
    }

    /** Set the required CUs for this requirement to be `n` */
    withCUs(n: number): DegreeRequirement {
        this.remainingCUs = n
        return this
    }

    /** Set the min course level (e.g., 2000) for this requirement */
    withMinLevel(n: number): DegreeRequirement {
        this.minLevel = n
        return this
    }

    /** return true if `c` is an Engineering course, per the SUH */
    static isEngineering(c: CourseTaken): boolean {
        return ["BE","CBE","CIS","ENGR","ESE","IPD","MEAM","MSE","NETS"].includes(c.subject) &&
            !c.attributes.includes("EUNE")
    }
}

class RequirementNamedCourses extends DegreeRequirement {
    readonly tag: string
    readonly courses: string[]
    constructor(displayIndex: number, tag: string, courses: string[]) {
        super(displayIndex)
        this.tag = tag
        this.courses = courses
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.find((c: CourseTaken): boolean => {
            return this.courses.includes(c.code()) &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, this.tag)
        })
    }

    public toString(): string {
        return `${this.tag} ${this.courses}`
    }
}

class RequirementAttributes extends DegreeRequirement {
    readonly tag: string
    readonly attrs: string[]
    constructor(displayIndex: number, tag: string, attrs: string[]) {
        super(displayIndex)
        this.tag = tag
        this.attrs = attrs
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a))
            return foundMatch &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, this.tag)
        })
    }

    public toString(): string {
        return `${this.tag} ${this.attrs}`
    }
}

class RequirementNamedCoursesOrAttributes extends RequirementNamedCourses {
    readonly attrs: string[]
    constructor(displayIndex: number, tag: string, courses: string[], attrs: string[]) {
        super(displayIndex, tag, courses)
        this.attrs = attrs
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.find((c: CourseTaken): boolean => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a)) || this.courses.includes(c.code())
            return foundMatch &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, this.tag)
        })
    }

    public toString(): string {
        return `${this.tag} ${this.courses} ${this.attrs}`
    }
}

class RequirementNaturalScienceLab extends RequirementNamedCourses {
    constructor(displayIndex: number, tag: string) {
        const coursesWithLabs = [
            // 1.5 CUs
            "BIOL 1101", "BIOL 1102",
            "PHYS 0150", "PHYS 0151",
            "PHYS 0170", "PHYS 0171",
            "ESE 1120",

            // 0.5 CUs
            "CHEM 1101", "CHEM 1102",
            "PHYS 0050", "PHYS 0051",
            "MEAM 1470",
        ]
        super(displayIndex, tag, coursesWithLabs)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // only take 0.5 CUs at a time, representing the lab portion
        let matched = courses.find((c: CourseTaken): boolean =>
            this.courses.includes(c.code()) &&
            c.grading == GradeType.ForCredit &&
            c.courseUnitsRemaining >= 0.5 &&
            c.courseNumberInt >= this.minLevel)
        if (matched == undefined) return undefined

        if (matched.consumedBy == null) {
            matched.consumedBy = this.tag
        }
        matched.courseUnitsRemaining -= 0.5
        this.remainingCUs -= 0.5
        return matched
    }

    public toString(): string {
        return this.tag
    }
}

class RequirementCisElective extends DegreeRequirement {
    constructor(displayIndex: number) {
        super(displayIndex)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice() // NB: have to use slice since sort() is in-place
            .sort((a,b) => a.courseNumberInt - b.courseNumberInt)
            .find((c: CourseTaken): boolean => {
            const foundMatch = (c.subject == "CIS" || c.subject == "NETS") && !c.attributes.includes("EUNE")
            return foundMatch &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, "CisElective")
        })
    }

    public toString(): string {
        return `CIS Elective >= ${this.minLevel}`
    }
}

class RequirementTechElectiveEngineering extends DegreeRequirement {

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
            return RequirementTechElectiveEngineering.isEngineering(c) &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, "TechElective")
        })
    }

    public toString(): string {
        return "Tech Elective (Engineering)"
    }
}

class RequirementCsci40TechElective extends DegreeRequirement {

    readonly teHashmap: { [key: string]: null }

    constructor(displayIndex: number, teList: TechElectiveDecision[]) {
        super(displayIndex)
        this.teHashmap = {}
        teList
            .filter((te: TechElectiveDecision): boolean => te.status == "yes")
            .forEach((te: TechElectiveDecision) => {
                this.teHashmap[te.course4d] = null
            })
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        const specialTEList = ["LING 0500", "PHIL 2620", "PHIL 2640", "OIDD 2200", "OIDD 3210", "OIDD 3250"]

        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
            return c.grading == GradeType.ForCredit &&
                (DegreeRequirement.isEngineering(c) ||
                    c.attributes.includes("EUMS") ||
                    specialTEList.includes(c.code()) ||
                    this.teHashmap.hasOwnProperty(c.code()) ||
                    c.partOfMinor) &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, "TechElective")
        })
    }

    public toString(): string {
        return "Tech Elective"
    }
}

class RequirementAscs40TechElective extends RequirementCsci40TechElective {
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // PHIL 411 & PSYC 413 also listed on 40cu ASCS in PiT as valid TEs, but I think they got cancelled. So our TE
        // list is actually the same as 40cu CSCI atm.
        return super.satisfiedBy(courses)
    }

    public toString(): string {
        return "Tech Elective"
    }
}

class RequirementSsh extends RequirementAttributes {
    constructor(displayIndex: number, attrs: string[]) {
        super(displayIndex, SsHTbsTag, attrs)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // count by subject for SS/H courses for the Depth Requirement
        let counts = countBySubjectSshDepth(courses)
        const mostPopularSubjectFirst = Object.keys(counts)
            .sort((a,b) => counts[b] - counts[a])
            .filter((s: string): boolean => counts[s] >= 2)

        // prioritize writing+ethics courses and satisfying the Depth Requirement
        return courses.slice()
            .sort((a,b) => {
            if (
                (a.attributes.includes(WritingAttribute) || CsciEthicsCourses.includes(a.code())) //&&
            ) {
                return -1
            }
            if (mostPopularSubjectFirst.includes(a.subject) &&
                (!mostPopularSubjectFirst.includes(b.subject) &&
                    !b.attributes.includes(WritingAttribute) &&
                    !CsciEthicsCourses.includes(b.code()))
            ) {
                return -1
            }
            return 1
        }).find((c: CourseTaken): boolean => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a))
            const gradeOk = c.grading == GradeType.ForCredit || c.grading == GradeType.PassFail
            return foundMatch &&
                gradeOk && c.courseNumberInt >= this.minLevel && this.applyCourse(c, this.tag)

        })
    }

    public toString(): string {
        return `SS/H/TBS ${this.attrs}`
    }
}

class RequirementFreeElective extends DegreeRequirement {
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // prioritize 1.0 CU courses
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
            const noCreditNsci = c.subject == "NSCI" && ![1020,2010,2020,3010,4010,4020].includes(c.courseNumberInt)
            const noCreditStat = c.subject == "STAT" && c.courseNumberInt < 4300 && !["STAT 4050", "STAT 4220"].includes(c.code())
            const noCreditPhys = c.subject == "PHYS" && c.courseNumberInt < 140 && !["PHYS 0050", "PHYS 0051"].includes(c.code())

            const noCreditList = ["ASTRO 0001", "EAS 5030", "EAS 5050", "MATH 1510", "MATH 1700",
                "FNCE 0001", "FNCE 0002", "HCMG 0001", "MGMT 0004", "MKTG 0001", "OIDD 0001"]

            // no-credit subject areas
            const nocredit = (["CIT", "MSCI", "DYNM", "MED"].includes(c.subject)) ||
                noCreditList.includes(c.code()) ||
                noCreditPhys ||
                noCreditNsci ||
                noCreditStat

            // if we made it here, the course counts as a Free Elective
            const gradeOk = c.grading == GradeType.ForCredit || c.grading == GradeType.PassFail
            return !nocredit &&
                gradeOk &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c, "FreeElective")
        })
    }

    public toString(): string {
        return "Free Elective"
    }
}

/** A map from Subject => number of courses from that subject */
interface CountMap {
    [index: string]: number
}
/** Compute a CountMap of SS+H courses for the given `courses`. Used for the SSH Depth Requirement */
function countBySubjectSshDepth(courses: CourseTaken[]): CountMap {
    const counts: CountMap = {}
    courses
        .filter((c: CourseTaken): boolean =>
            // SSH Depth courses need to be SS or H, though EAS 5450 + 5460 is (sometimes?) allowed via petition
            c.attributes.includes("EUHS") || c.attributes.includes("EUSS") ||
            c.code() == "EAS 5450" || c.code() == "EAS 5460")
        .forEach(c =>
            counts[c.subject] = counts[c.subject] ? counts[c.subject] + 1 : 1
        )
    return counts
}

/** used when sorting CourseTaken[] */
function byHighestCUsFirst(a: CourseTaken, b: CourseTaken): number {
    return b.courseUnitsRemaining - a.courseUnitsRemaining
}

/** Records a course that was taken and passed, so it can conceivably count towards some requirement */
class CourseTaken {
    readonly subject: string
    readonly courseNumber: string
    readonly courseNumberInt: number
    readonly title: string
    readonly _3dName: string | null
    readonly courseUnits: number
    readonly grading: GradeType
    readonly term: number
    readonly attributes: string[]
    readonly completed: boolean
    /** true iff this course is used as part of an official minor */
    partOfMinor: boolean = false

    /** tracks which (if any) requirement has been satisfied by this course */
    consumedBy: string | null = null
    /** the number of CUs of this course consumed so far. Used mainly for NS lab courses */
    courseUnitsRemaining: number

    constructor(subject: string,
                courseNumber: string,
                title: string,
                _3dName: string | null,
                cus: number,
                grading: GradeType,
                term: number,
                rawAttributes: string,
                completed: boolean,
                ) {
        this.subject = subject
        this.courseNumber = courseNumber
        this.title = title
        this.courseNumberInt = parseInt(courseNumber)
        this._3dName = _3dName
        this.courseUnits = cus
        this.courseUnitsRemaining = cus
        this.grading = grading
        this.term = term
        this.completed = completed

        this.attributes = rawAttributes
            .split(";")
            .filter((s) => s.includes("ATTRIBUTE="))
            .map((s) => s.trim().split("=")[1])

        // MANUAL HACKS DUE TO INFO MISSING IN CURRICULUM MANAGER

        // EAS 0091 is, practically speaking, EUNS (conflicts with CHEM 1012, though)
        if (this.code() == "EAS 0091") {
            this.attributes.push("EUNS")
        }
        if (this.code() == "CIS 4230" || this.code() == "CIS 5230") {
            delete this.attributes[this.attributes.indexOf("EUMS")]
            this.attributes.push("EUNE")
        }
        if (this.code() == "LAWM 5060") {
            this.attributes.push("EUTB")
        }
        if (this.code() == "ESE 2920") {
            this.attributes.push("EUMS")
        }
        if (this.code() == "BEPP 2200") {
            this.attributes.push("EUSS")
        }
    }

    public toString(): string {
        let complete = this.completed ? "completed" : "in progress"
        let minor = this.partOfMinor ? "in minor" : ""
        return `${this.subject} ${this.courseNumber} ${this.title}, ${this.courseUnits} CUs, ${this.grading}, taken in ${this.term}, ${complete}, ${this.attributes} ${minor}`
    }

    /** Return a course code like "ENGL 1234" */
    public code(): string {
        return `${this.subject} ${this.courseNumber}`
    }

    public static parseDegreeWorksCourse(subject: string, courseNumber: string, courseInfo: string, rawAttrs: string): CourseTaken | null {
        const code = `${subject} ${courseNumber}`
        const parts = courseInfo.split("\t")
        const grade = parts[1].trim()
        const creditUnits = parseFloat(parts[2])
        const term = parseInt(parts[4])
        const inProgress = parts[7] == "YIP"
        const passFail = parts[9] == "YFP"
        let gradingType = passFail ? GradeType.PassFail : GradeType.ForCredit
        // const numericGrade = parseFloat(parts[12])
        const title = parts[21].trim()

        const _4d = parts[28]
            .replace("[", "")
            .replace("]","").trim()
        const covidTerms = [202010, 202020, 202030, 202110]
        if (covidTerms.includes(term) && gradingType == GradeType.PassFail) {
            gradingType = GradeType.ForCredit
        }

        if (!inProgress && !["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","P","TR"].includes(grade)) {
            myLog(`Ignoring failed/incomplete course ${code} from ${term} with grade of ${grade}`)
            return null
        }

        if (_4d != "") {
            // student took 3d course, DW mapped to a 4d course
            const _4dparts = _4d.split(" ")
            return new CourseTaken(
                _4dparts[0],
                _4dparts[1],
                title,
                code,
                creditUnits,
                gradingType,
                term,
                rawAttrs,
                !inProgress)
        }
        // student took or is taking 4d course
        return new CourseTaken(
            subject,
            courseNumber,
            title,
            null,
            creditUnits,
            gradingType,
            term,
            rawAttrs,
            !inProgress)
    }
}

const NodeCoursesTaken = "#coursesTaken"
const NodeDegreeRequirementsHeader = "#degreeRequirementsHeader"
const NodeDegreeRequirementsColumn1 = "#degreeRequirementsCol1"
const NodeDegreeRequirementsColumn2 = "#degreeRequirementsCol2"
const NodeRemainingCUs = "#remainingCUs"
const NodeUnusedCoursesHeader = "#unusedCoursesHeader"
const NodeUnusedCoursesList = "#unusedCoursesList"
const NodeMessages = "#messages"
const NodeAllCourses = "#allCourses"

function webMain(): void {
    // reset output
    $(NodeDegreeRequirementsHeader).empty()
    $(NodeDegreeRequirementsColumn1).empty()
    $(NodeDegreeRequirementsColumn2).empty()
    $(NodeRemainingCUs).empty()
    $(NodeUnusedCoursesHeader).empty()
    $(NodeUnusedCoursesList).empty()
    $(NodeMessages).empty()
    $(NodeAllCourses).empty()

    const degree = <Degree>$("input[name='degree']:checked").val()
    $(NodeMessages).append("<h3>Notes</h3>")

    let coursesTaken: CourseTaken[] = []
    const coursesText = $(NodeCoursesTaken).val() as string
    if (coursesText.includes("Degree Works Release")) {
        coursesTaken = parseDegreeWorksWorksheet(coursesText)
    } else {
        // TODO: parse unofficial transcripts
        throw new Error("unsupported format")
    }

    $(NodeMessages).append(`${coursesTaken.length} courses taken`)
    const allCourses = coursesTaken.map((c: CourseTaken): string => `<div><small>${c.toString()}</small></div>`).join("")
    $(NodeAllCourses).append(`
<div class="accordion" id="accordionExample">
  <div class="accordion-item">
    <h2 class="accordion-header" id="headingTwo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
      All Courses
      </button>
    </h2>
    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        ${allCourses}
      </div>
    </div>
  </div>
</div>`)

    // download the latest Technical Elective list
    fetch(window.location.origin + "/37cu_csci_tech_elective_list.json")
        .then(response => response.text())
        .then(json => {
            const telist = JSON.parse(json);
            const result = run(telist, degree, coursesTaken)
            $(NodeRemainingCUs).append(`<div class="alert alert-primary" role="alert">${result.cusRemaining} CUs needed to graduate</div>`)

            if (result.unconsumedCourses.length > 0) {
                $(NodeUnusedCoursesHeader).append(`<h3>Unused Courses</h3>`)
                result.unconsumedCourses.forEach(c => {
                    if (c.courseUnitsRemaining == c.courseUnits) {
                        $(NodeUnusedCoursesList).append(`<li class="list-group-item disabled">totally unused: ${c}</li>`)
                    } else {
                        $(NodeUnusedCoursesList).append(`<li class="list-group-item disabled">${c.courseUnitsRemaining} CUs unused from ${c}</li>`)
                    }
                })
            } else {
                $(NodeMessages).append("<div>all courses applied to degree requirements</div>")
            }

            // display requirement outcomes, in two columns
            $(NodeDegreeRequirementsHeader).append(`<h3>${degree} Degree Requirements</h3>`)

            result.requirementOutcomes.forEach(
                (o: [RequirementOutcome,string], i: number, allReqs: ([RequirementOutcome,string])[]) => {
                let column = NodeDegreeRequirementsColumn1
                if (i > allReqs.length/2) {
                    column = NodeDegreeRequirementsColumn2
                }
                switch (o[0]) {
                    case RequirementOutcome.Satisfied:
                        $(column).append(`<li class="list-group-item disabled">` + o[1] + "</li>")
                        break;
                    case RequirementOutcome.PartiallySatisfied:
                        $(column).append(`<li class="list-group-item list-group-item-warning">` + o[1] + "</li>")
                        break;
                    case RequirementOutcome.Unsatisfied:
                        $(column).append(`<li class="list-group-item list-group-item-danger">` + o[1] + "</li>")
                        break;
                    default:
                        throw new Error("invalid requirement outcome: " + o)
                }
            })
        })
}

if (typeof window === 'undefined') {
    cliMain()
}
function cliMain(): void {
    if (process.argv.length < 3) {
        console.log(`Usage: ${process.argv[1]} DW_WORKSHEETS...`)
        return
    }
    const path = require('path');
    process.argv.slice(2).forEach((worksheetFile: string) => {
        const output = "/Users/devietti/Projects/irs/dw-analysis/" + path.basename(worksheetFile) + ".analysis.txt"
        runOneWorksheet(worksheetFile, output)
    })
}

function runOneWorksheet(worksheetFile: string, analysisOutput: string): void {
    const fs = require('fs');
    try {
        const coursesText: string = fs.readFileSync(worksheetFile, 'utf8');
        let coursesTaken: CourseTaken[] = []
        if (coursesText.includes("Degree Works Release")) {
            coursesTaken = parseDegreeWorksWorksheet(coursesText)
        } else {
            // TODO: parse unofficial transcripts
            console.error("unsupported format")
            return
        }

        // infer degree
        let degree: Degree = "40cu CSCI"
        if (coursesText.includes("Degree in Bachelor of Science in Engineering") &&
            coursesText.search(new RegExp(String.raw`RA\d+:\s+MAJOR\s+=\s+CSCI\s+`)) != -1) {
            degree = "40cu CSCI"
            // TODO: heuristic to identify folks who are actually ASCS, e.g., no 4710, no 4100

        } else if (coursesText.search(new RegExp(String.raw`RA\d+:\s+MAJOR\s+=\s+ASCS\s+`)) != -1) {
            degree = "40cu ASCS"
        } else if (coursesText.search(new RegExp(String.raw`RA\d+:\s+MAJOR\s+=\s+CMPE\s+`)) != -1) {
            degree = "40cu CMPE"
        } else {
            // can't infer degree, just skip it
            return
        }
        fetch("https://advising.cis.upenn.edu/37cu_csci_tech_elective_list.json")
            .then(response => response.text())
            .then(json => {
                const telist = JSON.parse(json);
                const result = run(telist, degree, coursesTaken)

                const unsat = result.requirementOutcomes
                    .filter(r => r[0] != RequirementOutcome.Satisfied)
                    .map(r => "  " + r[1])
                    .join("\n")
                const unconsumed = result.unconsumedCourses
                    .map(r => "  " + r.toString())
                    .join("\n")
                    const summary = `
${result.cusRemaining} CUs remaining in ${degree}

unsatisfied requirements:
${unsat}

unused courses:
${unconsumed}

`
                // console.log(summary)
                fs.writeFileSync(analysisOutput, summary + JSON.stringify(result, null, 2) + coursesText)
            })
    } catch (err) {
        console.error(err + " when processing " + process.argv[2]);
    }
}

function myLog(msg: string): void {
    if (typeof window === 'undefined') {
        // console.log(msg)
    } else {
        $(NodeMessages).append(`<div>${msg}</div>`)
    }
}

function parseDegreeWorksWorksheet(text: string): CourseTaken[] {
    let coursesTaken: CourseTaken[] = []

    const courseTakenPattern = new RegExp(String.raw`(?<subject>[A-Z]{2,4}) (?<number>\d{3,4})(?<restOfLine>.*)\nAttributes\t(?<attributes>.*)`, "g")
    let numHits = 0
    while (numHits < 100) {
        let hits = courseTakenPattern.exec(text)
        if (hits == null) {
            break
        }
        let c = CourseTaken.parseDegreeWorksCourse(
            hits.groups!["subject"],
            hits.groups!["number"],
            hits.groups!["restOfLine"],
            hits.groups!["attributes"])
        if (c != null) {
            coursesTaken.push(c)
        }
        numHits++
    }

    const minorPattern = new RegExp(String.raw`^Block\s+Hide\s+Minor in (?<minor>[^-]+)(.|\s)*?Applied:\s+(?<courses>.*)`, "gm")
    let hits = minorPattern.exec(text)
    if (hits != null) {
        // list of courses applied to the minor looks like this on DegreeWorks:
        // LING 071 (1.0) LING 072 (1.0) LING 106 (1.0) LING 230 (1.0) LING 250 (1.0) LING 3810 (1.0)
        myLog(`found minor in ${hits.groups!["minor"].trim()}, using for Tech Electives`)
        hits.groups!["courses"].split(")").forEach(c => {
            let name = c.split("(")[0].trim()
            let course = coursesTaken.find((c: CourseTaken): boolean => c.code() == name || c._3dName == name)
            if (course != undefined) {
                course.partOfMinor = true
            }
        })
    }

    // can't take both EAS 0091 and CHEM 1012
    if (coursesTaken.some((c: CourseTaken) => c.code() == "EAS 0091") &&
        coursesTaken.some((c: CourseTaken) => c.code() == "CHEM 1012")) {
        myLog("took EAS 0091 & CHEM 1012, uh-oh")
        console.log("took EAS 0091 & CHEM 1012, uh-oh")
        let eas0091 = coursesTaken.find((c: CourseTaken) => c.code() == "EAS 0091")
        // discard EAS 0091
        eas0091!.courseUnitsRemaining = 0
    }

    return coursesTaken
}

enum RequirementOutcome {
    Unsatisfied, PartiallySatisfied, Satisfied
}
type RequirementOutcomeArray = [RequirementOutcome,string][]

class RunResult {
    readonly requirementOutcomes: RequirementOutcomeArray
    readonly cusRemaining: number
    readonly unconsumedCourses: CourseTaken[]

    constructor(requirementOutcomes: RequirementOutcomeArray, cusRemaining: number, unconsumedCourses: CourseTaken[]) {
        this.requirementOutcomes = requirementOutcomes
        this.cusRemaining = cusRemaining
        this.unconsumedCourses = unconsumedCourses
    }
}

function run(csci37techElectiveList: TechElectiveDecision[], degree: Degree, coursesTaken: CourseTaken[]): RunResult {
    let degreeRequirements: DegreeRequirement[] = []

    // NB: below, requirements are listed from highest => lowest priority. Display order is orthogonal.
    switch (degree) {
        case "40cu CSCI":
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2610","ESE 3010","ENM 3210","STAT 4300"]),

                new RequirementNamedCourses(7, "Natural Science", ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses(8, "Natural Science", ["PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120"]),
                new RequirementNaturalScienceLab(9, "Natural Science Lab").withCUs(1.0),
                // PSYC 121 also listed on PiT, but seems discontinued
                new RequirementNamedCoursesOrAttributes(10,
                    "Natural Science",
                    ["LING 2500","PSYC 1340","PSYC 121"],
                    ["EUNS"]),

                new RequirementNamedCourses(11, "Major", ["CIS 1100"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 2620"]),
                new RequirementNamedCourses(16, "Major", ["CIS 3200"]),
                new RequirementNamedCourses(17, "Major", ["CIS 4710","CIS 5710"]),
                new RequirementNamedCourses(18, "Major", ["CIS 3800"]),
                new RequirementNamedCourses(19, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(20, "Senior Design", SeniorDesign2ndSem),

                new RequirementNamedCourses(21, "Project Elective", CisProjectElectives),

                new RequirementCisElective(22),
                new RequirementCisElective(23).withMinLevel(2000),
                new RequirementCisElective(24).withMinLevel(2000),

                new RequirementAttributes(5, "Math", ["EUMA"]),
                new RequirementAttributes(6, "Math", ["EUMA"]),

                new RequirementTechElectiveEngineering(25),
                new RequirementTechElectiveEngineering(26),
                new RequirementCsci40TechElective(27, csci37techElectiveList),
                new RequirementCsci40TechElective(28, csci37techElectiveList),
                new RequirementCsci40TechElective(29, csci37techElectiveList),
                new RequirementCsci40TechElective(30, csci37techElectiveList),

                new RequirementSsh(31, ["EUSS"]),
                new RequirementSsh(32, ["EUSS"]),
                new RequirementSsh(33, ["EUHS"]),
                new RequirementSsh(34, ["EUHS"]),
                new RequirementSsh(35, ["EUSS","EUHS"]),
                new RequirementSsh(36, ["EUSS","EUHS","EUTB"]),
                new RequirementSsh(37, ["EUSS","EUHS","EUTB"]),
                // NB: Writing, Ethics, SSH Depth are [40,42]

                new RequirementFreeElective(43),
                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
            ]
            break
        case "40cu ASCS":
            const ascsNSCourses = ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100",
                "PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120",
                "EAS 0091","CHEM 1012","BIOL 1101","BIOL 1121"]
            const ascsNSElectives = ["LING 2500", "LING 2300", "LING 5310", "LING 5320",
                "LING 5510", "LING 5520", "LING 6300", "LING 6400",
                "PHIL 4840",
                "PSYC 1210", "PSYC 1340", "PSYC 1310", "PSYC 2310", "PSYC 2737",
            ]
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2620"]),

                new RequirementNamedCourses(7, "Natural Science", ascsNSCourses),
                new RequirementNamedCourses(8, "Natural Science",ascsNSCourses),
                new RequirementNamedCoursesOrAttributes(9, "Natural Science", ascsNSElectives, ["EUNS"]),
                new RequirementNamedCoursesOrAttributes(10, "Natural Science", ascsNSElectives, ["EUNS"]),

                new RequirementNamedCourses(11, "Major", ["CIS 1100"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3200"]),
                new RequirementNamedCourses(18, "Project Elective", CisProjectElectives),
                new RequirementNamedCourses(19, "Project Elective", CisProjectElectives),
                new RequirementNamedCourses(22, "Senior Capstone", ["EAS 4990","CIS 4980"].concat(SeniorDesign2ndSem)),

                new RequirementCisElective(16),
                new RequirementCisElective(17).withMinLevel(2000),

                new RequirementAttributes(5, "Math", ["EUMA"]),
                new RequirementAttributes(6, "Math", ["EUMA"]),

                new RequirementTechElectiveEngineering(20),
                new RequirementTechElectiveEngineering(21),

                new RequirementAscs40TechElective(23, csci37techElectiveList),
                new RequirementAscs40TechElective(24, csci37techElectiveList),
                new RequirementAscs40TechElective(25, csci37techElectiveList),
                new RequirementAscs40TechElective(26, csci37techElectiveList),
                new RequirementAscs40TechElective(27, csci37techElectiveList),
                new RequirementAscs40TechElective(28, csci37techElectiveList),
                new RequirementAscs40TechElective(29, csci37techElectiveList),
                new RequirementAscs40TechElective(30, csci37techElectiveList),

                new RequirementSsh(31, ["EUSS"]),
                new RequirementSsh(32, ["EUSS"]),
                new RequirementSsh(33, ["EUHS"]),
                new RequirementSsh(34, ["EUHS"]),
                new RequirementSsh(35, ["EUSS","EUHS"]),
                new RequirementSsh(36, ["EUSS","EUHS","EUTB"]),
                new RequirementSsh(37, ["EUSS","EUHS","EUTB"]),
                // NB: Writing, Ethics, SSH Depth are [40,42]

                new RequirementFreeElective(43),
                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
            ]
            break
        case "40cu CMPE":
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["MATH 2400","MATH 2600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2610","ESE 3010","ENM 3210","STAT 4300"]),
                new RequirementNamedCourses(5, "Math", ["CIS 1600"]),

                new RequirementNamedCourses(6, "Natural Science", ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses(7, "Natural Science", ["PHYS 0151","PHYS 0171","ESE 1120"]).withCUs(1.5),
                new RequirementNamedCourses(8, "Natural Science", ["CHEM 1012","BIOL 1101","BIOL 1121","EAS 0091"]),
                new RequirementNaturalScienceLab(9, "Natural Science Lab").withCUs(0.5),

                new RequirementNamedCourses(11, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(13, "Major", ["ESE 1500"]),
                new RequirementNamedCourses(14, "Major", ["ESE 2150"]).withCUs(1.5),
                new RequirementNamedCourses(15, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(16, "Major", ["ESE 3500"]).withCUs(1.5),
                new RequirementNamedCourses(17, "Major", ["CIS 3500","CIS 4600","CIS 5600"]),
                new RequirementNamedCourses(18, "Major", ["ESE 3700"]),
                new RequirementNamedCourses(19, "Major", ["CIS 4710","CIS 5710"]),
                new RequirementNamedCourses(20, "Major", ["CIS 3800"]),
                new RequirementNamedCourses(21, "Major", ["CIS 4410","CIS 5410"]),
                new RequirementNamedCourses(22, "Networking", ["ESE 4070","CIS 5530"]),
                new RequirementNamedCourses(23, "Concurrency Lab", ["CIS 4550","CIS 5550","CIS 5050","ESE 5320","CIS 5650"]),
                new RequirementNamedCourses(24, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(25, "Senior Design", SeniorDesign2ndSem),

                new RequirementAttributes(10, "Math/Natural Science", ["EUMA","EUNS"]),

                new RequirementAttributes(26, "Tech Elective", ["EUMS"]),
                new RequirementAttributes(27, "Tech Elective", ["EUMS"]),
                new RequirementAttributes(28, "Tech Elective", ["EUMS"]).withMinLevel(2000),
                new RequirementNamedCoursesOrAttributes(29,
                    "Tech Elective",
                    ["ESE 4000","EAS 5450","EAS 5950","MGMT 2370","OIDD 2360"],
                    ["EUMS"])
                    .withMinLevel(2000),

                new RequirementSsh(30, ["EUSS"]),
                new RequirementSsh(31, ["EUSS"]),
                new RequirementSsh(32, ["EUHS"]),
                new RequirementSsh(33, ["EUHS"]),
                new RequirementSsh(34, ["EUSS","EUHS"]),
                new RequirementSsh(35, ["EUSS","EUHS","EUTB"]),
                new RequirementSsh(36, ["EUSS","EUHS","EUTB"]),
                // NB: Writing, Ethics, SSH Depth are always [40,42]

                new RequirementFreeElective(43),
                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
            ]
            break
        default:
            throw new Error(`unsupported degree: ${degree}`)
    }
    const degreeCUs = degreeRequirements.map(r => r.remainingCUs).reduce((sum, e) => sum + e, 0)
    if (40 != degreeCUs) throw new Error(`degree should be 40 CUs but was ${degreeCUs}`)

    // APPLY COURSES TO DEGREE REQUIREMENTS

    // use undergrad courses first, reserve grad courses for AM
    coursesTaken.sort((a,b): number => a.courseNumberInt - b.courseNumberInt)

    let totalRemainingCUs = 0.0
    let reqOutcomes: [number,RequirementOutcome,string][] = []
    degreeRequirements.forEach(req => {
        const matched1 = req.satisfiedBy(coursesTaken)
        if (matched1 == undefined) {
            reqOutcomes.push([req.displayIndex, RequirementOutcome.Unsatisfied, `${req} NOT satisfied`])
        } else if (req.remainingCUs > 0) {
            const matched2 = req.satisfiedBy(coursesTaken)
            if (matched2 == undefined) {
                reqOutcomes.push([req.displayIndex, RequirementOutcome.PartiallySatisfied, `${req} PARTIALLY satisfied by ${matched1.code()}`])
            } else {
                // fully satisfied by 2 courses
                reqOutcomes.push([req.displayIndex, RequirementOutcome.Satisfied, `${req} satisfied by ${matched1.code()} and ${matched2.code()}`])
            }
        } else {
            // fully satisfied
            reqOutcomes.push([req.displayIndex, RequirementOutcome.Satisfied, `${req} satisfied by ${matched1.code()}`])
        }
        totalRemainingCUs += req.remainingCUs
    })

    // handle special SSH ShareWith requirements: writing, ethics, depth
    const sshCourses: CourseTaken[] = coursesTaken.filter(c => c.consumedBy == SsHTbsTag)

    // Ugh, such a hack! We have a shallow copy of coursesTaken. If we don't restore the `consumedBy` and
    // `courseUnitsRemaining` fields, we end up incorrectly considering some ssh courses as unused.
    const origCUs: [string|null, number, CourseTaken][] = sshCourses.map(c => [c.consumedBy,c.courseUnitsRemaining,c])
    sshCourses.forEach(c => {
        c.consumedBy = null
        c.courseUnitsRemaining = c.courseUnits
    })
    const ssh40cuRequirements = [
        new RequirementAttributes(40, "Writing", [WritingAttribute]),
        new RequirementNamedCourses(41, "Engineering Ethics", CsciEthicsCourses),
    ]
    ssh40cuRequirements.forEach(req => {
        const matched = req.satisfiedBy(sshCourses)
        if (matched == undefined) {
            reqOutcomes.push([req.displayIndex, RequirementOutcome.Unsatisfied, `${req} NOT satisfied`])
        } else {
            reqOutcomes.push([req.displayIndex, RequirementOutcome.Satisfied, `${req} satisfied by ${matched.code()}`])
        }
    })

    // SS/H Depth requirement
    const counts: CountMap = countBySubjectSshDepth(sshCourses)
    const depthKeys = Object.keys(counts).filter(k => counts[k] >= 2)
    if (depthKeys.length > 0 ||
        (sshCourses.some(c => c.code() == "EAS 5450") && sshCourses.some(c => c.code() == "EAS 5460"))) {
        reqOutcomes.push([42, RequirementOutcome.Satisfied, `SSH Depth Requirement satisfied by ${depthKeys[0]}`])
    } else {
        reqOutcomes.push([42, RequirementOutcome.Unsatisfied, `SSH Depth Requirement NOT satisfied`])
    }

    reqOutcomes.sort((a,b) => a[0] - b[0])
    origCUs.forEach((e: [string|null, number, CourseTaken]) => {
        e[2].consumedBy = e[0]
        e[2].courseUnitsRemaining = e[1]
    })
    return new RunResult(
        reqOutcomes.map((o: [number, RequirementOutcome, string]): [RequirementOutcome,string] => [o[1],o[2]]),
        totalRemainingCUs,
        coursesTaken.filter(c => c.courseUnitsRemaining > 0)
    )
}