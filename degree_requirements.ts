
const SsHTbsTag = "SS/H/TBS"
const WritingAttribute = "AUWR"
const CsciEthicsCourses = ["EAS 2030", "CIS 4230", "CIS 5230", "LAWM 5060"]

enum GradeType {
    PassFail,
    ForCredit,
}

abstract class DegreeRequirement {
    public remainingCUs: number = 1.0
    abstract satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined
    protected applyCourse(c: CourseTaken, tag: string): boolean {
        if (c.consumedBy == null && c.courseUnitsRemaining > 0 && !(c.courseUnitsRemaining == 1 && this.remainingCUs == 0.5)) {
            c.consumedBy = tag
            const cusToUse = Math.min(c.courseUnitsRemaining, this.remainingCUs)
            console.log(`${c.courseUnitsRemaining} vs ${this.remainingCUs}: pulling ${cusToUse} from ${c.code()} for ${this}`)
            c.courseUnitsRemaining -= cusToUse
            this.remainingCUs -= cusToUse
            console.log(`   ${c.courseUnitsRemaining} vs ${this.remainingCUs}: pulled ${cusToUse} from ${c.code()} for ${this}, ${this.remainingCUs > 0}`)
            return true
        }
        return false
    }
    static isEngineering(c: CourseTaken): boolean {
        return ["BE","CBE","CIS","ENGR","ESE","IPD","MEAM","MSE","NETS"].includes(c.subject) &&
            !c.attributes.includes("EUNE")
    }
}

class RequirementNamedCourses extends DegreeRequirement {
    readonly tag: string
    readonly courses: string[]
    constructor(tag: string, courses: string[]) {
        super()
        this.tag = tag
        this.courses = courses
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.find((c) =>
            this.courses.includes(c.code()) && c.grading == GradeType.ForCredit && this.applyCourse(c, this.tag)
        )
    }

    public toString(): string {
        return `${this.tag} ${this.courses}`
    }
}

class RequirementAttributes extends DegreeRequirement {
    readonly tag: string
    readonly attrs: string[]
    constructor(tag: string, attrs: string[]) {
        super()
        this.tag = tag
        this.attrs = attrs
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.find((c) => {
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
    constructor(tag: string, courses: string[], attrs: string[]) {
        super(tag, courses)
        this.attrs = attrs
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.find((c) => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a)) || this.courses.includes(c.code())
            return foundMatch && c.grading == GradeType.ForCredit && this.applyCourse(c, this.tag)
        })
    }

    public toString(): string {
        return `${this.tag} ${this.courses} ${this.attrs}`
    }
}

class RequirementNaturalScienceLab extends RequirementNamedCourses {
    constructor(tag: string) {
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
        super(tag, coursesWithLabs)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // only take 0.5 CUs at a time, representing the lab portion
        let matched = courses.find(c =>
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

// class RequirementCsci40PhysicsAndLabs extends DegreeRequirement {
//     static readonly tag: string = "Physics & Labs"
//     constructor() {
//         super()
//         this.remainingCUs = 3.0
//     }
//
//     satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
//         const tag = RequirementCsci40PhysicsAndLabs.tag
//         // TODO: BIOL 1101/1102 are 1.5 CUs each, would satisfy lab requirement and EUNS
//         const standaloneLabs = [/*"BIOL 1101", "BIOL 1102",*/ "CHEM 1101", "CHEM 1102", "PHYS 0050", "PHYS 0051"]
//
//         const mechanics = courses.find((c) => c.code() == "PHYS 0140")
//         const em = courses.find((c) => c.code() == "PHYS 0141")
//
//         // TODO: MEAM 1100 + 1470
//         const mechanicsWithLab = courses.find((c) => ["PHYS 0150", "PHYS 0170"].includes(c.code()))
//         const emWithLab = courses.find((c) => ["PHYS 0151", "PHYS 0171", "ESE 1120"].includes(c.code()))
//         let mechanicsDone = mechanicsWithLab != undefined && mechanicsWithLab.grading == GradeType.ForCredit && this.applyCourse(mechanicsWithLab, tag)
//         let emDone = emWithLab != undefined && emWithLab.grading == GradeType.ForCredit && this.applyCourse(emWithLab, tag)
//         if (mechanicsDone && emDone) {
//             // TODO: allow this requirement to be satisfied by multiple courses...
//             return emWithLab
//         }
//         if (mechanicsDone || emDone) { // got 1.5 CUs done
//             if ((mechanicsDone && mechanics != undefined) ||
//                 (emDone && em != undefined)) {
//                 throw new Error("took two equivalent physics courses???")
//             }
//             if (mechanics == undefined && em == undefined) {
//                 throw new Error("unimplemented")
//             }
//             // has 2.5 CUs, look for 0.5 CU lab
//             const lab = courses.find(c => standaloneLabs.includes(c.code()))
//             if (lab != undefined && lab.grading == GradeType.ForCredit && this.applyCourse(lab, tag)) {
//                 // TODO: allow this requirement to be satisfied by multiple courses...
//                 return lab
//             }
//             return undefined
//         }
//
//         // didn't do any physics courses with labs, need two labs
//         let labs = courses.filter(c => standaloneLabs.includes(c.code()))
//         if (labs.length >= 2) {
//             if (labs.slice(0,2).every(c => c.grading == GradeType.ForCredit && this.applyCourse(c, tag))) {
//                 return labs[0]
//             }
//         }
//         return undefined
//     }
//
//
//     public toString(): string {
//         return RequirementCsci40PhysicsAndLabs.tag
//     }
// }

class RequirementCisElective extends DegreeRequirement {
    readonly minLevel: number
    constructor(minLevel: number) {
        super()
        this.minLevel = minLevel
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        console.log(courses.filter(c => c.subject == "NETS"))

        const byNumber = courses.slice()
        byNumber.sort((a,b) => a.courseNumberInt - b.courseNumberInt)

        return byNumber.find((c) => {
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
        return courses.find((c) => {
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
        const specialTEList = ["LING 0500", "PHIL 2620", "PHIL 2640", "OIDD 2200", "OIDD 3210", "OIDD 3250"]
        return courses.find((c) => {
            return c.grading == GradeType.ForCredit &&
                (RequirementTechElectiveEngineering.isEngineering(c) || c.attributes.includes("EUMS") || specialTEList.includes(c.code())) &&
                this.applyCourse(c, "TechElective")
        })
    }

    public toString(): string {
        return "Tech Elective"
    }
}

class RequirementSsh extends RequirementAttributes {
    constructor(attrs: string[]) {
        super(SsHTbsTag, attrs)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // prioritize writing+ethics courses
        const sshPrio: CourseTaken[] = courses.slice()
        // courses.forEach(c => sshPrio.push(Object.assign({}, c)));
        sshPrio.sort((a,b) => {
            if ((a.attributes.includes(WritingAttribute) || CsciEthicsCourses.includes(a.code())) &&
                (!b.attributes.includes(WritingAttribute) && !CsciEthicsCourses.includes(b.code()))) {
                return -1
            }
            return 1
        })
        // TODO: prioritize for Depth Requirement

        return sshPrio.find((c) => {
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
        const fePrio: CourseTaken[] = courses.slice()
        // courses.forEach(c => fePrio.push(Object.assign({}, c)));
        fePrio.sort((a,b) =>
            b.courseUnits - a.courseUnits
        )

        return fePrio.find((c: CourseTaken) => {
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

        // HACK: EAS 0091 is, practically speaking, EUNS (conflicts with CHEM 1012, though)
        if (subject == "EAS" && courseNumber == "0091") {
            rawAttributes += " ATTRIBUTE=EUNS;"
        }

        this.attributes = rawAttributes
            .split(";")
            .filter((s) => s.includes("ATTRIBUTE="))
            .map((s) => s.trim().split("=")[1])
    }

    public toString(): string {
        return `${this.subject} ${this.courseNumber}, ${this.courseUnits} CUs, ${this.grading}, taken in ${this.term}, completed = ${this.completed}, ${this.attributes}`
    }

    /** Return a course code like "ENGL 1234" */
    public code(): string {
        return `${this.subject} ${this.courseNumber}`
    }

    public static parseDegreeWorksCourse(subject: string, courseNumber: string, courseInfo: string, rawAttrs: string): CourseTaken | null {
        const code = `${subject} ${courseNumber}`
        const parts = courseInfo.split("\t")
        const grade = parts[1]
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

        if (!inProgress && ["F","I","NS"].includes(grade)) {
            console.log(`Ignoring failed course ${code} from ${term}`)
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
    let degreeRequirements: DegreeRequirement[] = []
    const degree = $("input[name='degree']:checked").val()

    switch (degree) {
        case "csci_40":
            degreeRequirements = [
                new RequirementNamedCourses("Math", ["MATH 1400"]),
                new RequirementNamedCourses("Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses("Math", ["CIS 1600"]),
                new RequirementNamedCourses("Math", ["CIS 2610","ESE 3010","ENM 3210","STAT 4300"]),

                new RequirementNamedCourses("Natural Science", ["PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses("Natural Science", ["PHYS 0151","PHYS 0171","ESE 1120"]),
                new RequirementNaturalScienceLab("Natural Science Lab"),

                new RequirementNamedCourses("Major", ["CIS 1100"]),
                new RequirementNamedCourses("Major", ["CIS 1200"]),
                new RequirementNamedCourses("Major", ["CIS 1210"]),
                new RequirementNamedCourses("Major", ["CIS 2400"]),
                new RequirementNamedCourses("Major", ["CIS 2620"]),
                new RequirementNamedCourses("Major", ["CIS 3200"]),
                new RequirementNamedCourses("Major", ["CIS 4710"]),
                new RequirementNamedCourses("Major", ["CIS 3800"]),
                new RequirementNamedCourses("Major", ["CIS 4000"]),
                new RequirementNamedCourses("Major", ["CIS 4010"]),

                // Project Elective
                new RequirementNamedCourses("Project Elective", [
                    "NETS 2120","CIS 3410","CIS 3500",
                    "CIS 4410","CIS 5410",
                    "CIS 4500","CIS 5500",
                    "CIS 4550","CIS 5550",
                    "CIS 4600","CIS 5600",
                    "CIS 5050","CIS 5530"]),
                // TODO: exclude ESE 3500 for now, need to account for its 1.5 CUs...

                new RequirementCisElective(1000),
                new RequirementCisElective(2000),
                new RequirementCisElective(2000),

                new RequirementAttributes("Math", ["EUMA"]),
                new RequirementAttributes("Math", ["EUMA"]),
                // PSYC 121 also listed on PiT, but seems discontinued
                new RequirementNamedCoursesOrAttributes(
                    "Natural Science",
                    ["LING 2500","PSYC 1340","PSYC 121"],
                    ["EUNS"]),

                new RequirementSsh(["EUSS"]),
                new RequirementSsh(["EUSS"]),
                new RequirementSsh(["EUHS"]),
                new RequirementSsh(["EUHS"]),
                new RequirementSsh(["EUSS","EUHS"]),
                new RequirementSsh(["EUSS","EUHS","EUTB"]),
                new RequirementSsh(["EUSS","EUHS","EUTB"]),

                new RequirementTechElectiveEngineering,
                new RequirementTechElectiveEngineering,
                new RequirementTechElective,
                new RequirementTechElective,
                new RequirementTechElective,
                new RequirementTechElective,

                new RequirementFreeElective,
                new RequirementFreeElective,
                new RequirementFreeElective,
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

        // can't take both EAS 0091 and CHEM 1012
        if (coursesTaken.find((c: CourseTaken) => c.code() == "EAS 0091") &&
            coursesTaken.find((c: CourseTaken) => c.code() == "CHEM 1012")) {
            throw new Error("took two equivalent CHEM courses???")
        }
        console.log(`${coursesTaken.length} courses taken`)
        coursesTaken.forEach((c) => console.log(c.toString()))
    } else {
        // TODO: parse unofficial transcripts
    }

    // apply courses to degree requirements
    let totalRemainingCUs = 0.0
    degreeRequirements.forEach(req => {
        const matched1 = req.satisfiedBy(coursesTaken)
        if (matched1 == undefined) {
            $("#degreeRequirements").append(`<div style="color: red">${req} NOT satisfied</div>`)
        } else if (req.remainingCUs > 0) {
            console.log("jld: " + req.remainingCUs + " " + matched1)
            const matched2 = req.satisfiedBy(coursesTaken)
            if (matched2 == undefined) {
                $("#degreeRequirements").append(`<div style="color: blue">${req} PARTIALLY satisfied by ${matched1.code()}</div>`)
            } else {
                // fully satisfied by 2 courses
                $("#degreeRequirements").append(`<div style="color: gray">${req} satisfied by ${matched1.code()} and ${matched2.code()}</div>`)
            }
        } else {
            // fully satisfied
            $("#degreeRequirements").append(`<div style="color: gray">${req} satisfied by ${matched1.code()}</div>`)
        }
        totalRemainingCUs += req.remainingCUs
    })

    $("#remainingCUs").append(`<div>${totalRemainingCUs} CUs needed</div>`)

    coursesTaken.filter(c => c.consumedBy == null).forEach(c =>
        $("#unusedCourses").append(`<div>unused course: ${c}</div>`)
    )

    // TODO: handle special SSH ShareWith requirements: writing, ethics, depth

}