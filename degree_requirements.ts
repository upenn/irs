
type MaybeCourseTaken = CourseTaken | null

abstract class DegreeRequirement {
    abstract remainingCUs: number
    abstract satisfiedBy(courses: Array<CourseTaken>): MaybeCourseTaken
}

enum GradeType {
    PassFail,
    ForCredit,
}

/** Records a course that was taken and passed, so it can conceivably count towards some requirement */
class CourseTaken {
    readonly subject: string
    readonly courseNumber: string
    readonly _3dName: string | null
    readonly courseUnits: number
    readonly grading: GradeType
    readonly term: number
    readonly attributes: string[]
    readonly completed: boolean

    /** tracks which (if any) requirement has been satisfied by this course */
    consumedBy: string | null = null

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
        this._3dName = _3dName
        this.courseUnits = cus
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
    const degree = $("input[name='degree']:checked").val()
    if (degree != "csci_40") {
        console.error("Only 40cu CSCI is supported for now")
    }

    const text = $("#coursesTaken").val() as string

    if (text.includes("Degree Works Release")) {
        const courseTakenPattern = new RegExp(String.raw`(?<subject>[A-Z]{2,4}) (?<number>\d{3,4})(?<restOfLine>.*)\nAttributes\t(?<attributes>.*)`, "g")
        let coursesTaken: CourseTaken[] = []
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
        console.assert(!(
                coursesTaken.find((c: CourseTaken) => c.code() == "EAS 0091") &&
                coursesTaken.find((c: CourseTaken) => c.code() == "CHEM 1012")
            ))
        console.log(`${coursesTaken.length} courses taken`)
        coursesTaken.forEach((c) => console.log(c.toString()))
    }


}