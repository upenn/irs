
const SsHTbsTag = "SS/H/TBS"
const WritingAttribute = "AUWR"
const CsciEthicsCourses = ["EAS 2030", "CIS 4230", "CIS 5230", "LAWM 5060"]

enum GradeType {
    PassFail = "PassFail",
    ForCredit = "ForCredit",
}

abstract class DegreeRequirement {
    /** How many CUs are needed to fulfill this requirement. Decremented as courses are applied to this requirement,
     * e.g., with 0.5 CU courses */
    public remainingCUs: number = 1.0

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
            return this.courses.includes(c.code()) && c.grading == GradeType.ForCredit && this.applyCourse(c, this.tag)
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
        return courses.find((c: CourseTaken): boolean => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a))
            return foundMatch && c.grading == GradeType.ForCredit && this.applyCourse(c, this.tag)
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
            return foundMatch && c.grading == GradeType.ForCredit && this.applyCourse(c, this.tag)
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
            c.courseUnitsRemaining >= 0.5)
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
    readonly minLevel: number
    constructor(displayIndex: number, minLevel: number) {
        super(displayIndex)
        this.minLevel = minLevel
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // console.log(courses.filter(c => c.subject == "NETS"))

        const byNumber = courses.slice()
        byNumber.sort((a,b) => a.courseNumberInt - b.courseNumberInt)

        return byNumber.find((c: CourseTaken): boolean => {
            const foundMatch = (c.subject == "CIS" || c.subject == "NETS") && c.courseNumberInt >= this.minLevel && !c.attributes.includes("EUNE")
            return foundMatch && c.grading == GradeType.ForCredit && this.applyCourse(c, "CisElective")
        })
    }

    public toString(): string {
        return `CIS Elective >= ${this.minLevel}`
    }
}

class RequirementTechElectiveEngineering extends DegreeRequirement {

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        let cuPrio = courses.slice()
        cuPrio.sort(sortByCUsDecreasing)
        return courses.find((c: CourseTaken): boolean => {
            return RequirementTechElectiveEngineering.isEngineering(c) &&
                c.grading == GradeType.ForCredit &&
                this.applyCourse(c, "TechElective")
        })
    }

    public toString(): string {
        return "Tech Elective (Engineering)"
    }
}

class RequirementTechElective extends DegreeRequirement {

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        let cuPrio = courses.slice()
        cuPrio.sort(sortByCUsDecreasing)

        const specialTEList = ["LING 0500", "PHIL 2620", "PHIL 2640", "OIDD 2200", "OIDD 3210", "OIDD 3250"]
        return cuPrio.find((c: CourseTaken): boolean => {
            return c.grading == GradeType.ForCredit &&
                (DegreeRequirement.isEngineering(c) || c.attributes.includes("EUMS") || specialTEList.includes(c.code())) &&
                this.applyCourse(c, "TechElective")
        })
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
        // prioritize writing+ethics courses
        const sshPrio: CourseTaken[] = courses.slice()
        sshPrio.sort((a,b) => {
            if ((a.attributes.includes(WritingAttribute) || CsciEthicsCourses.includes(a.code())) &&
                (!b.attributes.includes(WritingAttribute) && !CsciEthicsCourses.includes(b.code()))) {
                return -1
            }
            return 1
        })
        // TODO: prioritize for Depth Requirement

        return sshPrio.find((c: CourseTaken): boolean => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a))
            const gradeOk = c.grading == GradeType.ForCredit || c.grading == GradeType.PassFail
            return foundMatch && gradeOk && this.applyCourse(c, this.tag)
        })
    }

    public toString(): string {
        return `SS/H/TBS ${this.attrs}`
    }
}

class RequirementFreeElective extends DegreeRequirement {
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // prioritize 1.0 CU courses
        const largerCUsFirst: CourseTaken[] = courses.slice()
        largerCUsFirst.sort(sortByCUsDecreasing)

        return largerCUsFirst.find((c: CourseTaken): boolean => {
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

            // if we made it here, it counts as a Free Elective! NB: Pass/Fail is ok
            return !nocredit && this.applyCourse(c, "FreeElective")
        })
    }

    public toString(): string {
        return "Free Elective"
    }
}

function sortByCUsDecreasing(a: CourseTaken, b: CourseTaken): number {
    return b.courseUnitsRemaining - a.courseUnitsRemaining
}

/** Records a course that was taken and passed, so it can conceivably count towards some requirement */
class CourseTaken {
    readonly subject: string
    readonly courseNumber: string
    readonly courseNumberInt: number
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
                _3dName: string | null,
                cus: number,
                grading: GradeType,
                term: number,
                rawAttributes: string,
                completed: boolean,
                ) {
        this.subject = subject
        this.courseNumber = courseNumber
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

        // MANUAL DEGREEWORKS HACKS

        // EAS 0091 is, practically speaking, EUNS (conflicts with CHEM 1012, though)
        if (this.code() == "EAS 0091") {
            this.attributes.push("EUNS")
        }

        if (this.code() == "CIS 4230" || this.code() == "CIS 5230") {
            delete this.attributes[this.attributes.indexOf("EUMS")]
            this.attributes.push("EUNE")
        }
    }

    public toString(): string {
        return `${this.subject} ${this.courseNumber}, ${this.courseUnits} CUs, ${this.grading}, taken in ${this.term}, completed = ${this.completed}, ${this.attributes} inMinor:${this.partOfMinor}`
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
        // const title = parts[21].trim()

        const _4d = parts[28]
            .replace("[", "")
            .replace("]","").trim()
        const covidTerms = [202010, 202020, 202030, 202110]
        if (covidTerms.includes(term) && gradingType == GradeType.PassFail) {
            gradingType = GradeType.ForCredit
        }

        if (!inProgress && !["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","P","TR"].includes(grade)) {
            $("#messages").append(`Ignoring failed/incomplete course ${code} from ${term} with grade of ${grade}`)
            return null
        }

        if (_4d != "") {
            // student took 3d course, DW mapped to a 4d course
            const _4dparts = _4d.split(" ")
            return new CourseTaken(
                _4dparts[0],
                _4dparts[1],
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
            null,
            creditUnits,
            gradingType,
            term,
            rawAttrs,
            !inProgress)
    }
}

function main(): void {
    // reset output
    $("#degreeRequirements").empty()
    $("#remainingCUs").empty()
    $("#unusedCourses").empty()

    let degreeRequirements: DegreeRequirement[] = []
    const degree = $("input[name='degree']:checked").val()

    // NB: below, requirements are listed from highest => lowest priority. Display order is orthogonal.
    switch (degree) {
        case "csci_40":
            degreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2610","ESE 3010","ENM 3210","STAT 4300"]),

                new RequirementNamedCourses(7, "Natural Science", ["PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses(8, "Natural Science", ["PHYS 0151","PHYS 0171","ESE 1120"]),
                new RequirementNaturalScienceLab(9, "Natural Science Lab"),
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
                new RequirementNamedCourses(17, "Major", ["CIS 4710"]),
                new RequirementNamedCourses(18, "Major", ["CIS 3800"]),
                new RequirementNamedCourses(19, "Major", ["CIS 4000","ESE 4500","MEAM 4450"]),
                new RequirementNamedCourses(20, "Major", ["CIS 4010","ESE 4510","MEAM 4460"]),

                // Project Elective
                new RequirementNamedCourses(21, "Project Elective", [
                    "NETS 2120","CIS 3410","CIS 3500",
                    "CIS 4410","CIS 5410",
                    "CIS 4500","CIS 5500",
                    "CIS 4550","CIS 5550",
                    "CIS 4600","CIS 5600",
                    "CIS 5050","CIS 5530",
                    "ESE 3500"
                ]),

                new RequirementCisElective(22, 1000),
                new RequirementCisElective(23, 2000),
                new RequirementCisElective(24, 2000),

                new RequirementAttributes(5, "Math", ["EUMA"]),
                new RequirementAttributes(6, "Math", ["EUMA"]),

                new RequirementTechElectiveEngineering(25),
                new RequirementTechElectiveEngineering(26),
                new RequirementTechElective(27),
                new RequirementTechElective(28),
                new RequirementTechElective(29),
                new RequirementTechElective(30),

                new RequirementSsh(31, ["EUSS"]),
                new RequirementSsh(32, ["EUSS"]),
                new RequirementSsh(33, ["EUHS"]),
                new RequirementSsh(34, ["EUHS"]),
                new RequirementSsh(35, ["EUSS","EUHS"]),
                new RequirementSsh(36, ["EUSS","EUHS","EUTB"]),
                new RequirementSsh(37, ["EUSS","EUHS","EUTB"]),

                new RequirementFreeElective(38),
                new RequirementFreeElective(39),
                new RequirementFreeElective(40),
            ]
            break
        default:
            throw new Error(`unsupported degree: ${degree}`)
    }
    const degreeCUs = degreeRequirements.map(r => r.remainingCUs).reduce((sum, e) => sum + e, 0)
    if (40 != degreeCUs) throw new Error(`degree should be 40 CUs but was ${degreeCUs}`)

    const text = $("#coursesTaken").val() as string
    let coursesTaken: CourseTaken[] = []

    if (text.includes("Degree Works Release")) {
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

        const minorPattern = new RegExp(String.raw`^Block\\s+Hide\\s+Minor in (?<minor>.+)(.|\\s)*?Applied:\\s+(?<courses>.*)`, "g")
        let hits = minorPattern.exec(text)
        if (hits != null) {
            $("#messages").append(`<div>found minor in ${hits.groups!["minor"]}</div>`)
            const minorCoursePattern = new RegExp(String.raw`(?<subject>[A-Z]{2,4}) (?<number>\d{3,4}) \((?<cus>(\d|[.])+)\)`)
        }

        // can't take both EAS 0091 and CHEM 1012
        if (coursesTaken.find((c: CourseTaken) => c.code() == "EAS 0091") &&
            coursesTaken.find((c: CourseTaken) => c.code() == "CHEM 1012")) {
            throw new Error("took two equivalent CHEM courses???")
        }
        $("#messages").append(`${coursesTaken.length} courses taken`)
        // TODO: write to HTML instead, beneath a dropdown section
        coursesTaken.forEach((c) => console.log(c.toString()))
    } else {
        // TODO: parse unofficial transcripts
    }

    // APPLY COURSES TO DEGREE REQUIREMENTS

    let totalRemainingCUs = 0.0
    let reqOutcomes: [number,string][] = []
    degreeRequirements.forEach(req => {
        const matched1 = req.satisfiedBy(coursesTaken)
        if (matched1 == undefined) {
            reqOutcomes.push([req.displayIndex, `<div style="color: red">${req} NOT satisfied</div>`])
        } else if (req.remainingCUs > 0) {
            const matched2 = req.satisfiedBy(coursesTaken)
            if (matched2 == undefined) {
                reqOutcomes.push([req.displayIndex, `<div style="color: blue">${req} PARTIALLY satisfied by ${matched1.code()}</div>`])
            } else {
                // fully satisfied by 2 courses
                reqOutcomes.push([req.displayIndex, `<div style="color: gray">${req} satisfied by ${matched1.code()} and ${matched2.code()}</div>`])
            }
        } else {
            // fully satisfied
            reqOutcomes.push([req.displayIndex, `<div style="color: gray">${req} satisfied by ${matched1.code()}</div>`])
        }
        totalRemainingCUs += req.remainingCUs
    })
    reqOutcomes.sort((a,b) => a[0] - b[0])
    reqOutcomes.forEach((o: [number,string]) => {
        $("#degreeRequirements").append(o[1])
    })

    $("#remainingCUs").append(`<div>${totalRemainingCUs} CUs needed</div>`)

    coursesTaken.filter(c => c.courseUnitsRemaining > 0).forEach(c => {
        if (c.consumedBy == null) {
            $("#unusedCourses").append(`<div>unused course: ${c}</div>`)
        } else {
            $("#unusedCourses").append(`<div>partially unused course: ${c.courseUnitsRemaining} CUs unused from ${c}</div>`)
        }
    })

    // handle special SSH ShareWith requirements: writing, ethics, depth
    const sshCourses = coursesTaken.filter(c => c.consumedBy == SsHTbsTag)

    sshCourses.forEach(c => {
        c.consumedBy = null
        c.courseUnitsRemaining = c.courseUnits
    })
    const ssh40cuRequirements = [
        new RequirementAttributes(0, "Writing", [WritingAttribute]),
        new RequirementNamedCourses(0, "Engineering Ethics", CsciEthicsCourses),
    ]
    ssh40cuRequirements.forEach(req => {
        const matched = req.satisfiedBy(sshCourses)
        if (matched == undefined) {
            $("#degreeRequirements").append(`<div style="color: red">${req} NOT satisfied</div>`)
        } else {
            $("#degreeRequirements").append(`<div style="color: gray">${req} satisfied by ${matched.code()}</div>`)
        }
    })

    // TODO: Depth Requirement may have to be from SS/H courses?
    interface CountMap {
        [index: string]: number;
    }
    const counts: CountMap = {}
    sshCourses.forEach(c =>
        counts[c.subject] = counts[c.subject] ? counts[c.subject] + 1 : 1
    )
    const depthKeys = Object.keys(counts).filter(k => counts[k] >= 2)
    if (depthKeys.length == 0) {
        $("#degreeRequirements").append(`<div style="color: red">SSH Depth Requirement NOT satisfied</div>`)
    } else {
        $("#degreeRequirements").append(`<div style="color: gray">SSH Depth Requirement satisfied by ${depthKeys[0]}</div>`)
    }
}