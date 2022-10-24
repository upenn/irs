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

function makeCourse(subject: string, number: string, cu: number): CourseTaken {
    return new CourseTaken(
        subject,
        number,
        "",
        null,
        cu,
        GradeType.ForCredit,
        "A",
        202210,
        "",
        true)
}

describe('description', function () {
    test('TEs prefer non-SSH courses', () => {
        const teList: TechElectiveDecision[] = []
        teList.push({course3d: "LGST 100", course4d: "LGST 1000", status: "yes", title: "" })

        const d = new Degrees()
        d.undergrad = "40cu CSCI"

        const courses: CourseTaken[] = [
            makeCourse("LGST", "1000", 1), // can count as TE or EUSS
            // CIS minicourses fill in 1000-level CIS Elective and 6 TEs
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
});