import {describe, expect, test} from '@jest/globals'
import {
    CourseTaken,
    Degrees,
    GradeType,
    RequirementApplyResult,
    run,
    SsHTbsTag,
    TechElectiveDecision
} from './degree_requirements'

function makeCourse(subject: string, number: string, cu: number, grade: string = "A"): CourseTaken {
    return new CourseTaken(
        subject,
        number,
        "",
        null,
        cu,
        GradeType.ForCredit,
        grade,
        202210,
        "",
        true)
}

describe('description', function () {
    test('TEs prefer non-SSH courses', () => {
        const teList: TechElectiveDecision[] = []
        teList.push({course4d: "LGST 1000", status: "yes", title: "" })

        const d = new Degrees()
        d.undergrad = "40cu CSCI"

        const courses: CourseTaken[] = [
            makeCourse("LGST", "1000", 1), // can count as TE or EUSS
            // CIS minicourses fill in 1000-level CIS Elective and 6 TEs
            makeCourse("CIS", "1100", 1.0),
            makeCourse("CIS", "1880", .5),
            makeCourse("CIS", "1890", .5),
            makeCourse("CIS", "1900", .5),
            makeCourse("CIS", "1910", .5),
            makeCourse("CIS", "1920", .5),
            makeCourse("CIS", "1930", .5),
            makeCourse("CIS", "1940", .5),
            makeCourse("CIS", "1950", .5),
            makeCourse("CIS", "1960", .5),
            makeCourse("CIS", "1970", .5),
            makeCourse("CIS", "1980", .5),
            makeCourse("CIS", "1981", .5),
            makeCourse("CIS", "1982", .5),
            makeCourse("CIS", "1983", .5),
        ]

        const result = run(teList, d, courses)
        const satisfiedReqs = result.requirementOutcomes
            .filter(ro => ro.applyResult == RequirementApplyResult.Satisfied)
            .map(ro => ro.degreeReq.getStatus())
            .join("\n")
        // console.log(satisfiedReqs)

        // ensure first SS slot is filled
        const firstSs = result.requirementOutcomes.find(ro => ro.degreeReq.toString().startsWith(SsHTbsTag))!
        expect(firstSs.applyResult).toBe(RequirementApplyResult.Satisfied)
        expect(firstSs.coursesApplied[0].code()).toBe(teList[0].course4d)
    })
    test("GPA calculator", () => {
        const d = new Degrees()
        d.undergrad = "40cu CSCI"

        const courses: CourseTaken[] = [
            // ignored
            makeCourse("CIS", "0001", 1, "TR"),
            makeCourse("CIS", "0002", 1, "I"),
            makeCourse("CIS", "0003", 1, "GR"),
            makeCourse("CIS", "0004", 1, "NR"),
            makeCourse("CIS", "0005", 1, "P"),

            // part of overall only
            makeCourse("ENGL", "0001", .5, "B"), // 3
            makeCourse("ENGL", "0002", 1, "A+"), // 4.0

            // part of overall and STEM
            makeCourse("CIS", "1100", 1.0, "B+"), // 3.3
            makeCourse("CIS", "1900", .5, "A-"), // 3.7
            // failed P/F course counts towards GPA
            new CourseTaken("CIS", "1910", "", null, .5,
                GradeType.PassFail, "F", 202210, "", true),

            // part of overall, STEM and M+NS
            makeCourse("PHYS", "0150", 1.5, "C+"), // 2.3
            makeCourse("MATH", "1410", .5, "D+"), // 1.3
        ]

        const result = run([], d, courses)
        expect(result.gpaMathNatSci).toBeCloseTo(2.05, 2)
        expect(result.gpaStem).toBeCloseTo(2.31, 2)
        expect(result.gpaOverall).toBeCloseTo(2.68, 2)
    })
});