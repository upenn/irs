
// DW analysis files go here
const AnalysisOutputDir = "/Users/devietti/Projects/irs/dw-analysis/"

const SsHTbsTag = "SS/H/TBS"

enum CourseAttribute {
    Writing = "AUWR",
    Math = "EUMA",
    NatSci = "EUNS",
    MathNatSciEngr = "EUMS",
    SocialScience = "EUSS",
    Humanities = "EUHS",
    TBS = "EUTB",
    NonEngr = "EUNE",
}

const CsciEthicsCourses = ["EAS 2030", "CIS 4230", "CIS 5230", "LAWM 5060"]
const CsciProjectElectives = [
    "NETS 2120","CIS 3410","CIS 3500",
    "CIS 4410","CIS 5410",
    "CIS 4500","CIS 5500",
    "CIS 4550","CIS 5550",
    "CIS 4600","CIS 5600",
    "CIS 5050","CIS 5530",
    "ESE 3500"
]
const AscsProjectElectives = CsciProjectElectives.concat(["CIS 4710","CIS 5710","CIS 3800"])
const SeniorDesign1stSem = ["CIS 4000","CIS 4100","ESE 4500","MEAM 4450","BE 4950"]
const SeniorDesign2ndSem = ["CIS 4010","CIS 4110","ESE 4510","MEAM 4460","BE 4960"]

const WritingSeminarSsHTbs: { [index: string]: CourseAttribute} = {
    "WRIT 0020": CourseAttribute.Humanities,
    "WRIT 009": CourseAttribute.Humanities,
    "WRIT 0100": CourseAttribute.Humanities,
    "WRIT 0110": CourseAttribute.Humanities,
    "WRIT 012": CourseAttribute.Humanities,
    "WRIT 0130": CourseAttribute.Humanities,
    "WRIT 0140": CourseAttribute.Humanities,
    "WRIT 0150": CourseAttribute.Humanities,
    "WRIT 0160": CourseAttribute.SocialScience,
    "WRIT 0170": CourseAttribute.SocialScience,
    "WRIT 0200": CourseAttribute.Humanities,
    "WRIT 0210": CourseAttribute.TBS,
    "WRIT 0220": CourseAttribute.TBS,
    "WRIT 023": CourseAttribute.Humanities,
    "WRIT 024": CourseAttribute.TBS,
    "WRIT 0250": CourseAttribute.Humanities,
    "WRIT 0260": CourseAttribute.Humanities,
    "WRIT 0270": CourseAttribute.Humanities,
    "WRIT 0280": CourseAttribute.SocialScience,
    "WRIT 029": CourseAttribute.SocialScience,
    "WRIT 0300": CourseAttribute.Humanities,
    "WRIT 0310": CourseAttribute.TBS,
    "WRIT 032": CourseAttribute.Humanities,
    "WRIT 0330": CourseAttribute.Humanities,
    "WRIT 0340": CourseAttribute.SocialScience,
    "WRIT 035": CourseAttribute.SocialScience,
    "WRIT 036": CourseAttribute.Humanities,
    "WRIT 0370": CourseAttribute.SocialScience,
    "WRIT 0380": CourseAttribute.SocialScience,
    "WRIT 0390": CourseAttribute.Humanities,
    "WRIT 0400": CourseAttribute.TBS,
    "WRIT 0410": CourseAttribute.Humanities,
    "WRIT 042": CourseAttribute.Humanities,
    "WRIT 047": CourseAttribute.Humanities,
    "WRIT 0480": CourseAttribute.SocialScience,
    "WRIT 0490": CourseAttribute.Humanities,
    "WRIT 0500": CourseAttribute.SocialScience,
    "WRIT 0550": CourseAttribute.SocialScience,
    "WRIT 056": CourseAttribute.Humanities,
    "WRIT 0580": CourseAttribute.Humanities,
    "WRIT 0590": CourseAttribute.SocialScience,
    "WRIT 0650": CourseAttribute.TBS,
    "WRIT 066": CourseAttribute.Humanities,
    "WRIT 0670": CourseAttribute.Humanities,
    "WRIT 0680": CourseAttribute.Humanities,
    "WRIT 0730": CourseAttribute.Humanities,
    "WRIT 0740": CourseAttribute.TBS,
    "WRIT 075": CourseAttribute.SocialScience,
    "WRIT 0760": CourseAttribute.SocialScience,
    "WRIT 0770": CourseAttribute.SocialScience,
    "WRIT 0820": CourseAttribute.Humanities,
    "WRIT 0830": CourseAttribute.Humanities,
    "WRIT 084": CourseAttribute.Humanities,
    "WRIT 085": CourseAttribute.SocialScience,
    "WRIT 086": CourseAttribute.Humanities,
    "WRIT 087": CourseAttribute.Humanities,
    "WRIT 0880": CourseAttribute.SocialScience,
    "WRIT 0890": CourseAttribute.SocialScience,
    "WRIT 090": CourseAttribute.TBS,
    "WRIT 0910": CourseAttribute.Humanities,
    "WRIT 0920": CourseAttribute.SocialScience,
    "WRIT 125": CourseAttribute.Humanities,
    //WRIT135 & WRIT 138 PEER TUTOR TRAINING, count as FEs
}

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

type Degree = "40cu CSCI" | "40cu ASCS" | "40cu CMPE" | "40cu ASCC"

let IncorrectCMAttributes = new Map<string,null>()

abstract class DegreeRequirement {
    /** How many CUs are needed to fulfill this requirement. Decremented as courses are applied to this requirement,
     * e.g., with 0.5 CU courses */
    public remainingCUs: number = 1.0

    /** The requirement needs courses to be at least this level, e.g., 2000. Use a 4-digit course number */
    public minLevel: number = 0

    /** Set to true for requirements that don't consume a course, e.g., SEAS Writing Requirement */
    private doesntConsume: boolean = false

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
        if (this.doesntConsume) {
            return true
        }
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

    /** This requirement does not consume courses, e.g., the SEAS Writing Requirement */
    withNoConsume(): DegreeRequirement {
        this.doesntConsume = true
        return this
    }

    /** return true if `c` is an Engineering course, per the SUH */
    static isEngineering(c: CourseTaken): boolean {
        return ["BE","CBE","CIS","ENGR","ESE","IPD","MEAM","MSE","NETS"].includes(c.subject) &&
            !c.attributes.includes(CourseAttribute.NonEngr)
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
    readonly attrs: CourseAttribute[]
    constructor(displayIndex: number, tag: string, attrs: CourseAttribute[]) {
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
    readonly attrs: CourseAttribute[]
    constructor(displayIndex: number, tag: string, courses: string[], attrs: CourseAttribute[]) {
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
            const foundMatch = (c.subject == "CIS" || c.subject == "NETS") && !c.attributes.includes(CourseAttribute.NonEngr)
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
                    c.attributes.includes(CourseAttribute.MathNatSciEngr) ||
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
        return "Concentration"
    }
}

class RequirementSsh extends RequirementAttributes {
    constructor(displayIndex: number, attrs: CourseAttribute[]) {
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
                (a.attributes.includes(CourseAttribute.Writing) || CsciEthicsCourses.includes(a.code())) //&&
            ) {
                return -1
            }
            if (mostPopularSubjectFirst.includes(a.subject) &&
                (!mostPopularSubjectFirst.includes(b.subject) &&
                    !b.attributes.includes(CourseAttribute.Writing) &&
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
            c.attributes.includes(CourseAttribute.Humanities) || c.attributes.includes(CourseAttribute.SocialScience) ||
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
    readonly attributes: CourseAttribute[]
    readonly allAttributes: string[]
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
        this.courseNumberInt = parseInt(courseNumber, 10)
        this._3dName = _3dName
        this.courseUnits = cus
        this.courseUnitsRemaining = cus
        this.grading = grading
        this.term = term
        this.completed = completed

        const attrs = new Set(rawAttributes
            .split(";")
            .filter((s) => s.includes("ATTRIBUTE="))
            .map((s) => s.trim().split("=")[1]))
        this.allAttributes = [...attrs]
        this.attributes = []
        this.allAttributes.forEach((attr: string) => {
            Object.values(CourseAttribute).forEach((seasAttr: CourseAttribute) => {
                if (seasAttr == attr) {
                    this.attributes.push(seasAttr)
                }
            })
        })

        // MANUAL HACKS DUE TO ATTRIBUTES MISSING IN CURRICULUM MANAGER

        // EAS 0091 is, practically speaking, EUNS (conflicts with CHEM 1012, though)
        if (this.code() == "EAS 0091" || this.code() == "PHYS 0050") {
            this.attributes.push(CourseAttribute.NatSci)
        }
        if (this.code() == "CIS 4230" || this.code() == "CIS 5230") {
            delete this.attributes[this.attributes.indexOf(CourseAttribute.MathNatSciEngr)]
            this.attributes.push(CourseAttribute.NonEngr)
        }
        if (["ESE 2920","CIS 1890","CIS 1900","CIS 2330"].includes(this.code())) {
            this.attributes.push(CourseAttribute.MathNatSciEngr)
        }
        if (this.code() == "ESE 1120") {
            this.attributes.push(CourseAttribute.NonEngr)
            this.attributes.push(CourseAttribute.NatSci)
        }

        if (this.suhSaysSS() && !this.attributes.includes(CourseAttribute.SocialScience)) {
            this.attributes.push(CourseAttribute.SocialScience)
            IncorrectCMAttributes.set(`${this.code()} missing ${CourseAttribute.SocialScience}`, null)
        }
        if (this.suhSaysHum() && !this.attributes.includes(CourseAttribute.Humanities)) {
            this.attributes.push(CourseAttribute.Humanities)
            IncorrectCMAttributes.set(`${this.code()} missing ${CourseAttribute.Humanities}`, null)
        }

        // we have definitive categorization for TBS, Math, NS courses
        this.validateAttribute(this.suhSaysTbs(), CourseAttribute.TBS)
        this.validateAttribute(this.suhSaysMath(), CourseAttribute.Math)
        this.validateAttribute(this.suhSaysNatSci(), CourseAttribute.NatSci)
        this.validateAttribute(this.suhSaysEngr(), CourseAttribute.MathNatSciEngr)
    }
    private validateAttribute(suhSays: boolean, attr: CourseAttribute): void {
        if (suhSays && !this.attributes.includes(attr)) {
            this.attributes.push(attr)
            IncorrectCMAttributes.set(`${this.code()} missing ${attr}`, null)
        }
        if (this.attributes.includes(attr) && !suhSays) {
            this.attributes.splice(this.attributes.indexOf(attr), 1)
            IncorrectCMAttributes.set(`${this.code()} incorrectly has ${attr}`, null)
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

    /** If this returns true, the SEAS Undergraduate Handbook classifies this course as Social Science.
     * NB: this is NOT an exhaustive list, and should be used in addition to course attributes. */
    private suhSaysSS(): boolean {
        // TODO: ASAM except where cross-listed with AMES, ENGL, FNAR, HIST, or SAST
        // TODO: ECON except statistics, probability, and math courses, [ECON 104 is not allowed]
        // TODO: LING except language courses which can be used as Humanities electives and LING 0700 which can be used as a free elective
        // TODO: PSYC, SOCI except statistics, probability, and math courses
        const ssSubjects = ["COMM","CRIM","GSWS","HSOC","INTR","PPE","PSCI","STSC","URBS"]
        const ssCourses = [
            "BEPP 2010","BEPP 2030","BEPP 2120","BEPP 2200","BEPP 2500",
            "EAS 2030","FNCE 1010",
            "LGST 1000","LGST 1010","LGST 2120","LGST 2150","LGST 2200",
            "NURS 3130","NURS 3150","NURS 3160","NURS 3300","NURS 5250"]
        return (this.courseNumberInt < 5000 && ssSubjects.includes(this.subject)) ||
            ssCourses.includes(this.code()) ||
            WritingSeminarSsHTbs[this.code()] == CourseAttribute.SocialScience
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies this course as Humanities.
     * NB: this is NOT an exhaustive list, and should be used in addition to course attributes. */
    private suhSaysHum(): boolean {
        // TODO: ASAM cross-listed with AMES, ENGL, FNAR, HIST, and SARS only
        // TODO: PHIL except 005, 006, and all other logic courses
        // TODO: any foreign language course
        const humSubjects = [
            "ANTH","ANCH","ANEL","ARTH","ASLD","CLST","LATN","GREK","COML","EALC","ENGL","FNAR",
            "FOLK","GRMN","DTCH","SCND","HIST","HSSC","JWST","LALS","MUSC","NELC","RELS","FREN",
            "ITAL","PRTG","ROML","SPAN","CZCH","REES","PLSH","QUEC","RUSS","SARS","SAST","THAR",
            "SWAH"
        ]
        const humCourses = [
            "DSGN 1020","DSGN 1030","DSGN 2010","DSGN 1040","DSGN 2030","DSGN 2040","DSGN 5001","DSGN 2510","DSGN 1050",
            "ARCH 1010","ARCH 2010","ARCH 2020","ARCH 3010","ARCH 3020","ARCH 4010","ARCH 4110","ARCH 4120",
            "CIS 1060","IPD 5090"
        ]
        return (this.courseNumberInt < 5000 && humSubjects.includes(this.subject)) ||
            humCourses.includes(this.code()) ||
            (this.subject == "VLST" && this.courseNumberInt != 2090) ||
            WritingSeminarSsHTbs[this.code()] == CourseAttribute.Humanities
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies this course as TBS.
     * NB: this IS intended to be a definitive classification */
    private suhSaysTbs(): boolean {
        const tbsCourses = [
            "CIS 1070","CIS 1250","CIS 4230","CIS 5230","DSGN 0020",
            "EAS 2040", "EAS 2200", "EAS 2210", "EAS 2220", "EAS 2230", "EAS 2240", "EAS 2250", "EAS 2260", "EAS 2270",
            "EAS 2280", "EAS 2420", "EAS 2900", "EAS 3010", "EAS 3060", "EAS 3200", "EAS 4010", "EAS 4020", "EAS 4030",
            "EAS 4080", "EAS 5010", "EAS 5020", "EAS 5050", "EAS 5070", "EAS 5100", "EAS 5120", "EAS 5450", "EAS 5460",
            "EAS 5490", "EAS 5900", "EAS 5950",
            "IPD 5090","IPD 5450","LAWM 5060","MGMT 2370","OIDD 2360","OIDD 2340","WH 1010",
        ]
        return tbsCourses.includes(this.code()) ||
            (this.code() == "TFXR 000" && this.title == "PFP FREE") ||
            WritingSeminarSsHTbs[this.code()] == CourseAttribute.TBS
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies the course as Math.
     * NB: this IS intended to be a definitive classification */
    private suhSaysMath(): boolean {
        const mathCourses = [
            "CIS 1600", "CIS 2610",
            "ESE 3010", "ESE 4020",
            "PHIL 1710", "PHIL 4723",
            "STAT 4300", "STAT 4310", "STAT 4320", "STAT 4330"
        ]
        const prohibitedMathCourseNumbers = [
            // 3-digit MATH courses that don't have translations
            150, 151, 172, 174, 180, 212, 220,
            // 4-digit MATH courses
            1100, 1510, 1234, 1248, 1300, 1700, 2100, 2800
        ]
        return mathCourses.includes(this.code()) ||
            (this.subject == "MATH" && !prohibitedMathCourseNumbers.includes(this.courseNumberInt))
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies the course as Natural Science.
     * NB: this IS intended to be a definitive classification */
    private suhSaysNatSci(): boolean {
        const nsCourses = [
            "ASTR 1211", "ASTR 1212","ASTR 1250","ASTR 3392",
            "BE 3050", "CIS 3980", "ESE 1120", "MSE 2210",
            "MEAM 1100", "MEAM 1470",
            "PHYS 0050", "PHYS 0051", "PHYS 0140", "PHYS 0141",
        ]
        // all courses with these subjects are ook
        const nsSubjects = ["BCHE", "BMB", "CAMB", "GCB"]

        return nsCourses.includes(this.code()) ||
            nsSubjects.includes(this.subject) ||
            // BIBB 010, 160, 227 also excluded
            (this.subject == "NRSC" && !["0050", "0060"].includes(this.courseNumber)) ||
            (this.subject == "BIOL" && this.courseNumberInt > 1000 && this.courseNumberInt != 2510) ||
            (this.subject == "CHEM" && ![1000, 1200, 250, 1011].includes(this.courseNumberInt)) ||
            (this.subject == "EESC" && ([1030,1090].includes(this.courseNumberInt) || this.courseNumberInt > 2000)) ||
            (this.subject == "PHYS" && this.courseNumberInt >= 150 && ![3314,5500].includes(this.courseNumberInt))
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies the course as Engineering.
     * NB: this IS intended to be a definitive classification */
    private suhSaysEngr(): boolean {
        if (["VIPR 1200","VIPR 1210","NSCI 3010"].includes(this.code())) {
            return true
        }

        const engrSubjects = ["ENGR", "TCOM", "NETS", "BE", "CBE", "CIS", "ESE", "MEAM", "MSE"]
        const notEngrCourses = [
            "CIS 1050", "CIS 1070", "CIS 1250", "CIS 1600", "CIS 2610", "CIS 4230", "CIS 5230", "CIS 7980",
            "ESE 3010", "ESE 4020",
            // IPD courses cross listed with ARCH, EAS or FNAR do not count as Engineering
            // TODO: look up IPD cross-lists automatically instead
            "IPD 5090", "IPD 5210", "IPD 5270", "IPD 5280", "IPD 5440", "IPD 5450", "IPD 5720",
            "MEAM 1100", "MEAM 1470",
            "MSE 2210",
        ]
        return (engrSubjects.includes(this.subject) && this.courseNumberInt < 6000) &&
            !notEngrCourses.includes(this.code()) &&
            this.courseNumberInt != 2960 && this.courseNumberInt != 2970
    }
}

class UnofficialTranscript {
    public static extractCourses(transcriptText: string): CourseTaken[] {
        throw new Error("can't parse unofficial transcripts yet")
    }
}

class DegreeWorks {
    public static extractPennID(worksheetText: string): string | undefined {
        const matches = worksheetText.match(/Student\s+(\d{8})/)
        if (matches != null) {
            return matches![1]
        }
        return undefined
    }

    public static extractCourses(worksheetText: string): CourseTaken[] {
        let coursesTaken: CourseTaken[] = []

        const courseTakenPattern = new RegExp(String.raw`(?<subject>[A-Z]{2,4}) (?<number>\d{3,4})(?<restOfLine>.*)\nAttributes\t(?<attributes>.*)`, "g")
        let numHits = 0
        while (numHits < 100) {
            let hits = courseTakenPattern.exec(worksheetText)
            if (hits == null) {
                break
            }
            let c = DegreeWorks.parseOneCourse(
                hits.groups!["subject"],
                hits.groups!["number"],
                hits.groups!["restOfLine"],
                hits.groups!["attributes"])
            if (c != null) {
                coursesTaken.push(c)
            }
            numHits++
        }

        const minorPattern = new RegExp(String.raw`^Block\s+Hide\s+Minor in (?<minor>[^-]+)(?<details>(.|\s)*?)(Block\s+Hide|Class Information)`, "gm")
        let hits = minorPattern.exec(worksheetText)
        if (hits != null) {
            // console.log(hits.groups!["details"].split("\n"))
            hits.groups!["details"].split("\n")
                .filter((line: string): boolean => line.startsWith("Applied:"))
                .forEach((line: string) => {
                    // console.log(line)
                    // list of courses applied to the minor looks like this on DegreeWorks:
                    // Applied: LING 071 (1.0) LING 072 (1.0) LING 106 (1.0) LING 230 (1.0) LING 250 (1.0) LING 3810 (1.0)
                    myLog(`found courses used for minor in ${line}, using for Tech Electives`)
                    line.substring("Applied:".length).split(")").forEach(c => {
                        let name = c.split("(")[0].trim()
                        let course = coursesTaken.find((c: CourseTaken): boolean => c.code() == name || c._3dName == name)
                        if (course != undefined) {
                            course.partOfMinor = true
                        }
                    })
                })
        }

        // check for equivalent courses
        const equivalentCourses: [string,string][] = [
            ["EAS 0091", "CHEM 1012"],
            ["ESE 3010", "STAT 4300"],
            // NB: only STAT 4310 will be retained out of STAT 4310, ESE 4020, ENM 3750
            ["ESE 4020", "STAT 4310"], ["ENM 3750", "STAT 4310"],
            ["ENM 2510", "MATH 2410"],
            ["ESE 1120", "PHYS 0151"],
            ["MEAM 1100", "PHYS 0150"],
            ["MEAM 1470", "PHYS 0150"],
        ]
        equivalentCourses.forEach((forbidden: [string,string]) => {
            if (coursesTaken.some((c: CourseTaken) => c.code() == forbidden[0]) &&
                coursesTaken.some((c: CourseTaken) => c.code() == forbidden[1])) {
                const msg = `took ${forbidden[0]} & ${forbidden[1]}, uh-oh: disabling ${forbidden[0]}`
                myLog(msg)
                console.log(msg)
                let c0 = coursesTaken.find((c: CourseTaken) => c.code() == forbidden[0])
                // disable one of the equivalent courses
                c0!.courseUnitsRemaining = 0
            }
        })

        return coursesTaken
    }

    private static parseOneCourse(subject: string, courseNumber: string, courseInfo: string, rawAttrs: string): CourseTaken | null {
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

    public static inferDegree(worksheetText: string, coursesTaken: CourseTaken[]): Degree | undefined {
        if (worksheetText.includes("Degree in Bachelor of Science in Engineering") &&
            worksheetText.search(new RegExp(String.raw`RA\d+:\s+MAJOR\s+=\s+CSCI\s+`)) != -1) {
            // heuristic to identify folks who are actually ASCS
            if (
                (!coursesTaken.some(c => c.code() == "CIS 4710") && !coursesTaken.some(c => c.code() == "CIS 5710")) &&
                // !coursesTaken.some(c => c.code() == "CIS 3800") &&
                !coursesTaken.some(c => c.code() == "CIS 4100")
            ) {
                myLog("CSCI declared, but coursework is closer to ASCS so using ASCS requirements instead")
                return "40cu ASCS"
            }
            return "40cu CSCI"

        } else if (worksheetText.search(new RegExp(String.raw`RA\d+:\s+MAJOR\s+=\s+ASCS\s+`)) != -1) {
            return "40cu ASCS"

        } else if (worksheetText.search(new RegExp(String.raw`RA\d+:\s+MAJOR\s+=\s+CMPE\s+`)) != -1) {
            return "40cu CMPE"
        }
        return undefined
    }
}

const NodeCoursesTaken = "#coursesTaken"
const NodeDegreeRequirementsHeader = "#degreeRequirementsHeader"
const NodeDegreeRequirementsColumn1 = "#degreeRequirementsCol1"
const NodeDegreeRequirementsColumn2 = "#degreeRequirementsCol2"
const NodeRemainingCUs = "#remainingCUs"
const NodeStudentInfo = "#studentInfo"
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
    $(NodeStudentInfo).empty()
    $(NodeUnusedCoursesHeader).empty()
    $(NodeUnusedCoursesList).empty()
    $(NodeMessages).empty()
    $(NodeAllCourses).empty()

    let degreeChoice = $("input[name='degree']:checked").val()
    $(NodeMessages).append("<h3>Notes</h3>")

    let coursesTaken: CourseTaken[] = []
    const worksheetText = $(NodeCoursesTaken).val() as string
    if (worksheetText.includes("Degree Works Release")) {
        const pennid = DegreeWorks.extractPennID(worksheetText)
        if (pennid != undefined) {
            $(NodeStudentInfo).append(`<div class="alert alert-secondary" role="alert">PennID: ${pennid}</div>`)
        }
        coursesTaken = DegreeWorks.extractCourses(worksheetText)
        if (degreeChoice == "auto") {
            degreeChoice = DegreeWorks.inferDegree(worksheetText, coursesTaken)
            if (degreeChoice == undefined) {
                throw new Error("could not infer degree")
            }
        }
    } else {
        coursesTaken = UnofficialTranscript.extractCourses(worksheetText)
    }
    const degree = <Degree>degreeChoice

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
    const fs = require('fs');

    let worksheets = process.argv.slice(2)
    for (let i = 0; i < worksheets.length;) {
        const worksheetFile = worksheets[i]
        const pennid: string = path.basename(worksheetFile).split("-")[0]
        const myWorksheetFiles = worksheets.filter((f: string): boolean => f.includes(pennid))
        if (myWorksheetFiles.length == 1) {
            const worksheetText: string = fs.readFileSync(worksheetFile, 'utf8');
            runOneWorksheet(worksheetText, path.basename(worksheetFile))

        } else {
            // aggregate multiple worksheets for the same student
            const allMyWorksheets: string = myWorksheetFiles
                .map((f: string): string => fs.readFileSync(f, 'utf8'))
                .filter((ws: string): boolean =>
                    ws.includes("Degree in Bachelor of Science in Engineering") ||
                    ws.includes("Degree in Bachelor of Applied Science") ||
                    ws.includes("Degree in Master of Science in Engineering"))
                .join("\n")
            runOneWorksheet(allMyWorksheets, path.basename(worksheetFile))
        }
        i += myWorksheetFiles.length
    }
    if (IncorrectCMAttributes.size > 0) {
        console.log(`found ${IncorrectCMAttributes.size} incorrect/missing attributes in CM`)
        console.log(IncorrectCMAttributes.keys())
    }
}

function runOneWorksheet(worksheetText: string, analysisOutput: string): void {
    const fs = require('fs');
    try {
        let coursesTaken: CourseTaken[] = []
        if (worksheetText.includes("Degree Works Release")) {
            coursesTaken = DegreeWorks.extractCourses(worksheetText)
        } else {
            coursesTaken = UnofficialTranscript.extractCourses(worksheetText)
        }

        // infer degree
        let deg: Degree | undefined = DegreeWorks.inferDegree(worksheetText, coursesTaken)
        if (deg == undefined) {
            // can't infer degree, just skip it
            return
        }
        const degree: Degree = deg

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
                console.log(summary)
                if (!fs.existsSync(AnalysisOutputDir)) {
                    fs.mkdirSync(AnalysisOutputDir)
                }
                const outputFile = `${AnalysisOutputDir}${result.cusRemaining}left-${analysisOutput}.analysis.txt`
                fs.writeFileSync(outputFile, summary + JSON.stringify(result, null, 2) + worksheetText)
            })
    } catch (err) {
        console.error(err + " when processing " + process.argv[2]);
    }
}

function myLog(msg: string): void {
    if (typeof window === 'undefined') {
        console.log(msg)
    } else {
        $(NodeMessages).append(`<div>${msg}</div>`)
    }
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

    const ascsNSCourses = ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100","PHYS 093","PHYS 094",
        "PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120",
        "EAS 0091","CHEM 1012","BIOL 1101","BIOL 1121"]
    const ascsNSElectives = ["LING 2500", "LING 2300", "LING 5310", "LING 5320",
        "LING 5510", "LING 5520", "LING 6300", "LING 6400",
        "PHIL 4840",
        "PSYC 1210", "PSYC 1340", "PSYC 1310", "PSYC 2310", "PSYC 2737",
    ]

    // NB: below, requirements are listed from highest => lowest priority. Display order is orthogonal.
    switch (degree) {
        case "40cu CSCI":
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2610","ESE 3010","ENM 3210","STAT 4300"]),

                new RequirementNamedCourses(7, "Natural Science", ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100","PHYS 093"]),
                new RequirementNamedCourses(8, "Natural Science", ["PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120","PHYS 094"]),
                new RequirementNaturalScienceLab(9, "Natural Science Lab").withCUs(1.0),
                // PSYC 121 also listed on PiT, but seems discontinued
                new RequirementNamedCoursesOrAttributes(10,
                    "Natural Science",
                    ["LING 2500","PSYC 1340","PSYC 121"],
                    [CourseAttribute.NatSci]),

                new RequirementNamedCourses(11, "Major", ["CIS 1100"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 2620","CIS 5110"]),
                new RequirementNamedCourses(16, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(17, "Major", ["CIS 4710","CIS 5710"]),
                new RequirementNamedCourses(18, "Major", ["CIS 3800"]),
                new RequirementNamedCourses(19, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(20, "Senior Design", SeniorDesign2ndSem),

                new RequirementNamedCourses(21, "Project Elective", CsciProjectElectives),

                new RequirementCisElective(23).withMinLevel(2000),
                new RequirementCisElective(24).withMinLevel(2000),
                new RequirementCisElective(22),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),

                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                new RequirementSsh(37, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                // NB: Writing, Ethics, SSH Depth are [40,42]

                new RequirementTechElectiveEngineering(25),
                new RequirementTechElectiveEngineering(26),
                new RequirementCsci40TechElective(27, csci37techElectiveList),
                new RequirementCsci40TechElective(28, csci37techElectiveList),
                new RequirementCsci40TechElective(29, csci37techElectiveList),
                new RequirementCsci40TechElective(30, csci37techElectiveList),

                new RequirementFreeElective(43),
                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
            ]
            break
        case "40cu ASCS":
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2620","CIS 5110"]),

                new RequirementNamedCourses(7, "Natural Science", ascsNSCourses),
                new RequirementNamedCourses(8, "Natural Science",ascsNSCourses),
                new RequirementNamedCoursesOrAttributes(9, "Natural Science", ascsNSElectives, [CourseAttribute.NatSci]),
                new RequirementNamedCoursesOrAttributes(10, "Natural Science", ascsNSElectives, [CourseAttribute.NatSci]),

                new RequirementNamedCourses(11, "Major", ["CIS 1100"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(18, "Project Elective", AscsProjectElectives),
                new RequirementNamedCourses(19, "Project Elective", AscsProjectElectives),
                new RequirementNamedCourses(22, "Senior Capstone", ["EAS 4990","CIS 4980"].concat(SeniorDesign2ndSem)),

                new RequirementCisElective(17).withMinLevel(2000),
                new RequirementCisElective(16),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),

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

                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                new RequirementSsh(37, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                // NB: Writing, Ethics, SSH Depth are [40,42]

                new RequirementFreeElective(43),
                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
            ]
            break
        case "40cu ASCC":
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2620"]),

                new RequirementNamedCourses(7, "Natural Science", ascsNSCourses),
                new RequirementNamedCourses(8, "Natural Science",ascsNSCourses),
                new RequirementNamedCoursesOrAttributes(9, "Natural Science", ascsNSElectives, [CourseAttribute.NatSci]),
                new RequirementNamedCoursesOrAttributes(10, "Natural Science", ascsNSElectives, [CourseAttribute.NatSci]),

                new RequirementNamedCourses(11, "Major", ["CIS 1100"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1400","COGS 1001"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3200"]),
                new RequirementNamedCourses(15, "Major", ["CIS 4210","CIS 5210"]),
                new RequirementNamedCourses(22, "Senior Capstone", ["EAS 4990","CIS 4980"].concat(SeniorDesign2ndSem)),

                new RequirementCisElective(16),
                new RequirementCisElective(17),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),

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

                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                new RequirementSsh(37, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
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

                new RequirementNamedCourses(6, "Natural Science", ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100","PHYS 093"]),
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

                new RequirementAttributes(10, "Math/Natural Science", [CourseAttribute.Math,CourseAttribute.NatSci]),

                new RequirementSsh(30, [CourseAttribute.SocialScience]),
                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                new RequirementSsh(36, [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]),
                // NB: Writing, Ethics, SSH Depth are always [40,42]

                new RequirementAttributes(28, "Tech Elective", [CourseAttribute.MathNatSciEngr]).withMinLevel(2000),
                new RequirementNamedCoursesOrAttributes(29,
                    "Tech Elective",
                    ["ESE 4000","EAS 5450","EAS 5950","MGMT 2370","OIDD 2360"],
                    [CourseAttribute.MathNatSciEngr])
                    .withMinLevel(2000),
                new RequirementAttributes(26, "Tech Elective", [CourseAttribute.MathNatSciEngr]),
                new RequirementAttributes(27, "Tech Elective", [CourseAttribute.MathNatSciEngr]),

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

    // handle special ShareWith requirements: writing, ethics, depth
    const sshCourses: CourseTaken[] = coursesTaken.filter(c => c.consumedBy == SsHTbsTag)

    { // writing requirement
        const writingReq = new RequirementAttributes(40, "Writing", [CourseAttribute.Writing]).withNoConsume()
        const matched = writingReq.satisfiedBy(sshCourses)
        if (matched == undefined) {
            reqOutcomes.push([writingReq.displayIndex, RequirementOutcome.Unsatisfied, `${writingReq} NOT satisfied`])
        } else {
            reqOutcomes.push([writingReq.displayIndex, RequirementOutcome.Satisfied, `${writingReq} satisfied by ${matched.code()}`])
        }
    }
    { // ethics requirement: NB doesn't have to come from SSH block!
        const ethicsReq = new RequirementNamedCourses(41, "Engineering Ethics", CsciEthicsCourses).withNoConsume()
        const matched = ethicsReq.satisfiedBy(coursesTaken)
        if (matched == undefined) {
            reqOutcomes.push([ethicsReq.displayIndex, RequirementOutcome.Unsatisfied, `${ethicsReq} NOT satisfied`])
        } else {
            reqOutcomes.push([ethicsReq.displayIndex, RequirementOutcome.Satisfied, `${ethicsReq} satisfied by ${matched.code()}`])
        }
    }

    // SS/H Depth requirement
    const counts: CountMap = countBySubjectSshDepth(sshCourses)
    const depthKeys = Object.keys(counts).filter(k => counts[k] >= 2)
    if (depthKeys.length > 0 ||
        (sshCourses.some(c => c.code() == "EAS 5450") && sshCourses.some(c => c.code() == "EAS 5460"))) {
        reqOutcomes.push([42, RequirementOutcome.Satisfied, `SSH Depth Requirement satisfied by ${depthKeys[0]}`])
    } else {
        reqOutcomes.push([42, RequirementOutcome.Unsatisfied, `SSH Depth Requirement NOT satisfied`])
    }

    // sort by displayIndex
    reqOutcomes.sort((a,b) => a[0] - b[0])
    return new RunResult(
        reqOutcomes.map((o: [number, RequirementOutcome, string]): [RequirementOutcome,string] => [o[1],o[2]]),
        totalRemainingCUs,
        coursesTaken.filter(c => c.courseUnitsRemaining > 0)
    )
}