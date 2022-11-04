
// DW analysis files go here
import {makeArray} from "jquery";
import DroppableEventUIParam = JQueryUI.DroppableEventUIParam;
import exp from "constants";
import {isBooleanObject} from "util/types";

const AnalysisOutputDir = "/Users/devietti/Projects/irs/dw-analysis/"
const DraggableDataGetCourseTaken = "CourseTaken"
const DraggableOriginalRequirement = "OriginalDegreeRequirement"
const DroppableDataGetDegreeRequirement = "DegreeRequirement"

export const SsHTbsTag = "SS/H/TBS"
const SshDepthTag = "SSH Depth Requirement"
const Math1400RetroTitle = "Calculus 1 retro credit"

/** grades indicating a completed course, as opposed to I, NR, GR or 'IN PROGRESS' which indicate non-completion */
const CompletedGrades = ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","P","TR"]
/** academic terms during which students could take unlimited P/F courses */
const CovidTerms = [202010, 202020, 202030, 202110]

enum CourseAttribute {
    Writing = "AUWR",
    Math = "EUMA",
    NatSci = "EUNS",
    MathNatSciEngr = "EUMS",
    SocialScience = "EUSS",
    Humanities = "EUHS",
    TBS = "EUTB",
    NonEngr = "EUNE",
    SasLanguage = "AULA",
    SasLastLanguage = "AULL",
    SasAdvancedLanguage = "AULA",
    RoboTechElective = "EMRT",
    RoboGeneralElective = "EMRE",
    NetsLightTechElective = "NetsLightTE",
    NetsFullTechElective = "NetsFullTE",
}

/** 1.5 CU Natural Science courses with labs */
const CoursesWithLab15CUs = [
    "BIOL 1101", "BIOL 1102",
    "PHYS 0150", "PHYS 0151",
    "PHYS 0170", "PHYS 0171",
    "ESE 1120",
]
/** 0.5 CU standalone Natural Science lab courses */
const StandaloneLabCourses05CUs = [
    "CHEM 1101", "CHEM 1102",
    "PHYS 0050", "PHYS 0051",
    "MEAM 1470",
]
const CoursesWith15CUsToSplit = [
    "MUSC 2700", "MUSC 2710"
]

// only allowed for 40cu students: https://ugrad.seas.upenn.edu/student-handbook/courses-requirements/engineering-courses/
const EngrLinkingCourses = [
    "MGMT 1010",
    "MGMT 2370",
    "FNCE 2170",
    "MGMT 1110",
    "OIDD 2900",
    "FNCE 2030",
    "FNCE 1010",
    "ACCT 1020",
    "STAT 4350",
]

const CsciEthicsCourses = ["EAS 2030", "CIS 4230", "CIS 5230", "LAWM 5060", "VIPR 1200", "VIPR 1210"]
const CsciProjectElectives = [
    "NETS 2120","CIS 3410","CIS 3500",
    "CIS 4410","CIS 5410",
    "CIS 4500","CIS 5500",
    "CIS 4550","CIS 5550",
    "CIS 4600","CIS 5600",
    "CIS 5050","CIS 5530",
    "ESE 3500"
]
const AscsProjectElectives = CsciProjectElectives.concat(["CIS 4710","CIS 5710","CIS 3800","CIS 5480"])
const SseIseElectives = [
    "CIS 2400", "CIS 4500", "CIS 5500",
    "ESE 3050", "ESE 3250", "ESE 4070", "ESE 4200", "ESE 5000", "ESE 5040", "ESE 5050", "ESE 5120",
    "ESE 520", // NB: doesn't have a 4-digit equivalent, seems retired
    "ESE 5280", "ESE 5310", "ESE 5450", "ESE 6050", "ESE 6190",
    "NETS 2120", "NETS 3120", "NETS 4120",
]
const SseSpaOnlyOne = [
    "CIS 3310",
    "ECON 4320",
    "ECON 4480",
    "ECON 4210",
    "ENGR 566",
    "FNCE 2030",
    "FNCE 2070",
    "FNCE 2090",
    "FNCE 2370",
    "FNCE 2390",
    "FNCE 2500",
    "FNCE 2250",
    "FNCE 2800",
    "FNCE 394",
    "FNCE 894",
    "FNCE 7210",
    "FNCE 9110",
    "MGMT 3000",
    "MGMT 3005",
    "MGMT 3500",
    "MGMT 246",
    "OIDD 1050",
    "OIDD 2450",
    "OPIM 2630",
    "BEPP 2630",
    "STAT 4710",
    "STAT 4700",
]
const SseSpaList = [
    "PHYS 2280",
    "BE 5400",
    "BE 5550",
    "BE 5410",
    "BE 3090",
    "BE 5660",
    "ESE 5660",
    "BE 5840",
    "BIOL 437",
    "ESE 5430",
    "EAS 3010",
    "CBE 3750",
    "CBE 543",
    "OIDD 2610",
    "ENVS 3550",
    "BEPP 2610",
    "BEPP 3050",
    "EAS 4010",
    "EAS 4020",
    "EAS 4030",
    "ENMG 5020",
    "MEAM 5030",
    "OIDD 2200",
    "OIDD 2240",
    "OIDD 3190",
    "OIDD 3530",
    "FNCE 2370",
    "FNCE 3920",
    "ECON 4130",
    "STAT 5200",
    "CPLN 5010",
    "CPLN 5050",
    "CPLN 5200",
    "CPLN 5500",
    "CPLN 6210",
    "CPLN 5500",
    "CPLN 6500",
    "CPLN 654",
    "CPLN 7500",
    "ESE 5500",
    "ESE 5500",
    "CBE 520",
    "ESE 4070",
    "ESE 5070",
    "ESE 408",
    "MEAM 410",
    "MEAM 5100",
    "MEAM 5200",
    "MEAM 6200",
    "ESE 6500",
    "CIS 5190",
    "CIS 5200",
    "CIS 5210",
    "CIS 5810",
    "ESE 5460",
    "ESE 6500",
    "STAT 4760",
]
const SeniorDesign1stSem = ["CIS 4000","CIS 4100","ESE 4500","MEAM 4450","BE 4950"]
const SeniorDesign2ndSem = ["CIS 4010","CIS 4110","ESE 4510","MEAM 4460","BE 4960"]

const WritingSeminarSsHTbs = new Map<string,CourseAttribute>([
    ["WRIT 0020", CourseAttribute.Humanities],
    ["WRIT 009", CourseAttribute.Humanities],
    ["WRIT 0100", CourseAttribute.Humanities],
    ["WRIT 0110", CourseAttribute.Humanities],
    ["WRIT 012", CourseAttribute.Humanities],
    ["WRIT 0130", CourseAttribute.Humanities],
    ["WRIT 0140", CourseAttribute.Humanities],
    ["WRIT 0150", CourseAttribute.Humanities],
    ["WRIT 0160", CourseAttribute.SocialScience],
    ["WRIT 0170", CourseAttribute.SocialScience],
    ["WRIT 0200", CourseAttribute.Humanities],
    ["WRIT 0210", CourseAttribute.TBS],
    ["WRIT 0220", CourseAttribute.TBS],
    ["WRIT 023", CourseAttribute.Humanities],
    ["WRIT 024", CourseAttribute.TBS],
    ["WRIT 0250", CourseAttribute.Humanities],
    ["WRIT 0260", CourseAttribute.Humanities],
    ["WRIT 0270", CourseAttribute.Humanities],
    ["WRIT 0280", CourseAttribute.SocialScience],
    ["WRIT 029", CourseAttribute.SocialScience],
    ["WRIT 0300", CourseAttribute.Humanities],
    ["WRIT 0310", CourseAttribute.TBS],
    ["WRIT 032", CourseAttribute.Humanities],
    ["WRIT 0330", CourseAttribute.Humanities],
    ["WRIT 0340", CourseAttribute.SocialScience],
    ["WRIT 035", CourseAttribute.SocialScience],
    ["WRIT 036", CourseAttribute.Humanities],
    ["WRIT 0370", CourseAttribute.SocialScience],
    ["WRIT 0380", CourseAttribute.SocialScience],
    ["WRIT 0390", CourseAttribute.Humanities],
    ["WRIT 0400", CourseAttribute.TBS],
    ["WRIT 0410", CourseAttribute.Humanities],
    ["WRIT 042", CourseAttribute.Humanities],
    ["WRIT 047", CourseAttribute.Humanities],
    ["WRIT 0480", CourseAttribute.SocialScience],
    ["WRIT 0490", CourseAttribute.Humanities],
    ["WRIT 0500", CourseAttribute.SocialScience],
    ["WRIT 0550", CourseAttribute.SocialScience],
    ["WRIT 056", CourseAttribute.Humanities],
    ["WRIT 0580", CourseAttribute.Humanities],
    ["WRIT 0590", CourseAttribute.SocialScience],
    ["WRIT 0650", CourseAttribute.TBS],
    ["WRIT 066", CourseAttribute.Humanities],
    ["WRIT 0670", CourseAttribute.Humanities],
    ["WRIT 0680", CourseAttribute.Humanities],
    ["WRIT 0730", CourseAttribute.Humanities],
    ["WRIT 0740", CourseAttribute.TBS],
    ["WRIT 075", CourseAttribute.SocialScience],
    ["WRIT 0760", CourseAttribute.SocialScience],
    ["WRIT 0770", CourseAttribute.SocialScience],
    ["WRIT 0820", CourseAttribute.Humanities],
    ["WRIT 0830", CourseAttribute.Humanities],
    ["WRIT 084", CourseAttribute.Humanities],
    ["WRIT 085", CourseAttribute.SocialScience],
    ["WRIT 086", CourseAttribute.Humanities],
    ["WRIT 087", CourseAttribute.Humanities],
    ["WRIT 0880", CourseAttribute.SocialScience],
    ["WRIT 0890", CourseAttribute.SocialScience],
    ["WRIT 090", CourseAttribute.TBS],
    ["WRIT 0910", CourseAttribute.Humanities],
    ["WRIT 0920", CourseAttribute.SocialScience],
    ["WRIT 125", CourseAttribute.Humanities],
    //WRIT 135 & WRIT 138 PEER TUTOR TRAINING, count as FEs
])

const NetsFullTechElectives = new Set<string>([
    "BEPP 2800",
    "BIOL 4536",
    "CIS 2400",
    "CIS 2620",
    "CIS 3310",
    "CIS 3410",
    "CIS 3500",
    "CIS 3800",
    "CIS 4190",
    "CIS 4210",
    "CIS 4500",
    "CIS 4600",
    "CIS 5110",
    "CIS 5150",
    "CIS 5190",
    "CIS 5210",
    "CIS 5300",
    "CIS 5450",
    "CIS 5500",
    "CIS 5520",
    "CIS 5530",
    "CIS 5600",
    "CIS 5800",
    "CIS 6250",
    "CIS 6770",
    "COMM 4590",
    "EAS 5070",
    "EAS 5460",
    "ECON 103",
    "ECON 2200",
    "ECON 2310",
    "ECON 4130",
    "ECON 4240",
    "ECON 4430",
    "ECON 4450",
    "ECON 4480",
    "ECON 4490",
    "ECON 4510",
    "ESE 2150",
    "ESE 2240",
    "ESE 302",
    "ESE 3050",
    "ESE 3250",
    "ESE 3600",
    "ESE 4000",
    "ESE 4210",
    "ESE 5390",
    "ESE 5400",
    "ESE 5430",
    "FNCE 206",
    "FNCE 2070",
    "FNCE 2370",
    "MATH 2410",
    "MATH 3600",
    "MKTG 2120",
    "MKTG 2710",
    "MKTG 3520",
    "MKTG 4760",
    "MKTG 7710",
    "MKTG 8520",
    "NETS 2130",
    "OIDD 2450",
    "OIDD 3190",
    "OIDD 352",
    "OIDD 3530",
    "OIDD 6130",
    "OIDD 9000",
    "OIDD 9040",
    "OIDD 9150",
    "SOCI 5351",
    "STAT 4310",
    "STAT 4320",
    "STAT 4330",
    "STAT 4420",
    "STAT 4710",
    "STAT 4760",
    "STAT 5110",
    "STAT 5200",
    "STAT 5420",
])
const NetsLightTechElectives = new Set<string>([
    "EAS 3060",
    "EAS 4030",
    "EAS 5060",
    "EAS 5450",
    "ECON 4460",
    "ESE 5670",
    "LGST 2220",
    "MKTG 2700",
    "MKTG 7120",
    "OIDD 2240",
    "OIDD 2610",
    "OIDD 316",
    "OIDD 3210",
    "OIDD 4690",
    "SOCI 5350",
    "STAT 4350",
])

// CIS MSE imported 16 Oct 2022
const CisMseNonCisElectivesRestrictions1 = new Set<string>([
    "EAS 500",
    "EAS 5100",
    "EAS 5120",
    "EAS 5450",
    "EAS 5460",
    "EAS 5900",
    "EAS 5950",
    "IPD 5150",
    "IPD 5290",
    "IPD 5720",
    "EDUC 6577",
    "NPLD 7920",
])
const CisMseNonCisElectivesRestrictions2 = new Set<string>([
    "FNCE 7370",
    "GAFL 5310",
    "GEOL 5700",
    "LARP 7430",
    "STAT 7770",
])
const CisMseNonCisElectives = new Set<string>([
    "BE 5160",
    "BE 5210",
    "BE 5300",
    "PHYS 5585",
    "BE 5670",
    "GCB 5670",
    "CRIM 502",
    "CRIM 6002",
    "EAS 5070",
    "ECON 6100",
    "ECON 6110",
    "ECON 7100",
    "ECON 7110",
    "ECON 713",
    "EDUC 5299",
    "EDUC 545",
    "EDUC 5152",
    "ENM 5020",
    "ENM 5030",
    "ENM 5220",
    "ENM 5400",
    "ESE 5000",
    "ESE 5040",
    "ESE 5050",
    "ESE 5070",
    "ESE 5140",
    "ESE 5160",
    "ESE 5190",
    "ESE 520",
    "ESE 5300",
    "ESE 5310",
    "ESE 5320",
    "ESE 534",
    "ESE 5350",
    "ESE 5390",
    "ESE 5400",
    "ESE 5420",
    "ESE 5430",
    "ESE 5460",
    "ESE 5440",
    "ESE 5450",
    "ESE 575",
    "ESE 576",
    "ESE 5900",
    "ESE 6050",
    "ESE 6180",
    "ESE 6500",
    "ESE 6650",
    "ESE 6740",
    "ESE 6760",
    "ESE 6800",
    "ESE 6800",
    "FNAR 5025",
    "GCB 5360",
    "LAW 5770",
    "LING 5150",
    "LING 5250",
    "LING 545",
    "LING 546",
    "LING 549",
    "MATH 5000",
    "MATH 5020",
    "MATH 5080",
    "MATH 5130",
    "MATH 5140",
    "MATH 5300",
    "MATH 5460",
    "STAT 530",
    "MATH 547",
    "STAT 531",
    "MATH 570",
    "MATH 571",
    "MATH 574",
    "MATH 5800",
    "MATH 5810",
    "MATH 582",
    "MATH 5840",
    "MATH 586",
    "BIOL 5860",
    "MATH 690",
    "MATH 691",
    "MEAM 5100",
    "MEAM 5200",
    "MEAM 521",
    "MEAM 6200",
    "MEAM 625",
    "MEAM 6460",
    "MSE 5610",
    "MSE 5750",
    "FNCE 611",
    "FNCE 7170",
    "FNCE 720",
    "FNCE 7210",
    "REAL 7210",
    "FNCE 7250",
    "FNCE 7380",
    "FNCE 7500",
    "FNCE 8920",
    "MKTG 7120",
    "MKTG 8520",
    "OIDD 6530",
    "OIDD 6540",
    "OIDD 6700",
    "OIDD 9500",
    "OIDD 9340",
    "STAT 5100",
    "STAT 5000",
    "STAT 5030",
    "STAT 5110",
    "STAT 5120",
    "STAT 550",
    "STAT 5150",
    "STAT 5200",
    "STAT 530",
    "STAT 531",
    "STAT 5330",
    "STAT 553",
    "STAT 5420",
    "STAT 5710",
    "STAT 7010",
    "STAT 7050",
    "STAT 5350",
    "STAT 7110",
    "STAT 7700",
    "STAT 7220",
    "STAT 900",
    "STAT 9280",
    "STAT 9300",
    "STAT 9700",
    "STAT 9740",
    "STAT 9910",
    "STAT 9910",
])

// ROBO imported 19 Oct 2022 from https://www.grasp.upenn.edu/academics/masters-degree-program/curriculum-information/technical-electives/
const RoboTechElectives = new Set<string>([
    "BE 5210",
    "BE 5700",
    "CIS 5020",
    "CIS 5110",
    "CIS 5150",
    "CIS 5190",
    "CIS 5200",
    "CIS 5210",
    "CIS 5260",
    "CIS 5300",
    "CIS 5400",
    "CIS 5410",
    "CIS 5450",
    "CIS 5600",
    "CIS 5620",
    "CIS 5630",
    "CIS 5640",
    "CIS 5650",
    "CIS 5800",
    "CIS 5810",
    "CIS 6100",
    "CIS 6200",
    "CIS 6250",
    "CIS 6800",
    "ENM 5100",
    "ENM 5110",
    "ENM 5200",
    "ENM 5210",
    "ESE 5000",
    "ESE 5040",
    "ESE 5050",
    "MEAM 5130",
    "ESE 5060",
    "ESE 5120",
    "ESE 5140",
    "ESE 518",
    "ESE 5190",
    "ESE 5300",
    "ESE 5310",
    "ESE 5460",
    "ESE 5470",
    "ESE 6050",
    "ESE 6150",
    "ESE 6170",
    "ESE 6180",
    "ESE 6190",
    "ESE 6250",
    "ESE 6500",
    "IPD 5010",
    "IPD 5160",
    "MEAM 5160",
    "MEAM 5080",
    "MEAM 5100",
    "MEAM 5130",
    "ESE 5050",
    "MEAM 5160",
    "IPD 5160",
    "MEAM 5170",
    "MEAM 5200",
    "MEAM 5350",
    "MEAM 5430",
    "MEAM 5450",
    "MEAM 6200",
    "MEAM 6240",
    "PSYC 5790",
    "ROBO 5990",
    "ROBO 5970",
])
const RoboGeneralElectives = new Set<string>([
    "CIS 5050",
    "CIS 5220",
    "CIS 5230",
    "CIS 5480",
    "CIS 5500",
    "CIS 5530",
    "CIS 7000",
    "EAS 5120",
    "EAS 5450",
    "EAS 5460",
    "ENM 5020",
    "ENM 5030",
    "ESE 5400",
    "ESE 5430",
    "ESE 5450",
    "ESE 6800",
    "IPD 5040",
    "BE 5140",
    "IPD 5110",
    "IPD 5140",
    "MEAM 5140",
    "IPD 5150",
    "IPD 5250",
    "IPD 5270",
    "ARCH 7270",
    "PHIL 5640",
])

// CGGT imported on 18 Oct 2022 from https://www.cis.upenn.edu/graduate/program-offerings/mse-in-computer-graphics-and-game-technology/requirements/
const CggtGraphicsElectives = ["CIS 4610", "CIS 5610", "CIS 5630", "CIS 5650", "FNAR 5670", "FNAR 6610", "FNAR 6650"]
const CggtTechnicalElectives = [
    "CIS 4190", "CIS 5190", "CIS 5200", "CIS 4550", "CIS 5550", "CIS 4610", "CIS 5610", "CIS 5630", "CIS 5640", "CIS 5800", "CIS 5810", "CIS 5990",
    "ESE 5050", "ESE 6190"]
const CggtBusiness = ["EAS 5450", "IPD 5150"]

// DATS imported 19 Oct 2022 from https://dats.seas.upenn.edu/programofstudy/
const DatsThesis = ["DATS 5970","DATS 5990"]
const DatsBiomedicine = [
    "BE 5210",
    "BE 5660",
    "BMIN 5210",
    "BMIN 5220",
    "CIS 5360",
    "CIS 5370",
    "PHYS 5850",
]
const DatsNetworkScience = [
    "CIS 5230",
    "ECON 7050",
    "ECON 7210",
    "ECON 7220",
    "MKTG 7760",
]
const DatsProgramming = [
    "CIS 5050",
    "CIS 4500",
    "CIS 5500",
    "CIS 5520",
    "CIS 4550",
    "CIS 5550",
    "CIS 5590",
    "CIS 5730",
    "CIT 5950",
]
const DatsStats = [
    "MKTG 7120",
    "OIDD 6120",
    "STAT 5350",
    //Accelerated Regression Analysis (STAT 6210) (limited to MBA students only)
    "STAT 7220",
    "STAT 9200",
    "STAT 9210",
    "STAT 9740",
]
const DatsAI = [
    "CIS 4210",
    "CIS 5210",
    "CIS 5220",
    "CIS 5300",
    "CIS 5800",
    "CIS 5810",
    "CIS 6200",
    "CIS 6250",
    "CIS 6800",
    "ESE 5140",
    "ESE 5460",
    "ESE 6500",
    "STAT 5710",
]
const DatsSimulation = [
    "CBE 5250",
    "CBE 5440",
    "CBE 5590",
    "MEAM 5270",
    "MEAM 6460",
    "MSE 5610",
]
const DatsMath = [
    "AMCS 5140",
    "CIS 5020",
    "CIS 6250",
    "CIS 6770",
    "CIT 5960",
    "ENM 5020",
    "ENM 5310",
    "ESE 5040",
    "ESE 5450",
    "ESE 5030",
    "ESE 6050",
    "ESE 6740",
    "OIDD 9300",
    "STAT 5150",
    "STAT 9270",
]

function myAssert(condition: boolean, message: string = "") {
    if (!condition) {
        throw new Error(message)
    }
}
function myAssertEquals(a: any, b: any, message: string = "") {
    if (a != b) {
        throw new Error(`expected ${a} == ${b} ${message}`)
    }
}
function myAssertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export enum GradeType {
    PassFail = "PassFail",
    ForCredit = "ForCredit",
}

export interface TechElectiveDecision {
    course4d: string,
    course3d: string,
    title: string,
    status: "yes" | "no" | "ask"
}

type UndergradDegree = "40cu CSCI" | "40cu ASCS" | "40cu CMPE" | "40cu ASCC" | "40cu NETS" | "40cu DMD" | "40cu EE" | "40cu SSE" |
    "37cu ASCS" | "37cu CSCI" | "37cu CMPE" | "37cu NETS" | "37cu DMD" | "none"
type MastersDegree = "CIS-MSE" | "DATS" | "ROBO" | "CGGT" | "none"

let IncorrectCMAttributes = new Set<string>()

abstract class DegreeRequirement {
    static NextUuid: number = 1
    readonly uuid: string

    /** How many CUs are needed to fulfill this requirement. Decremented as courses are applied to this requirement,
     * e.g., with 0.5 CU courses */
    public remainingCUs: number = 1.0

    /** How many CUs are needed to fulfill this requirement. Never changed after initialization. */
    public cus: number = 1.0

    /** The requirement needs courses to be at least this level, e.g., 2000. Use a 4-digit course number */
    public minLevel: number = 0

    /** Set to true for requirements that don't consume a course, e.g., SEAS Writing Requirement */
    public doesntConsume: boolean = false

    /** Used to sort requirements for display */
    readonly displayIndex: number

    /** toString() returns a detailed version of this requirement, e.g., listing all courses/attrs that will satisfy it */
    protected verbose: boolean = true

    /** which course(s) are currently applied to this requirement */
    public coursesApplied: CourseTaken[] = []

    constructor(displayIndex: number) {
        this.displayIndex = displayIndex
        this.uuid = `degreeReq_${DegreeRequirement.NextUuid}`
        DegreeRequirement.NextUuid += 1
    }

    /** consider the list `courses` and return one that applies to this requirement. Return `undefined` if nothing in
     * `courses` can be applied to this requirement */
    abstract satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined

    /** internal method for actually applying `c` to this requirement, decrementing CUs for both `c` and `this` */
    protected applyCourse(c: CourseTaken): boolean {
        if (this.doesntConsume) {
            if (this.remainingCUs > 0 && !this.coursesApplied.includes(c)) {
                this.coursesApplied.push(c)
                this.remainingCUs -= c.getCUs()
                myAssert(this.remainingCUs >= 0, this.toString())
                return true
            }
            return false
        }
        // don't split a 1cu course to try to fill our last 0.5cu
        if (c.courseUnitsRemaining > 0 && !(c.courseUnitsRemaining == 1 && this.remainingCUs == 0.5)) {
            if (c.consumedBy == undefined) {
                c.consumedBy = this
            }
            this.coursesApplied.push(c)
            const cusToUse = Math.min(c.courseUnitsRemaining, this.remainingCUs)
            c.courseUnitsRemaining -= cusToUse
            myAssert(c.courseUnitsRemaining >= 0, c.toString())
            this.remainingCUs -= cusToUse
            return true
        }
        return false
    }

    public unapplyCourse(c: CourseTaken) {
        myAssert(this.coursesApplied.includes(c), `${c} missing from ${this.coursesApplied.length} ${this.coursesApplied}`)

        // remove c from coursesApplied
        this.coursesApplied.splice(this.coursesApplied.indexOf(c), 1);
        if (this.doesntConsume) {
            this.remainingCUs = this.cus
            return
        }
        this.remainingCUs += c.getCUs()
        this.remainingCUs = Math.min(this.cus, this.remainingCUs)
        c.courseUnitsRemaining = c.getCUs()
        c.consumedBy = undefined
    }

    /** Set the required CUs for this requirement to be `n` */
    withCUs(n: number): DegreeRequirement {
        this.remainingCUs = n
        this.cus = n
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

    withConcise(): DegreeRequirement {
        this.verbose = false
        return this
    }

    public updateViewWeb(potential: boolean = false) {
        const myElem = $(`#${this.uuid}`)
        myElem.removeClass("requirementSatisfied")
        myElem.removeClass("requirementUnsatisfied")
        myElem.removeClass("requirementPartiallySatisfied")
        myElem.removeClass("requirementCouldBeSatisfied")
        if (potential) {
            myElem.addClass("requirementCouldBeSatisfied")
            return
        }
        const dontCare = false
        const courseText = this.doesntConsume ? " " + this.coursesApplied.map(c => c.code()).join(" and ") : ""
        if (this.remainingCUs == 0) {
            myElem.addClass("requirementSatisfied")
            const ro = new RequirementOutcome(dontCare, this, RequirementApplyResult.Satisfied, this.coursesApplied)
            myElem.find("span.outcome").text(ro.outcomeString() + courseText)
        } else if (this.remainingCUs < this.cus) {
            myElem.addClass("requirementPartiallySatisfied")
            const ro = new RequirementOutcome(dontCare, this, RequirementApplyResult.PartiallySatisfied, this.coursesApplied)
            myElem.find("span.outcome").text(ro.outcomeString() + courseText)
        } else {
            myElem.addClass("requirementUnsatisfied")
            const ro = new RequirementOutcome(dontCare, this, RequirementApplyResult.Unsatisfied, [])
            myElem.find("span.outcome").text(ro.outcomeString())
        }
    }

    public getStatus(): string {
        return `${this.toString()} has ${this.remainingCUs}/${this.cus} CUs remaining, ${this.coursesApplied} applied`
    }
}

/** Not a real requirement, a hack to show a label in the requirements list */
class RequirementLabel extends DegreeRequirement {
    readonly label: string
    /** `label` can contain HTML */
    constructor(displayIndex: number, label: string) {
        super(displayIndex)
        this.label = label
        this.cus = 0
        this.remainingCUs = 0
        this.doesntConsume = true
    }
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return undefined;
    }
    public updateViewWeb(potential: boolean = false) {
        const myElem = $(`#${this.uuid}`)
        myElem.find("span.outcome").empty()
        myElem.find("span.outcome").append(this.label)
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
                this.applyCourse(c)
        })
    }

    public toString(): string {
        if (this.verbose) {
            return `${this.tag}: ${this.courses}`
        } else {
            return this.tag
        }
    }
}

class BucketGroup {
    readonly coursesRequired: number = 0
    public requirements: RequireBucketNamedCourses[] = []
    constructor(coursesRequired: number) {
        this.coursesRequired = coursesRequired
    }
    public numSatisfied(): number {
        return this.requirements.filter(r => r.satisfiedLocally()).length
    }
    public allSatisfied(): boolean {
        return this.numSatisfied() == this.coursesRequired
    }
}
/** When we have buckets of named courses, and require students to cover k different buckets */
class RequireBucketNamedCourses extends RequirementNamedCourses {
    readonly groupName: string
    private group: BucketGroup | undefined = undefined
    constructor(displayIndex: number, tag: string, courses: string[], groupName: string) {
        super(displayIndex, tag, courses)
        this.groupName = groupName
    }
    public getBucketGroupCoursesRemaining(): number {
        return this.group!.coursesRequired - this.group!.numSatisfied()
    }
    public connectBucketGroup(coursesRequired: number, reqs: DegreeRequirement[]) {
        this.group = new BucketGroup(coursesRequired)
        reqs.filter(r => r instanceof RequireBucketNamedCourses)
            .map(r => <RequireBucketNamedCourses>r)
            .filter(r => r.groupName == this.groupName)
            .forEach(r => {
                this.group!.requirements.push(r)
                r.group = this.group
            })
    }
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // don't consume any more courses if our group is satisfied
        if (this.group!.allSatisfied()) {
            myAssertEquals(0, this.remainingCUs)
            return
        }
        // group not already satisfied
        const result = super.satisfiedBy(courses)
        if (this.group!.allSatisfied()) {
            // this course completed the last required bucket
            this.group!.requirements
                .filter(r => r.remainingCUs > 0)
                .forEach(r => {
                    r.remainingCUs = 0
                    r.updateViewWeb()
                })
        }
        return result
    }
    public satisfiedLocally(): boolean {
        return this.remainingCUs == 0 && this.coursesApplied.length > 0
    }
    public satisfiedByOtherBuckets(): boolean {
        return this.remainingCUs == 0 && this.coursesApplied.length == 0
    }
    public unapplyCourse(c: CourseTaken) {
        super.unapplyCourse(c)
        if (!this.group!.allSatisfied()) {
            // reset all the bucket reqs that are empty
            this.group!.requirements
                .filter(r => r.satisfiedByOtherBuckets())
                .forEach(r => {
                    r.remainingCUs = r.cus
                    r.updateViewWeb()
                })
        }
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
        // try to match something with the first attribute first
        for (let i = 0; i < this.attrs.length; i++) {
            const attr = this.attrs[i]
            const match = courses.slice()
                .sort(byHighestCUsFirst)
                .find((c: CourseTaken): boolean => {
                    const foundMatch = c.attributes.includes(attr)
                    return foundMatch &&
                        c.grading == GradeType.ForCredit &&
                        c.courseNumberInt >= this.minLevel &&
                        this.applyCourse(c)
                })
            if (match != undefined) {
                return match
            }
        }
        return undefined
    }

    public toString(): string {
        return `${this.tag}: ${this.attrs}`
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
                this.applyCourse(c)
        })
    }

    public toString(): string {
        if (this.verbose) {
            return `${this.tag}: ${this.courses} -OR- ${this.attrs}`
        } else {
            return this.tag
        }
    }
}

class RequirementNumbered extends DegreeRequirement {
    readonly tag: string
    readonly subject: string
    readonly numberPredicate: (x: number) => boolean
    readonly courses: Set<string>

    constructor(displayIndex: number,
                tag: string,
                subject: string,
                numberPredicate: (x: number) => boolean,
                courses: Set<string> = new Set<string>([])) {
        super(displayIndex)
        this.tag = tag
        this.subject = subject
        this.numberPredicate = numberPredicate
        this.courses = courses
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.find((c: CourseTaken): boolean => {
            const subjectMatch = this.subject == c.subject && this.numberPredicate(c.courseNumberInt)
            return (subjectMatch || this.courses.has(c.code())) &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c)
        })
    }

    public toString(): string {
        return this.tag
    }
}

class RequirementNaturalScienceLab extends RequirementNamedCourses {
    constructor(displayIndex: number, tag: string) {
        super(displayIndex, tag, CoursesWithLab15CUs.map(c => c + "lab").concat(StandaloneLabCourses05CUs))
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // only take 0.5 CUs at a time, representing the lab portion
        let matched = courses.find((c: CourseTaken): boolean =>
            this.courses.includes(c.code()) &&
            c.grading == GradeType.ForCredit &&
            c.courseUnitsRemaining >= 0.5 &&
            c.courseNumberInt >= this.minLevel &&
            this.applyCourse(c)
        )
        if (matched == undefined) return undefined

        if (matched.consumedBy == undefined) {
            matched.consumedBy = this
        }
        // matched.courseUnitsRemaining -= 0.5
        // this.remainingCUs -= 0.5
        return matched
    }

    public toString(): string {
        return this.tag
    }
}

/** Require CIS 1100, or a CIS/NETS Engineering course */
class RequireCis1100 extends DegreeRequirement {
    constructor(displayIndex: number) {
        super(displayIndex)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        const found1100 = courses.find((c: CourseTaken): boolean => {
            return c.code() == "CIS 1100" &&
                c.grading == GradeType.ForCredit &&
                this.applyCourse(c)
        })
        if (found1100 != undefined) {
            return found1100
        }

        // they didn't take CIS 1100, use a CIS/NETS Engineering course instead
        return courses.slice() // NB: have to use slice since sort() is in-place
            // try lower-number courses first
            .sort((a,b) => a.courseNumberInt - b.courseNumberInt)
            .find((c: CourseTaken): boolean => {
                const foundMatch = (c.subject == "CIS" || c.subject == "NETS") && !c.attributes.includes(CourseAttribute.NonEngr)
                return foundMatch &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "Major: CIS 1100"
    }
}

class RequirementCisElective extends DegreeRequirement {
    constructor(displayIndex: number) {
        super(displayIndex)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice() // NB: have to use slice since sort() is in-place
            // try to pull in CIS 19x courses
            .sort((a,b) => a.courseNumberInt - b.courseNumberInt)
            .find((c: CourseTaken): boolean => {
            const foundMatch = (c.subject == "CIS" || c.subject == "NETS") && !c.attributes.includes(CourseAttribute.NonEngr)
            return foundMatch &&
                c.grading == GradeType.ForCredit &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c)
        })
    }

    public toString(): string {
        return `CIS Elective >= ${this.minLevel}`
    }
}

class RequirementTechElectiveEngineering extends DegreeRequirement {
    readonly allowLinkingCourses: boolean

    constructor(displayIndex: number, allowLinking: boolean) {
        super(displayIndex)
        this.allowLinkingCourses = allowLinking
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
                const linking = this.allowLinkingCourses && EngrLinkingCourses.includes(c.code())
                return (c.suhSaysEngr() || linking) &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "Tech Elective (Engineering)"
    }
}

class RequirementCsci40TechElective extends DegreeRequirement {

    static techElectives = new Set<string>()

    constructor(displayIndex: number) {
        super(displayIndex)
        myAssert(RequirementCsci40TechElective.techElectives.size > 0, "CSCI 40cu TE list is empty(!)")
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        const specialTEList = ["LING 0500", "PHIL 2620", "PHIL 2640", "OIDD 2200", "OIDD 3210", "OIDD 3250"]

        return courses.slice()
            .sort((a,b): number => {
                const sshAttrs = [CourseAttribute.SocialScience,CourseAttribute.Humanities,CourseAttribute.TBS]
                const aIsSsh = sshAttrs.some(ssh => a.attributes.includes(ssh))
                const bIsSsh = sshAttrs.some(ssh => b.attributes.includes(ssh))
                if (!aIsSsh && bIsSsh) { return -1 } else
                if (aIsSsh && !bIsSsh) { return 1 }
                // both, or neither, are SS/H/TBS
                return 0
            })
            .find((c: CourseTaken): boolean => {
            return c.grading == GradeType.ForCredit &&
                (c.attributes.includes(CourseAttribute.MathNatSciEngr) ||
                    specialTEList.includes(c.code()) ||
                    RequirementCsci40TechElective.techElectives.has(c.code()) ||
                    c.partOfMinor) &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c)
        })
    }

    public toString(): string {
        return "Tech Elective"
    }
}

class RequirementAscs40TechElective extends RequirementCsci40TechElective {
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // PHIL 411 & PSYC 413 also listed on 40cu ASCS in PiT as valid TEs, but I think they got cancelled.
        const csciTE = super.satisfiedBy(courses)
        if (csciTE != undefined) {
            return csciTE
        }
        // allow Wharton courses in ASCS Concentration
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
                return c.grading == GradeType.ForCredit &&
                    ["ACCT","BEPP","FNCE","LGST","MGMT","MKTG","OIDD"].includes(c.subject) &&
                    c.courseNumberInt >= this.minLevel &&
                    !c.suhSaysNoCredit() &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "Concentration"
    }
}

class RequirementDmdElective extends DegreeRequirement {

    constructor(displayIndex: number) {
        super(displayIndex)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        const dmdSubjects = ["FNAR", "DSGN", "THAR", "MUSC"]

        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
                return dmdSubjects.includes(c.subject) &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "DMD Elective"
    }
}

class RequirementEngineeringElective extends DegreeRequirement {

    constructor(displayIndex: number) {
        super(displayIndex)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byLowestLevelFirst)
            .find((c: CourseTaken): boolean => {
                return c.suhSaysEngr() &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "Engineering Elective"
    }
}

class RequirementEseEngineeringElective extends DegreeRequirement {

    constructor(displayIndex: number) {
        super(displayIndex)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byLowestLevelFirst)
            .find((c: CourseTaken): boolean => {
                return c.subject == "ESE" &&
                    c.suhSaysEngr() &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "ESE Elective"
    }
}

class RequirementAdvancedEseElective extends DegreeRequirement {
    readonly eseOnly: boolean

    constructor(displayIndex: number, eseOnly: boolean) {
        super(displayIndex)
        this.eseOnly = eseOnly
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        const cmpe = [
            "ESE 3190", "ESE 3500", "ESE 3700", "ESE 4190",
            "ESE 5160", "ESE 5320", "ESE 5680", "ESE 5700",
            "ESE 5780", "ESE 6720", "CIS 3710", "CIS 4710",
            "CIS 5710"]
        const nano = [
            "ESE 3100", "ESE 3210", "ESE 3300",
            "ESE 3360", "ESE 4600", "ESE 5100",
            "ESE 5210", "ESE 5230", "ESE 5250",
            "ESE 5260", "ESE 5290", "ESE 6110",
            "ESE 6210", "ESE 6730"]
        const isd = [
            "ESE 3030", "ESE 3050", "ESE 3250",
            "ESE 4070", "ESE 5000", "ESE 5010",
            "ESE 5040", "ESE 5050", "ESE 5120",
            "ESE 5200", "ESE 5270", "ESE 5280",
            "ESE 5310", "ESE 5450", "ESE 5460",
            "ESE 5480", "ESE 5500", "ESE 5670",
            "ESE 5900", "ESE 6050", "ESE 6500",
            "ESE 6740", "BE 5210", "NETS 3120",
            "CIS 5200", "MEAM 5200", "MEAM 6200"]

        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
                return (cmpe.includes(c.code()) || nano.includes(c.code()) || isd.includes(c.code())) &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "ESE Advanced Elective"
    }
}

class RequirementEseProfessionalElective extends DegreeRequirement {
    readonly froshLevelEngr: boolean
    readonly allowedCourses: string[]

    constructor(displayIndex: number, froshLevelEngr: boolean, courses: string[] = []) {
        super(displayIndex)
        this.froshLevelEngr = froshLevelEngr
        this.allowedCourses = courses
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byLowestLevelFirst)
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
                if (this.froshLevelEngr) {
                    return c.suhSaysEngr() &&
                        c.grading == GradeType.ForCredit &&
                        c.courseNumberInt >= this.minLevel &&
                        this.applyCourse(c)
                }

                return (c.attributes.includes(CourseAttribute.MathNatSciEngr) || this.allowedCourses.includes(c.code())) &&
                    (!c.suhSaysEngr() || c.courseNumberInt >= 2000) &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "Professional Elective"
    }
}

class RequirementSpa extends DegreeRequirement {
    readonly light: boolean

    constructor(displayIndex: number, light: boolean) {
        super(displayIndex)
        this.light = light
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
                return (SseSpaList.includes(c.code()) || (this.light && SseSpaOnlyOne.includes(c.code()))) &&
                    c.grading == GradeType.ForCredit &&
                    c.courseNumberInt >= this.minLevel &&
                    this.applyCourse(c)
            })
    }

    public toString(): string {
        return "Societal Problem Application"
    }
}

class RequirementSsh extends RequirementAttributes {
    constructor(displayIndex: number, attrs: CourseAttribute[]) {
        super(displayIndex, SsHTbsTag, attrs)
    }

    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // count by subject for SS/H courses for the Depth Requirement
        let counts = countBySubjectSshDepth(courses)
        const mostPopularSubjectFirst = Array.from(counts.keys())
            .sort((a,b) => counts.get(b)! - counts.get(a)!)
            .filter((s: string): boolean => counts.get(s)! >= 2)

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
            return b.courseUnitsRemaining - a.courseUnitsRemaining
        }).find((c: CourseTaken): boolean => {
            const foundMatch = this.attrs.some((a) => c.attributes.includes(a))
            const gradeOk = c.grading == GradeType.ForCredit || c.grading == GradeType.PassFail
            return foundMatch &&
                gradeOk && c.courseNumberInt >= this.minLevel && this.applyCourse(c)

        })
    }

    public toString(): string {
        return `SS/H/TBS: ${this.attrs}`
    }
}

class RequirementSshDepth extends DegreeRequirement {
    satisfiedBy(sshCourses: CourseTaken[]): CourseTaken | undefined {
        const counts = countBySubjectSshDepth(sshCourses)
        const depthKeys = Array.from(counts.keys()).filter(k => counts.get(k)! >= 2)
        if (depthKeys.length > 0) {
            const depthCourses = sshCourses.filter(c => c.subject == depthKeys[0])
            this.coursesApplied = depthCourses.slice(0, 2)
            this.remainingCUs = 0
            return this.coursesApplied[0]
        } else {
            const eentCourses = [sshCourses.find(c => c.code() == "EAS 5450"), sshCourses.find(c => c.code() == "EAS 5460")]
            if (eentCourses.every(c => c != undefined)) {
                this.coursesApplied = eentCourses.map(c => c!)
                this.remainingCUs = 0
                return this.coursesApplied[0]
            }
        }
        return undefined
    }

    public toString(): string {
        return SshDepthTag
    }
}

class RequirementFreeElective extends DegreeRequirement {
    satisfiedBy(courses: CourseTaken[]): CourseTaken | undefined {
        // prioritize 1.0 CU courses
        return courses.slice()
            .sort(byHighestCUsFirst)
            .find((c: CourseTaken): boolean => {
            return !c.suhSaysNoCredit() &&
                (c.grading == GradeType.ForCredit || c.grading == GradeType.PassFail) &&
                c.courseNumberInt >= this.minLevel &&
                this.applyCourse(c)
        })
    }

    public toString(): string {
        return "Free Elective"
    }
}

/** Compute a map of SS+H courses for the given `courses`. Used for the SSH Depth Requirement.
 * @return a map from Subject => number of courses from that subject */
function countBySubjectSshDepth(courses: CourseTaken[]): Map<string,number> {
    const counts = new Map<string,number>()
    courses
        .filter((c: CourseTaken): boolean =>
            // SSH Depth courses need to be SS or H, though EAS 5450 + 5460 is (sometimes?) allowed via petition
            c.attributes.includes(CourseAttribute.Humanities) ||
            (c.attributes.includes(CourseAttribute.SocialScience) && c.code() != "EAS 2030") ||
            c.code() == "EAS 5450" || c.code() == "EAS 5460")
        .forEach(c => {
            if (counts.has(c.subject)) {
                counts.set(c.subject, 1 + counts.get(c.subject)!)
            } else {
                counts.set(c.subject, 1)
            }
        })
    return counts
}

/** used when sorting CourseTaken[] */
function byHighestCUsFirst(a: CourseTaken, b: CourseTaken): number {
    return b.courseUnitsRemaining - a.courseUnitsRemaining
}

/** used when sorting CourseTaken[] */
function byLowestLevelFirst(a: CourseTaken, b: CourseTaken): number {
    return a.courseNumberInt - b.courseNumberInt
}

/** Records a course that was taken and passed, so it can conceivably count towards some requirement */
export class CourseTaken {
    private static NextUuid: number = 0
    readonly uuid: string
    readonly subject: string
    readonly courseNumber: string
    readonly courseNumberInt: number
    readonly title: string
    readonly _3dName: string | null
    private courseUnits: number
    readonly grading: GradeType
    readonly letterGrade: string
    readonly term: number
    readonly attributes: CourseAttribute[]
    readonly allAttributes: string[]
    readonly completed: boolean
    /** true iff this course is used as part of an official minor */
    partOfMinor: boolean = false

    /** tracks which (if any) requirement has been satisfied by this course */
    consumedBy: DegreeRequirement | undefined = undefined
    /** the number of CUs of this course not yet consumed by any requirements */
    courseUnitsRemaining: number

    public copy(): CourseTaken {
        return new CourseTaken(
            this.subject,
            this.courseNumber,
            this.title,
            this._3dName,
            this.courseUnits,
            this.grading,
            this.letterGrade,
            this.term,
            this.allAttributes.join(";"),
            this.completed
        )
    }
    /** make a copy of this course, but the copy has only the given number of CUs */
    public split(cus: number, courseNumber: string): CourseTaken {
        const course = new CourseTaken(
            this.subject,
            courseNumber,
            this.title,
            this._3dName,
            cus,
            this.grading,
            this.letterGrade,
            this.term,
            "",
            this.completed
        )
        this.attributes.forEach(a => {
            if (!course.attributes.includes(a)) {
                course.attributes.push(a)
            }
        })
        return course
    }
    constructor(subject: string,
                courseNumber: string,
                title: string,
                _3dName: string | null,
                cus: number,
                grading: GradeType,
                letterGrade: string,
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
        this.letterGrade = letterGrade
        this.term = term
        this.completed = completed
        this.uuid = "course" + CourseTaken.NextUuid + "_" + this.code().replace(" ", "")
        CourseTaken.NextUuid += 1

        const attrs = new Set(rawAttributes
            .split(";")
            .filter((s) => s.includes("ATTRIBUTE="))
            .map((s) => s.trim().split("=")[1]))
        this.allAttributes = [...attrs]
        this.attributes = []
        this.allAttributes.forEach((attr: string) => {
            Object.values(CourseAttribute).forEach((a: CourseAttribute) => {
                if (a == attr) {
                    this.attributes.push(a)
                }
            })
        })

        // MANUAL HACKS DUE TO ATTRIBUTES MISSING IN CURRICULUM MANAGER

        if (this.code() == "CIS 4230" || this.code() == "CIS 5230") {
            delete this.attributes[this.attributes.indexOf(CourseAttribute.MathNatSciEngr)]
            this.attributes.push(CourseAttribute.NonEngr)
        }
        if (this.code() == "ESE 1120") {
            this.attributes.push(CourseAttribute.NonEngr)
        }
        if (this.code() == "CIS 5710" || this.code() == "CIS 4710") {
            if (this.attributes.includes(CourseAttribute.Humanities)) {
                this.attributes.splice(this.attributes.indexOf(CourseAttribute.Humanities), 1)
            }
        }

        if (NetsLightTechElectives.has(this.code())) {
            this.attributes.push(CourseAttribute.NetsLightTechElective)
        }
        if (NetsFullTechElectives.has(this.code())) {
            this.attributes.push(CourseAttribute.NetsFullTechElective)
        }

        if (WritingSeminarSsHTbs.has(this.code()) && !this.attributes.includes(CourseAttribute.Writing)) {
            this.attributes.push(CourseAttribute.Writing)
        }

        if (this.suhSaysSS() && !this.attributes.includes(CourseAttribute.SocialScience)) {
            this.attributes.push(CourseAttribute.SocialScience)
            IncorrectCMAttributes.add(`${this.code()} missing ${CourseAttribute.SocialScience}`)
        }
        if (this.suhSaysHum() && !this.attributes.includes(CourseAttribute.Humanities)) {
            this.attributes.push(CourseAttribute.Humanities)
            IncorrectCMAttributes.add(`${this.code()} missing ${CourseAttribute.Humanities}`)
        }

        // we have definitive categorization for TBS, Math, Natural Science and Engineering courses
        this.validateAttribute(this.suhSaysTbs(), CourseAttribute.TBS)
        this.validateAttribute(this.suhSaysMath(), CourseAttribute.Math)
        this.validateAttribute(this.suhSaysNatSci(), CourseAttribute.NatSci)
        this.validateAttribute(this.suhSaysEngr(), CourseAttribute.MathNatSciEngr)
        this.validateAttribute(RoboTechElectives.has(this.code()), CourseAttribute.RoboTechElective)
        this.validateAttribute(RoboGeneralElectives.has(this.code()), CourseAttribute.RoboGeneralElective)
        if (this.suhSaysEngr() && this.attributes.includes(CourseAttribute.NonEngr)) {
            IncorrectCMAttributes.add(`${this.code()} incorrectly has ${CourseAttribute.NonEngr}`)
        }
    }
    private validateAttribute(groundTruth: boolean, attr: CourseAttribute): void {
        if (groundTruth && !this.attributes.includes(attr)) {
            this.attributes.push(attr)
            IncorrectCMAttributes.add(`${this.code()} missing ${attr}`)
        }
        if (attr == CourseAttribute.MathNatSciEngr) {
            // Math and NS courses should have EUMS attribute, too
            if (this.attributes.includes(CourseAttribute.Math) || this.attributes.includes(CourseAttribute.NatSci)) {
                if (!this.attributes.includes(CourseAttribute.MathNatSciEngr)) {
                    this.attributes.push(CourseAttribute.MathNatSciEngr)
                }
                return
            }
        }
        if (this.attributes.includes(attr) && !groundTruth) {
            this.attributes.splice(this.attributes.indexOf(attr), 1)
            IncorrectCMAttributes.add(`${this.code()} incorrectly has ${attr}`)
        }
    }

    public toString(): string {
        let complete = this.completed ? "completed" : "in progress"
        let minor = this.partOfMinor ? "in minor" : ""
        return `${this.subject} ${this.courseNumber} ${this.title}, ${this.courseUnitsRemaining} out of ${this.courseUnits} CUs, ${this.grading} ${this.letterGrade}, taken in ${this.term}, ${complete}, ${this.attributes} ${minor}`
    }

    /** Return a course code like "ENGL 1234" */
    public code(): string {
        return `${this.subject} ${this.courseNumber}`
    }

    public getCUs(): number {
        return this.courseUnits
    }
    public setCUs(x: number) {
        this.courseUnits = x
        this.courseUnitsRemaining = x
    }
    /** Disable this course, e.g., when EAS 0091 is superceded by CHEM 1012 */
    public disable() {
        this.courseUnits = 0
        this.courseUnitsRemaining = 0
    }

    private countsTowardsGpa(): boolean {
        return (this.grading != GradeType.PassFail) &&
            CompletedGrades.includes(this.letterGrade) &&
            !["TR","P"].includes(this.letterGrade)
    }
    public getGpaCUs(): number {
        return this.countsTowardsGpa() ? this.courseUnits : 0
    }
    public getGpaPoints(): number {
        if (!this.countsTowardsGpa()) {
            return 0
        }
        const gpaTable = new Map<string,number>([
            ["A+", 4.0],
            ["A",  4.0],
            ["A-", 3.7],
            ["B+", 3.3],
            ["B",  3.0],
            ["B-", 2.7],
            ["C+", 2.3],
            ["C",  2.0],
            ["C-", 1.7],
            ["D+", 1.3],
            ["D",  1.0],
        ])
        myAssert(gpaTable.has(this.letterGrade), this.toString())
        return gpaTable.get(this.letterGrade)! * this.courseUnits
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies this course as Social Science.
     * NB: this is NOT an exhaustive list, and should be used in addition to course attributes. */
    private suhSaysSS(): boolean {
        // TODO: ASAM except where cross-listed with AMES, ENGL, FNAR, HIST, or SAST
        // TODO: ECON except statistics, probability, and math courses, [ECON 104 is not allowed]. Xlist not helpful
        // TODO: PSYC, SOCI except statistics, probability, and math courses. Xlist not helpful
        const ssSubjects = ["COMM","CRIM","GSWS","HSOC","INTR","PPE","PSCI","STSC","URBS"]
        const ssCourses = [
            "BEPP 2010","BEPP 2030","BEPP 2120","BEPP 2200","BEPP 2500",
            "EAS 2030","FNCE 1010",
            "LGST 1000","LGST 1010","LGST 2120","LGST 2150","LGST 2200",
            "NURS 3130","NURS 3150","NURS 3160","NURS 3300","NURS 5250"]
        return (this.courseNumberInt < 5000 && ssSubjects.includes(this.subject)) ||
            ssCourses.includes(this.code()) ||
            (this.subject == "LING" && this.courseNumber != "0700") ||
            WritingSeminarSsHTbs.get(this.code()) == CourseAttribute.SocialScience
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies this course as Humanities.
     * NB: this is NOT an exhaustive list, and should be used in addition to course attributes. */
    private suhSaysHum(): boolean {
        // TODO: ASAM cross-listed with AMES, ENGL, FNAR, HIST, and SARS only
        // TODO: PHIL except 005, 006, and all other logic courses. Does "logic" mean LGIC courses?
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
            // "any foreign language course", leverage attrs from SAS
            this.attributes.includes(CourseAttribute.SasLanguage) ||
            this.attributes.includes(CourseAttribute.SasAdvancedLanguage) ||
            this.attributes.includes(CourseAttribute.SasLastLanguage) ||
            humCourses.includes(this.code()) ||
            (this.subject == "VLST" && this.courseNumberInt != 2090) ||
            WritingSeminarSsHTbs.get(this.code()) == CourseAttribute.Humanities
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
            WritingSeminarSsHTbs.get(this.code()) == CourseAttribute.TBS
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies the course as Math.
     * NB: this IS intended to be a definitive classification */
    public suhSaysMath(): boolean {
        const mathCourses = [
            "CIS 1600", "CIS 2610",
            "EAS 205",
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
        return this.subject == "ENM" ||
            mathCourses.includes(this.code()) ||
            (this.subject == "MATH" && !prohibitedMathCourseNumbers.includes(this.courseNumberInt))
    }

    /** If this returns true, the SEAS Undergraduate Handbook classifies the course as Natural Science.
     * NB: this IS intended to be a definitive classification */
    public suhSaysNatSci(): boolean {
        const nsCourses = [
            "ASTR 1211", "ASTR 1212","ASTR 1250","ASTR 3392",
            "BE 3050", "CIS 3980", "ESE 1120", "MSE 2210",
            "MEAM 1100", "MEAM 1470",
            "PHYS 0050", "PHYS 0051", "PHYS 0140", "PHYS 0141",

            // jld: EAS 0091 is, practically speaking, EUNS. We check for the conflict with CHEM 1012 elsewhere
            "EAS 0091"
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
    public suhSaysEngr(): boolean {
        if (["VIPR 1200","VIPR 1210","NSCI 3010"].includes(this.code())) {
            return true
        }

        const engrSubjects = ["ENGR", "TCOM", "NETS", "BE", "CBE", "CIS", "ESE", "MEAM", "MSE"]
        const notEngrCourses = [
            "CIS 1050", "CIS 1070", "CIS 1250", "CIS 1600", "CIS 2610", "CIS 4230", "CIS 5230", "CIS 7980",
            "ESE 3010", "ESE 4020",
            // IPD courses cross listed with ARCH, EAS or FNAR do not count as Engineering
            // TODO: these IPD cross-lists are hard-coded, look them up automatically instead
            "IPD 5090", "IPD 5210", "IPD 5270", "IPD 5280", "IPD 5440", "IPD 5450", "IPD 5720",
            "MEAM 1100", "MEAM 1470",
            "MSE 2210",
        ]
        return (engrSubjects.includes(this.subject) && this.courseNumberInt < 6000) &&
            !notEngrCourses.includes(this.code()) &&
            this.courseNumberInt != 2960 && this.courseNumberInt != 2970
    }

    /** Returns true if this course is on the SUH No-Credit List */
    public suhSaysNoCredit(): boolean {
        const noCreditNsci = this.subject == "NSCI" && ![1020,2010,2020,3010,4010,4020].includes(this.courseNumberInt)
        const noCreditStat = this.subject == "STAT" && this.courseNumberInt < 4300 && !["STAT 4050", "STAT 4220"].includes(this.code())
        const noCreditPhys = this.subject == "PHYS" && this.courseNumberInt < 140 && !["PHYS 0050", "PHYS 0051"].includes(this.code())

        const noCreditList = ["ASTRO 0001", "EAS 5030", "EAS 5050", "MATH 1510", "MATH 1700",
            "FNCE 0001", "FNCE 0002", "HCMG 0001", "MGMT 0004", "MKTG 0001", "OIDD 0001"]

        // no-credit subject areas
        return (["CIT", "MSCI", "DYNM", "MED"].includes(this.subject)) ||
            noCreditList.includes(this.code()) ||
            noCreditPhys ||
            noCreditNsci ||
            noCreditStat
    }

    public updateViewWeb(asDoubleCount: boolean) {
        const myElem = $(`#${this.uuid}`)
        myElem.removeClass("courseCompleted")
            .removeClass("courseInProgress")
            .removeClass("courseDoubleCountCompleted")
            .removeClass("courseDoubleCountInProgress")
        if (asDoubleCount) {
            myElem.addClass(this.completed ? "courseDoubleCountCompleted" : "courseDoubleCountInProgress")
            return
        }
        myElem.addClass(this.completed ? "courseCompleted" : "courseInProgress")
    }
}

class CourseParserResult {
    courses: CourseTaken[] = []
    degrees: Degrees = new Degrees()
}
abstract class CourseParser {
    /** returns a parser object, inferred based on the given text */
    public static getParser(text: string): CourseParser {
        if (text.includes("Degree Works Release")) {
            return new DegreeWorksDiagnosticsReportParser()
        } else if (text.includes("Courses Completed") &&
            (text.match(/(Master|Bachelor) of Sci(ence)? in Engineering/) != null ||
                text.includes("Bachelor of Applied Science"))
        ) {
            return new DegreeWorksClassHistoryParser()
        }
        throw new Error("cannot parse courses")
    }

    /** Updates `degrees` IN-PLACE, using heuristics to identify students declared as CSCI but following
     * ASCS instead. Infer 37-vs-40 CU worksheet, disable equivalent courses, add MATH retroactive credit,
     * split 1.5cu courses. Returns updated list of courses. */
    protected postProcess(courses: CourseTaken[], degrees: Degrees, autoDegree: boolean): CourseTaken[] {

        // determine 37 vs 40 CUs
        const cusPerTerm = new Map<number, number>()
        courses.filter(c => c.letterGrade != "TR")
            .forEach(c => {
                if (cusPerTerm.has(c.term)) {
                    cusPerTerm.set(c.term, cusPerTerm.get(c.term)! + c.getCUs())
                } else {
                    cusPerTerm.set(c.term, c.getCUs())
                }
            })
        // find first term with at least 3 CUs
        degrees.firstTerm = Array.from(cusPerTerm.keys())
            .filter(t => cusPerTerm.get(t)! >= 3)
            .sort((a, b) => a - b)[0]

        if (autoDegree) {
            // is CSCI declared but courses are more like ASCS?
            const nonCsci = !courses.some(c => c.code() == "CIS 4710") &&
                !courses.some(c => c.code() == "CIS 5710") &&
                // !courses.some(c => c.code() == "CIS 3800") && // a fair number of ASCS students take 3800
                !courses.some(c => c.code() == "CIS 4000")
            if (nonCsci && degrees.undergrad == "40cu CSCI") {
                myLog("CSCI declared, but coursework is closer to ASCS so using ASCS requirements instead")
                degrees.undergrad = "40cu ASCS"
            }

            if (degrees.firstTerm! >= 202030) { // 37cu began in Fall 2020
                // degree inference always chooses 40cu, so switch some folks to 37cu
                switch (degrees.undergrad) {
                    case "40cu CSCI":
                        degrees.undergrad = "37cu CSCI"
                        break
                    case "40cu ASCS":
                        degrees.undergrad = "37cu ASCS"
                        break
                    case "40cu CMPE":
                        degrees.undergrad = "37cu CMPE"
                        break
                    case "40cu NETS":
                        degrees.undergrad = "37cu NETS"
                        break
                    case "40cu DMD":
                        degrees.undergrad = "37cu DMD"
                        break
                    default:
                        break
                }
            }
        }

        const newCourses = courses.slice()

        // Check for equivalent courses. If two are found, the first element of the pair is disabled
        const equivalentCourses: [string,string][] = [
            ["EAS 0091", "CHEM 1012"],
            ["ESE 3010", "STAT 4300"],
            // NB: only STAT 4310 will be retained out of STAT 4310, ESE 4020, ENM 3750
            ["ESE 4020", "STAT 4310"], ["ENM 3750", "STAT 4310"],
            ["ENM 2510", "MATH 2410"],
            ["ESE 1120", "PHYS 0151"],
            ["MEAM 1100", "PHYS 0150"],
            ["MEAM 1470", "PHYS 0150"],
            ["PHYS 0093", "PHYS 0150"],
            ["PHYS 0050", "PHYS 0150"],
            ["PHYS 0094", "PHYS 0151"],
            ["PHYS 0051", "PHYS 0151"],
            ["PHYS 093", "PHYS 0170"],
            ["PHYS 0050", "PHYS 0170"],
            ["PHYS 094", "PHYS 0171"],
            ["PHYS 0051", "PHYS 0171"],
        ]
        equivalentCourses.forEach((forbidden: [string,string]) => {
            if (courses.some((c: CourseTaken) => c.code() == forbidden[0]) &&
                courses.some((c: CourseTaken) => c.code() == forbidden[1])) {
                const msg = `took ${forbidden[0]} & ${forbidden[1]}, uh-oh: disabling ${forbidden[0]}`
                myLog(msg)
                console.log(msg)
                let c0 = courses.find((c: CourseTaken) => c.code() == forbidden[0])
                // disable the first of the equivalent courses
                c0!.disable()
            }
        })

        // Math retroactive credit
        // https://www.math.upenn.edu/undergraduate/advice-new-students/advanced-placement-transfer-retroactive-credit
        if (!courses.some((c: CourseTaken): boolean => c.code() == "MATH 1400") ) {
            const math1400Retro = courses.find((c: CourseTaken): boolean => {
                const calc = ["MATH 1410", "MATH 1610", "MATH 2400", "MATH 2600"].includes(c.code())
                const bOrBetter = ["A+", "A", "A-", "B+", "B"]
                let gradeOk
                if ([202010, 202020, 202030, 202110].includes(c.term)) { // Covid terms
                    gradeOk = bOrBetter.concat("P").includes(c.letterGrade)
                } else {
                    gradeOk = bOrBetter.includes(c.letterGrade)
                }
                return calc && gradeOk
            })
            if (math1400Retro != undefined) {
                const msg = "Using retro credit for Math 1400, must contact Math Department to make it official!"
                myLog(msg)
                const math1400 = new CourseTaken(
                    "MATH",
                    "1400",
                    Math1400RetroTitle,
                    "MATH 104",
                    1.0,
                    GradeType.ForCredit,
                    "TR",
                    math1400Retro.term,
                    "ATTRIBUTE=EUMA; ATTRIBUTE=EUMS;",
                    true)
                newCourses.push(math1400)
            }
        }
        // TODO: Math 2410 retro credit for students entering in Fall 2021 and earlier?
        // "For the Class of 2025 and earlier, if you pass Math 2410 at Penn with at least a grade of B, you may come to
        // the math office and receive retroactive credit for (and only one) Math 1400, Math 1410, or Math 2400"

        // heuristics to split some courses (like physics courses with labs) into 1.0 + 0.5 CU pieces
        const halfCuCourses: CourseTaken[] = []
        courses.forEach(c => {
            const nosplit =
                (["PHYS 0151","PHYS 0171","ESE 1120"].includes(c.code()) &&
                    ["40cu CMPE","40cu EE","37cu CMPE"].includes(degrees.undergrad)) ||
                (["PHYS 0150","PHYS 0170","PHYS 0151","PHYS 0171"].includes(c.code()) &&
                    degrees.undergrad == "40cu NETS") ||
                (["PHYS 0150","PHYS 0170","PHYS 0151","PHYS 0171","ESE 1120"].includes(c.code()) &&
                    ["37cu CSCI","37cu NETS"].includes(degrees.undergrad)) ||
                "37cu DMD" == degrees.undergrad
            if (CoursesWithLab15CUs.includes(c.code()) && !nosplit) {
                c.setCUs(c.getCUs() - 0.5)
                const lab = c.split(0.5, c.courseNumber + "lab")
                halfCuCourses.push(lab)
            }
            if (CoursesWith15CUsToSplit.includes(c.code())) {
                c.setCUs(c.getCUs() - 0.5)
                const half = c.split(0.5, c.courseNumber + "half")
                halfCuCourses.push(half)
            }
        })

        return newCourses.concat(halfCuCourses)
            .sort((a, b) => a.code().localeCompare(b.code()))
    }

    abstract extractPennID(worksheetText: string): string | undefined
    async parse(text: string, degrees: Degrees | undefined): Promise<CourseParserResult> {
        throw new Error("unreachable")
    }
}

interface _4DigitCourse {
    _4d: string
    title: string
    title_3d?: string
}
interface _3digitTo4DigitMap {
    [index: string]: _4DigitCourse
}

class DegreeWorksClassHistoryParser extends CourseParser {
    constructor() {
        super();
    }

    extractPennID(worksheetText: string): string | undefined {
        const pidMatch = worksheetText.match(/^Student ID\s+^(?<pid>\d{8})/m)
        if (pidMatch != undefined) {
            return pidMatch.groups!["pid"]
        }
        return undefined
    }

    private parseDegrees(text: string): Degrees {
        const deg = new Degrees()

        if (text.match(/Bachelor of Sci(ence)? in Engineering/) != null) {
            // there's an undergrad degree
            if (text.match(/Majors? Computer Science/) != null) {
                deg.undergrad = "40cu CSCI"
            } else if (text.match(/Majors? Computer Engineering/) != null) {
                deg.undergrad = "40cu CMPE"
            } else if (text.match(/Majors? Digital Media Design/) != null) {
                deg.undergrad = "40cu DMD"
            } else if (text.match(/Majors? Networked And Social Systems/) != null) {
                deg.undergrad = "40cu NETS"
            } else if (text.match(/Majors? Electrical Engineering/) != null) {
                deg.undergrad = "40cu EE"
            } else if (text.match(/Majors? Systems Science & Engineering/) != null) {
                deg.undergrad = "40cu SSE"
            }
        } else if (text.includes("Bachelor of Applied Science")) {
            if (text.match(/Majors? Appl Science-Computer Science/) != null) {
                deg.undergrad = "40cu ASCS"
            } else if (text.match(/Majors? Appl Science In Comp & Cog.Sc/) != null) {
                deg.undergrad = "40cu ASCC"
            }
        }
        if (text.match(/Master of Sci(ence)? in Engineering/) != null) {
            // there's a masters degree
            if (text.match(/Majors? Computer & Information Science/) != null) {
                deg.masters = "CIS-MSE"
            } else if (text.match(/Majors? Robotics/) != null) {
                deg.masters = "ROBO"
            } else if (text.match(/Majors? Data Science/) != null) {
                deg.masters = "DATS"
            } else if (text.match(/Majors? Comp Graphics & Game Tech/) != null) {
                deg.masters = "CGGT"
            }
        }

        if (deg.undergrad == "none" && deg.masters == "none") {
            throw new Error("couldn't parse any degrees")
        }
        return deg
    }

    async parse(text: string, degrees: Degrees | undefined): Promise<CourseParserResult> {
        const result = new CourseParserResult()
        if (degrees != undefined) {
            result.degrees = degrees
        } else {
            result.degrees = this.parseDegrees(text)
        }

        const response = await fetch(window.location.origin + "/3d_to_4d_course_translation.json")
        const _324 = <_3digitTo4DigitMap>await response.json()

        const courseText = text.substring(text.indexOf("Courses Completed"))
        const courseLines = courseText.split(/\r?\n/)

        let minorCourses: string[] = []
        const minorPattern = /Minor in (?<subject>[\w ]+)(COMPLETE|INCOMPLETE|IN-PROGRESS|COMPLETED|SEE ADVISOR)(?<courses>.*?)(Elective Coursework|In-progress|Over The Limit|Exceptions|Courses Not Applied)/s
        const minorCourseText = text.match(minorPattern)
        if (minorCourseText != null) {
            const allMinors = text.match(/^Minor in .*[a-z]/mg)
            const minorNames = Array.from(new Set<string>(allMinors!.map((v,i,a) => v)))
            myLog("Found " + minorNames.join(", "))
            const courses = minorCourseText.groups!["courses"].match(/[A-Z]{2,4} \d{3,4}/g)
            minorCourses = courses!.map((v,i,all) => v)

        } else {
            // TODO: minor detection is broken due to lack of section headers in Chrome/Firefox
            // const minorPattern = /^(?<subject>[\w ]+) +Minor Requirements$(?<courses>.*?)(Course\s+Title|Type\s+Description)/sm
            // const minorCourseText = text.match(minorPattern)
            // if (minorCourseText != null) {
            //     const allMinors = text.match(/^(?<subject>[\w ]+) +Minor Requirements$/mg)
            //     myLog("Found " + allMinors!.map((v,i,a) => v).join(", "))
            //     const courses = minorCourseText.groups!["courses"].match(/[A-Z]{2,4} \d{3,4}/g)
            //     minorCourses = courses!.map((v,i,all) => v)
            // }
        }

        const coursePattern = /(?<subject>[A-Z]{2,4}) (?<number>\d{3,4})\s+(?<title>.*?)\s+(?<grade>A\+|A|A-|B\+|B|B-|C\+|C|C-|D\+|D|F|P|TR|GR|NR|I|NA)\s+(?<cus>0?\.5|1\.5|1|2)/
        const termPattern = /(?<season>Spring|Summer|Fall) (?<year>\d{4})/

        let term:number = 0
        courseLines.forEach(line => {
            let hits = termPattern.exec(line)
            if (hits != null) {
                term = parseInt(hits.groups!["year"]) * 100
                switch (hits.groups!["season"]) {
                    case "Spring":
                        term += 10
                        break
                    case "Summer":
                        term += 20
                        break
                    case "Fall":
                        term += 30
                        break
                    default:
                        throw new Error(`invalid term ${line}`)
                }
                return
            }
            hits = coursePattern.exec(line)
            if (hits != null) {
                let subject = hits.groups!["subject"]
                let number = hits.groups!["number"]
                const _3dCode = `${subject} ${number}`
                if (number.length == 3 && _324.hasOwnProperty(_3dCode)) {
                    const _4dInfo = _324[_3dCode]
                    subject = _4dInfo._4d.split(" ")[0]
                    number = _4dInfo._4d.split(" ")[1]
                }

                const c = this.parseOneCourse(
                    subject,
                    number,
                    hits.groups!["title"],
                    hits.groups!["cus"],
                    hits.groups!["grade"],
                    term)
                if (c != null) {
                    if (minorCourses.includes(_3dCode)) {
                        c.partOfMinor = true
                    }
                    result.courses.push(c)
                }
                return
            }
        })

        result.courses = this.postProcess(result.courses, result.degrees, degrees == undefined)
        return result
    }

    private parseOneCourse(subject: string, number: string, title:string, cus: string, grade:string, term:number): CourseTaken | null {
        let gradeType = grade == "P" ? GradeType.PassFail : GradeType.ForCredit
        if (CovidTerms.includes(term) && gradeType == GradeType.PassFail) {
            gradeType = GradeType.ForCredit
        }

        const inProgress = grade == "NA"
        if (!inProgress && !CompletedGrades.includes(grade)) {
            myLog(`Ignoring failed/incomplete course ${subject} ${number} from ${term} with grade of ${grade}`)
            return null
        }

        return new CourseTaken(
            subject,
            number,
            title,
            null,
            parseFloat(cus),
            gradeType,
            grade,
            term,
            "",
            !inProgress)
    }
}

class DegreeWorksDiagnosticsReportParser extends CourseParser {
    constructor() {
        super();
    }
    public extractPennID(worksheetText: string): string | undefined {
        const matches = worksheetText.match(/Student\s+(\d{8})/)
        if (matches != null) {
            return matches![1]
        }
        return undefined
    }

    public async parse(text: string, degrees: Degrees | undefined): Promise<CourseParserResult> {
        const result = new CourseParserResult()
        result.courses = this.extractCourses(text)
        if (degrees != undefined) {
            result.degrees = degrees
        } else {
            const deg = this.parseDegrees(text)
            myAssert(deg != undefined, "could not infer DegreeWorks degree")
            //console.log("inferred degrees as " + deg)
            result.degrees = deg!
        }
        result.courses = this.postProcess(result.courses, result.degrees, degrees == undefined)
        // get catalog year from Goal Data, check if it is right
        // MAJOR	NETS	2023	Networked And Social Systems
        const catalogYear = text.match(/MAJOR\s+(CSCI|ASCS|NETS|DMD|CMPE|SSE|EE)\s+(?<catalogYear>\d{4})\s+/)
        if (catalogYear != null) {
            result.degrees.undergradMajorCatalogYear = parseInt(catalogYear.groups!["catalogYear"])
        }
        return result
    }

    private extractCourses(worksheetText: string): CourseTaken[] {
        let coursesTaken: CourseTaken[] = []

        const courseTakenPattern = new RegExp(String.raw`(?<subject>[A-Z]{2,4}) (?<number>\d{3,4})(?<restOfLine>.*)\nAttributes\t(?<attributes>.*)`, "g")
        let numHits = 0
        while (numHits < 100) {
            let hits = courseTakenPattern.exec(worksheetText)
            if (hits == null) {
                break
            }
            let c = this.parseOneCourse(
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
                    myLog(`found courses used for minor in ${line}`)
                    line.substring("Applied:".length).split(")").forEach(c => {
                        let name = c.split("(")[0].trim()
                        let course = coursesTaken.find((c: CourseTaken): boolean => c.code() == name || c._3dName == name)
                        if (course != undefined) {
                            course.partOfMinor = true
                        }
                    })
                })
        }

        return coursesTaken
    }

    private parseOneCourse(subject: string, courseNumber: string, courseInfo: string, rawAttrs: string): CourseTaken | null {
        const code = `${subject} ${courseNumber}`
        const parts = courseInfo.split("\t")
        const letterGrade = parts[1].trim()
        const creditUnits = parseFloat(parts[2])
        const term = parseInt(parts[4])
        const inProgress = parts[7] == "YIP"
        const passFail = parts[9] == "YFP"
        let gradingType = passFail ? GradeType.PassFail : GradeType.ForCredit
        // const numericGrade = parseFloat(parts[12])
        const title = parts[21].trim()

        if (CovidTerms.includes(term) && gradingType == GradeType.PassFail) {
            gradingType = GradeType.ForCredit
        }

        if (!inProgress && !CompletedGrades.includes(letterGrade)) {
            myLog(`Ignoring failed/incomplete course ${code} from ${term} with grade of ${letterGrade}`)
            return null
        }

        const _4d = parts[28]
            .replace("[", "")
            .replace("]","").trim()
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
                letterGrade,
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
            letterGrade,
            term,
            rawAttrs,
            !inProgress)
    }

    private parseDegrees(worksheetText: string): Degrees | undefined {
        let d = new Degrees()

        // undergrad degrees
        if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+CSCI\s+`, "m")) != -1) {
            d.undergrad =  "40cu CSCI"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+ASCS\s+`, "m")) != -1) {
            d.undergrad =  "40cu ASCS"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+CMPE\s+`, "m")) != -1) {
            d.undergrad =  "40cu CMPE"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+NETS\s+`, "m")) != -1) {
            d.undergrad =  "40cu NETS"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+DMD\s+`, "m")) != -1) {
            d.undergrad =  "40cu DMD"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+EE\s+`, "m")) != -1) {
            d.undergrad =  "40cu EE"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+SSE\s+`, "m")) != -1) {
            d.undergrad =  "40cu SSE"
        }

        // masters degrees
        if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+CIS\s+`, "m")) != -1) {
            d.masters = "CIS-MSE"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+ROBO\s+`, "m")) != -1) {
            d.masters = "ROBO"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+DATS\s+`, "m")) != -1) {
            d.masters = "DATS"
        } else if (worksheetText.search(new RegExp(String.raw`^RA\d+:\s+MAJOR\s+=\s+CGGT\s+`, "m")) != -1) {
            d.masters = "CGGT"
        }

        if (d.undergrad == "none" && d.masters == "none") {
            return undefined
        }
        return d
    }
}

const NodeCoursesTaken = "#coursesTaken"
const NodeDoubleColumn = "#columns1And2"
const NodeColumn1Header = "#col1Header"
const NodeColumn1Reqs = "#col1Reqs"
const NodeColumn2Reqs = "#col2Reqs"
const NodeColumn3Header = "#col3Header"
const NodeColumn3Reqs = "#col3Reqs"
const NodeRemainingCUs = "#remainingCUs"
const NodeDoubleCounts = "#doubleCounts"
const NodeStudentInfo = "#studentInfo"
const NodeAlerts = "#alerts"
const NodeGpa = "#gpa"
const NodeUnusedCoursesHeader = "#unusedCoursesHeader"
const NodeCoursesList = "#usedCoursesList"
const NodeUnusedCoursesList = "#unusedCoursesList"
const NodeMessages = "#messages"
const NodeAllCourses = "#allCourses"

export class Degrees {
    undergrad: UndergradDegree = "none"
    masters: MastersDegree = "none"
    firstTerm: number|undefined = undefined
    /** DW Diagnostics Report's catalog year, 2023 means 2022-2023 AY */
    undergradMajorCatalogYear: number|undefined = undefined

    public toString(): string {
        let s = ""
        if (this.undergrad != "none") {
            s += this.undergrad
        }
        if (this.masters != "none") {
            if (this.undergrad != "none") {
                s += " and "
            }
            s += this.masters
        }
        return s
    }

    public getUndergradCUs(): number {
        myAssert(this.undergrad != "none")
        if (this.undergrad.startsWith("40cu")) {
            return 40
        }
        myAssert(this.undergrad.startsWith("37cu"))
        return 37
    }

    public hasWrongDwCatalogYear(): boolean {
        return this.firstTerm != undefined && this.undergradMajorCatalogYear != undefined &&
            this.firstTerm < 202030 && this.undergradMajorCatalogYear >= 2021
    }
}

function snapCourseIntoPlace(course: CourseTaken, req: DegreeRequirement) {
    myAssert(req.coursesApplied.length > 0)
    if (req.coursesApplied[0] == course) {
        myAssert($(`#${course.uuid}`) != undefined, course.toString())
        myAssert($(`#${req.uuid}_snapTarget`) != undefined, req.toString())
        $(`#${course.uuid}`).position({
            my: "left center",
            at: "right center",
            of: $(`#${req.uuid}_snapTarget`),
        })
        return
    }
    myAssert(req.coursesApplied.length <= 2)
    // NB: never more than 2 course applied to any one req
    $(`#${course.uuid}`).position({
        my: "left center",
        at: "right center",
        of: $(`#${req.coursesApplied[0].uuid}`),
    })
}

function runTestInputDWDiagnosticsReport(): void {
    const sampleDegreeWorksDiagnosticsReport = `
Diagnostics Report
Student\t12345678
Degree Works Release\t5.0.4.2

RA000817: MAJOR = ROBO
Class Information   CIS  520, 522, 530, 545, 700, 7000, 7000, DATS  5990, EAS  8970, ESE  542
Course Hide\tGrade\tCredits\tId-num\tTerm\tForce insuff\tForce fallthru\tIn-progress\tIncomplete\tPassfail\tPassed\tGrade Pts\tNumeric Grade\tGPA Grade Pts\tGPA Credits\tGrade type\tRepeat disc\tRepeat num\tRepeat policy\tReason insuff\tWITH data\tCourse title\tSS Credits\tLocation / Campus\tRec-type\tRec-seq\tError\tStatus\tEquivalence\tTransfer\tTransfer code\tTransfer type\tTransfer course\tTransfer school\tSchool / Level\tSection
CIS 520 E\tA- \t1\t0004\t202130\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tMachine Learning\t1\tPHL \tC\t \t \tA  \t[CIS 5200]  \tC\tAC \tAC  \t \t \tPR \t001
Attributes\tDWSISKEY=Z1644; ATTRIBUTE=ABBT; ATTRIBUTE=EMRT;
MEAM 510 E\tA \t1\t0013\t202210\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tDesign of Mechatronic Systems\t1\tPHL \tC\t \t \tA  \t[MEAM 5100]  \tC\tAC \tAC  \t \t \tPR \t002
Attributes\tDWSISKEY=Z1690;
CIS 580 E\tA \t1\t0007\t202130\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tMachine Perception\t1\tPHL \tC\t \t \tA  \t[CIS 5800]  \tC\tAC \tAC  \t \t \tPR \t001
Attributes\tDWSISKEY=Z1649; ATTRIBUTE=ALNR; ATTRIBUTE=EMRT;
CIS 545 E\tA \t1\t0010\t202210\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tBig Data Analytics\t1\tPHL \tC\t \t \tA  \t[CIS 5450]  \tC\tAC \tAC  \t \t \tPR \t001
Attributes\tDWSISKEY=Z1693; ATTRIBUTE=ABCB; ATTRIBUTE=AMAM; ATTRIBUTE=EMRT; ATTRIBUTE=MPAE; ATTRIBUTE=WMBS; ATTRIBUTE=WUBC; ATTRIBUTE=WUBD; ATTRIBUTE=WUBN;

RA000673: MAJOR = CMPE\tClasses applied: 24\tCredits applied: 26.5
NETS 112 E\tA \t1\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tProg Lang & Tech I\t1\tPHL \tC\t \t \tA  \t[NETS 1120]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=NURS; ATTRIBUTE=UNBF; ATTRIBUTE=UNFF; ATTRIBUTE=WUNM; DWSISKEY=Z1695; ATTRIBUTE=ACGC; ATTRIBUTE=ACGL; ATTRIBUTE=ACGN; ATTRIBUTE=ALCN; ATTRIBUTE=ALNR; ATTRIBUTE=AU16; ATTRIBUTE=AUFR; ATTRIBUTE=EUMS; ATTRIBUTE=HEBF;
NETS 212 E\tA \t1\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tProg Lang & Tech I\t1\tPHL \tC\t \t \tA  \t[NETS 2120]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=NURS; ATTRIBUTE=UNBF; ATTRIBUTE=UNFF; ATTRIBUTE=WUNM; DWSISKEY=Z1695; ATTRIBUTE=ACGC; ATTRIBUTE=ACGL; ATTRIBUTE=ACGN; ATTRIBUTE=ALCN; ATTRIBUTE=ALNR; ATTRIBUTE=AU16; ATTRIBUTE=AUFR; ATTRIBUTE=EUMS; ATTRIBUTE=HEBF;
NETS 312 E\tA \t1\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tProg Lang & Tech I\t1\tPHL \tC\t \t \tA  \t[NETS 3120]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=NURS; ATTRIBUTE=UNBF; ATTRIBUTE=UNFF; ATTRIBUTE=WUNM; DWSISKEY=Z1695; ATTRIBUTE=ACGC; ATTRIBUTE=ACGL; ATTRIBUTE=ACGN; ATTRIBUTE=ALCN; ATTRIBUTE=ALNR; ATTRIBUTE=AU16; ATTRIBUTE=AUFR; ATTRIBUTE=EUMS; ATTRIBUTE=HEBF;
DSGN 100 E\tA \t1\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tProg Lang & Tech I\t1\tPHL \tC\t \t \tA  \t[DSGN 1000]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=NURS; ATTRIBUTE=UNBF; ATTRIBUTE=UNFF; ATTRIBUTE=WUNM; DWSISKEY=Z1695; ATTRIBUTE=ACGC; ATTRIBUTE=ACGL; ATTRIBUTE=ACGN; ATTRIBUTE=ALCN; ATTRIBUTE=ALNR; ATTRIBUTE=AU16; ATTRIBUTE=AUFR; ATTRIBUTE=HEBF;
DSGN 101 E\tA \t1\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tProg Lang & Tech I\t1\tPHL \tC\t \t \tA  \t[DSGN 1001]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=NURS; ATTRIBUTE=UNBF; ATTRIBUTE=UNFF; ATTRIBUTE=WUNM; DWSISKEY=Z1695; ATTRIBUTE=ACGC; ATTRIBUTE=ACGL; ATTRIBUTE=ACGN; ATTRIBUTE=ALCN; ATTRIBUTE=ALNR; ATTRIBUTE=AU16; ATTRIBUTE=AUFR; ATTRIBUTE=HEBF;
DSGN 102 E\tA \t1\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tProg Lang & Tech I\t1\tPHL \tC\t \t \tA  \t[DSGN 1002]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=NURS; ATTRIBUTE=UNBF; ATTRIBUTE=UNFF; ATTRIBUTE=WUNM; DWSISKEY=Z1695; ATTRIBUTE=ACGC; ATTRIBUTE=ACGL; ATTRIBUTE=ACGN; ATTRIBUTE=ALCN; ATTRIBUTE=ALNR; ATTRIBUTE=AU16; ATTRIBUTE=AUFR; ATTRIBUTE=HEBF;

PHYS 150 E\tA \t1.5\t0011\t201930\t \t \t \t \t \t \t4\t4\t4\t1.5\tZ \t \t \t \t \t \tPrinciples I\t1.5\tPHL \tC\t \t \tA  \t[PHYS 0150]  \tC\tAC \tAC  \t \t \tUG \t003
Attributes\tATTRIBUTE=WUNM; DWSISKEY=Z6359; ATTRIBUTE=ABBM; ATTRIBUTE=ABBN; ATTRIBUTE=AERH; ATTRIBUTE=AMOR; ATTRIBUTE=AUPW; ATTRIBUTE=AUQD; ATTRIBUTE=EUMS; ATTRIBUTE=EUNS; ATTRIBUTE=UNFF;
ESE 112 E\tP \t1.5\t0024\t202010\t \t \t \t \tYPF\t \t0\t0\t0\t0\tZ \t \t \t \t \t \tEng Electromagnetics\t1.5\tPHL \tC\t \t \tA  \t[ESE 1120]  \tC\tAC \tAC  \t \t \tUG \t001
Attributes\tDWSISKEY=Z3498; ATTRIBUTE=UNFF;
CHEM 1101 E\tA \t0.5\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t0.5\tZ \t \t \t \t \t \tGeneral Chemistry Lab I\t0.5\tPHL \tC\t \t \tA  \t[CHEM 1101]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=EUNS;
CHEM 1102 E\tA \t0.5\t0007\t201930\t \t \t \t \t \t \t4\t4\t4\t0.5\tZ \t \t \t \t \t \tGeneral Chemistry Lab II\t0.5\tPHL \tC\t \t \tA  \t[CHEM 1102]  \tC\tAC \tAC  \t \t \tUG \t002
Attributes\tATTRIBUTE=EUNS;

EAS 203 E\tA \t1\t0081\t202130\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tEngineering Ethics\t1\tPHL \tC\t \t \tA  \t[EAS 2030]  \tC\tAC \tAC  \t \t \tUG \t001
Attributes\tDWSISKEY=Z2247; ATTRIBUTE=APPE; ATTRIBUTE=ASTB; ATTRIBUTE=ASTI; ATTRIBUTE=EUNE; ATTRIBUTE=EUNP; ATTRIBUTE=EUSS; ATTRIBUTE=WUFG;
WRIT 037 E\tA \t1\t0018\t202010\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tDecision Making\t1\tPHL \tC\t \t \tA  \t[WRIT 0370]  \tC\tAC \tAC  \t \t \tUG \t301
Attributes\tDWSISKEY=Z9016; ATTRIBUTE=AUWR; ATTRIBUTE=EUSS; ATTRIBUTE=UNFF;
PHIL 157 E\tA \t1\t0094\t202210\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tRepairing The Climate\t1\tPHL \tC\t \t \tA  \t[ENVS 1043]  \tC\tAC \tAC  \t \t \tUG \t401
Attributes\tDWSISKEY=Z6059; ATTRIBUTE=APLS; ATTRIBUTE=AUNM; ATTRIBUTE=EUHS;
PHIL 001 E\tB+ \t1\t0072\t202130\t \t \t \t \t \t \t3.3\t3.3\t3.3\t1\tZ \t \t \t \t \t \tIntro To Philosophy\t1\tPHL \tC\t \t \tA  \t[PHIL 1000]  \tC\tAC \tAC  \t \t \tUG \t001
Attributes\tDWSISKEY=Z5859; ATTRIBUTE=AUHS; ATTRIBUTE=EUHS; ATTRIBUTE=NUAL; ATTRIBUTE=NUHT; ATTRIBUTE=UNFF; ATTRIBUTE=UNSA; ATTRIBUTE=WUCN; ATTRIBUTE=WUSS;
STSC 168 E\tA \t1\t0084\t202130\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tEnvironment And Society\t1\tPHL \tC\t \t \tA  \t[STSC 1880]  \tC\tAC \tAC  \t \t \tUG \t001
Attributes\tDWSISKEY=Z6767; ATTRIBUTE=AEHH; ATTRIBUTE=AHPE; ATTRIBUTE=AHSM; ATTRIBUTE=ASTE; ATTRIBUTE=ASTL; ATTRIBUTE=AUHS; ATTRIBUTE=EUSS; ATTRIBUTE=UNFF; ATTRIBUTE=WUFG;
STSC 160 E\tA \t1\t0051\t202110\t \t \t \t \t \t \t4\t4\t4\t1\tZ \t \t \t \t \t \tInformation Age\t1\tONL \tC\t \t \tA  \t[STSC 1600]  \tC\tAC \tAC  \t \t \tUG \t401
Attributes\tDWSISKEY=Z6892; ATTRIBUTE=AHSM; ATTRIBUTE=AHST; ATTRIBUTE=ASTI; ATTRIBUTE=ASTL; ATTRIBUTE=AUHS; ATTRIBUTE=EUSS; ATTRIBUTE=NUHT; ATTRIBUTE=UNFF; ATTRIBUTE=WUSS;
EAS 204 E\tNA \t1\t0066\t202110\t \t \tYIP\t \t \t \t0\t0\t0\t0\tZ \t \t \t \t \t \tTech Innv&civil Discrse\t1\tONL \tC\t \t \tA  \t[EAS 2040]  \tC\tAC \tAC  \t \t \tUG \t001
Attributes\tDWSISKEY=Z2255; ATTRIBUTE=EUTB; ATTRIBUTE=NURS; ATTRIBUTE=UNPP;
`
    $(NodeCoursesTaken).text(sampleDegreeWorksDiagnosticsReport)
    webMain()
}

function runTestInputDWClassHistory(): void {
    const sampleDegreeWorksClassHistory = `
Degree
Bachelor of Sci in Engineering
Level UndergraduateClassification SeniorMajor Computer EngineeringProgram SEAS - BSECollege SEAS Undergraduate
Name

Degree
Master of Sci in Engineering
Level ProfessionalClassification {goal}Major RoboticsProgram SEAS - MSECollege SEAS Masters

Courses Completed
Fall 2019
Course\tTitle\tGrade\tCredits
CIS 520\tMachine Learning\tA\t1
MEAM 510 Design of Mechatronic Systems A 1
CIS 580 Machine Perception A 1
CIS 545 Big Data Analytics A 1

NETS 112 Networked Life A 1
NETS 212 Cloud Computer A 1
NETS 312 Algorithmic Game Theory A 1
DSGN 100 Design 1 A 1
DSGN 101 Design 2 A 1
DSGN 102 Design 3 A 1


Spring 2020
PHYS 150\tPrinciples I\tA\t1.5
ESE 112 Eng Electromagnetics P 1.5
CHEM 1101 General Chemistry Lab I A 0.5
CHEM 1102 General Chemistry Lab II A 0.5

Fall 2020
EAS 203 Engineering Ethics A 1
WRIT 037 Decision Making A 1
ENGL 003 Repairing the Climate A 1
ENGL 005 Intro to Philosophy A 1
STSC 168 Environment And Society A 1
STSC 160 Information Age A 1

Spring 2021
EAS 204 Tech Innv&civil Discrse NA 1
`
    $(NodeCoursesTaken).text(sampleDegreeWorksClassHistory)
    webMain()
}

async function webMain(): Promise<void> {
    // reset output
    $(".requirementsList").empty()
    $(".clear-on-init").empty()

    let autoDegrees = $("#auto_degree").is(":checked")
    $(NodeMessages).append("<h3>Notes</h3>")

    const worksheetText = $(NodeCoursesTaken).val() as string
    let parser
    try {
        parser = CourseParser.getParser(worksheetText)
    } catch (e) {
        console.log(e)
        alert("Error parsing courses. Please copy+paste the entire page (not only the \"Courses Completed\" table).")
        return
    }
    const pennid = parser.extractPennID(worksheetText)
    if (pennid != undefined) {
        $(NodeStudentInfo).append(`<div class="alert alert-secondary" role="alert">PennID: ${pennid}</div>`)
    }
    let degrees = new Degrees()
    let parseResults
    if (autoDegrees) {
        parseResults = await parser.parse(worksheetText, undefined)
        degrees = parseResults.degrees
    } else {
        degrees.undergrad = <UndergradDegree>$("input[name='ugrad_degree']:checked").val()
        degrees.masters = <MastersDegree>$("input[name='masters_degree']:checked").val()
        parseResults = await parser.parse(worksheetText, degrees)
    }
    const coursesTaken = parseResults.courses

    if (parseResults.degrees.hasWrongDwCatalogYear()) {
        const dwCatalogYear = parseResults.degrees.undergradMajorCatalogYear!
        const cyString = `${dwCatalogYear-1}-${dwCatalogYear}`
        $(NodeAlerts).append(`<div class="alert alert-danger" role="alert">Student entered in ${parseResults.degrees.firstTerm} but DegreeWorks major catalog year is ${cyString}</div>`)
    }
    if (coursesTaken.some(c => c.title == Math1400RetroTitle)) {
        $(NodeAlerts).append(`<div class="alert alert-danger" role="alert">Using retro credit for Math 1400, must contact Math Department to make it official</div>`)
    }

    $(NodeMessages).append(`<div>${coursesTaken.length} courses taken</div>`)
    const allCourses = coursesTaken.slice()
        .sort((a,b) => a.code().localeCompare(b.code()))
        .map((c: CourseTaken): string => `<div><small>${c.toString()}</small></div>`).join("")
    $(NodeAllCourses).append(`
<div class="accordion" id="accordionExample">
  <div class="accordion-item">
    <h2 class="accordion-header" id="headingTwo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
      All Course Details
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
    const response = await fetch(window.location.origin + "/37cu_csci_tech_elective_list.json")
    const telist = await response.json()

    const result = run(telist, degrees, coursesTaken)
    setRemainingCUs(result.cusRemaining)
    $(NodeGpa).append(`<div class="alert alert-secondary" role="alert">
GPAs Overall = ${result.gpaOverall.toFixed(2)} 
STEM = ${result.gpaStem.toFixed(2)} 
Math+Natural Science = ${result.gpaMathNatSci.toFixed(2)}
</div>`)

    if (IncorrectCMAttributes.size > 0 && parser instanceof DegreeWorksDiagnosticsReportParser) {
        let wrongAttrsMsg = `<div>found ${IncorrectCMAttributes.size} incorrect/missing attributes in CM:<ul>`
        wrongAttrsMsg += [...IncorrectCMAttributes.keys()]
            .map((i: string): string => { return `<li>${i}</li>`})
            .join("")
        $(NodeMessages).append(wrongAttrsMsg + "</ul></div>")
    }

    if (result.unconsumedCourses.length > 0) {
        $(NodeUnusedCoursesHeader).append(`<hr/><h3>Unused Courses</h3>`)
        result.unconsumedCourses.forEach(c => {
            const completed = c.completed ? "courseCompleted" : "courseInProgress"
            if (c.courseUnitsRemaining == c.getCUs()) {
                $(NodeUnusedCoursesHeader).append(`<span class="course ${completed}" id="${c.uuid}">${c.code()}</span>`)
            } else {
                $(NodeUnusedCoursesList).append(`<span class="course ${completed}" id="${c.uuid}">${c.courseUnitsRemaining} CUs unused from ${c}</span>`)
            }
        })
    } else {
        $(NodeMessages).append("<div>all courses applied to degree requirements</div>")
    }

    const allDegreeReqs = result.requirementOutcomes.map(ro => ro.degreeReq)
    const ugradDegreeReqs = result.requirementOutcomes.filter(ro => ro.ugrad).map(ro => ro.degreeReq)
    const mastersDegreeReqs = result.requirementOutcomes.filter(ro => !ro.ugrad).map(ro => ro.degreeReq)

    let resizeTimer: NodeJS.Timeout;
    $(window).on("resize",function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            allDegreeReqs.forEach(r => {
                if (r.doesntConsume) { return }
                r.coursesApplied.forEach(c => snapCourseIntoPlace(c, r))
            })
        }, 10);
    });

    // display requirement outcomes, across 1-3 columns
    $(NodeDoubleColumn).removeClass("col-xl-8")
        .addClass("col-xl-12")
    if (result.requirementOutcomes.some(ro => ro.ugrad)) {
        $(NodeColumn1Header).append(`<h3>${degrees.undergrad} Degree Requirements</h3>`)
        renderRequirementOutcomesWeb(
            result.requirementOutcomes.filter(ro => ro.ugrad),
            NodeColumn1Reqs,
            NodeColumn2Reqs)
        if (result.requirementOutcomes.some(ro => !ro.ugrad)) {
            $(NodeDoubleColumn).removeClass("col-xl-12")
                .addClass("col-xl-8")
            $(NodeColumn3Header).append(`<h3>${degrees.masters} Degree Requirements</h3>`)
            renderRequirementOutcomesWeb(
                result.requirementOutcomes.filter(ro => !ro.ugrad),
                NodeColumn3Reqs,
                undefined)
        }
    } else if (result.requirementOutcomes.some(ro => !ro.ugrad)) {
        // master's degree only
        $(NodeColumn1Header).append(`<h3>${degrees.masters} Degree Requirements</h3>`)
        renderRequirementOutcomesWeb(
            result.requirementOutcomes.filter(ro => !ro.ugrad),
            NodeColumn1Reqs,
            undefined)
    }

    // console.log("settting up draggables and droppables")

    const doubleCountedCourses: CourseTaken[] = []

    $(".course").delay(100).draggable({
        cursor: "move",
        scroll: true,
        stack: ".course", // make the currently-selected course appear above all others
        // runs once when the course is created, binding a CourseTaken object to its HTML element
        create: function(e, _) {
            const ct = coursesTaken.find(c => c.uuid == e.target.id)!
            $(this).data(DraggableDataGetCourseTaken, ct)
        },
        // when a course is first picked up for dragging
        start: function(e, ui) {
            e.stopPropagation(); // magic to get very first drop() event to fire
            const course: CourseTaken = $(this).data(DraggableDataGetCourseTaken)
            // console.log(`start dragging ${course}`)
            if (course.consumedBy != undefined) {
                $(this).data(DraggableOriginalRequirement, course.consumedBy!)
                // console.log(`you picked up ${course.code()} from ${course.consumedBy!} ugrad:${ugradDegreeReqs.includes(course.consumedBy!)}`)
            }
        },
        stop: function(e, ui) {
            // re-snap all courses in case a req changed height
            allDegreeReqs.forEach(r => {
                if (r.doesntConsume) { return }
                r.coursesApplied.forEach(c => snapCourseIntoPlace(c, r))
            })
        }
    });

    function setDoubleCount() {
        if (mastersDegreeReqs.length == 0 || ugradDegreeReqs.length == 0) {
            return
        }
        const dcc = doubleCountedCourses.map(c => c.code()).join(", ")
        const dcAvail = 3 - doubleCountedCourses.length
        $(NodeDoubleCounts).empty()
        if (doubleCountedCourses.length == 0) {
            $(NodeDoubleCounts).append(`<div class="alert alert-secondary" role="alert">Drag a course across degrees to double-count it. None of the ${dcAvail} available double-counts are currently used.</div>`)
        } else {
            $(NodeDoubleCounts).append(`<div class="alert alert-success" role="alert">Drag a course across degrees to double-count it. Double-counting ${dcc} (${dcAvail} more available)</div>`)
        }
    }

    setDoubleCount()

    // update writing and SSH Depth requirements which are "global", i.e., they interact with other reqs
    const updateGlobalReqs = function() {
        setRemainingCUs(countRemainingCUs(allDegreeReqs))
        setDoubleCount()

        if (ugradDegreeReqs.length == 0) {
            return
        }
        const sshCourses: CourseTaken[] = coursesTaken
            .filter(c => c.consumedBy != undefined && c.consumedBy!.toString().startsWith(SsHTbsTag))
        // console.log(`updateGlobal SSH courses: ${sshCourses.map(c => c.code())}`)

        const updateGlobalReq = function(req: DegreeRequirement) {
            req.coursesApplied.slice().forEach(c => req.unapplyCourse(c))
            req.satisfiedBy(sshCourses)
            req.updateViewWeb()
        }

        const writReq = allDegreeReqs.find(r => r.toString().startsWith("Writing"))!
        updateGlobalReq(writReq)
        const depthReq = allDegreeReqs.find(r => r.toString() == SshDepthTag)
        if (depthReq != undefined) {
            updateGlobalReq(depthReq)
        }
    }

    $(".droppable").delay(100).droppable({
        accept: ".course",
        tolerance: "fit",
        // runs once when the req is created, binding a DegreeRequirement object to its HTML element
        create: function(event, _) {
            // console.log("creating droppable: " + $(this).attr("id"))
            const myReq = allDegreeReqs.find(req => req.uuid == $(this).attr("id"))!
            $(this).data(DroppableDataGetDegreeRequirement, myReq)
        },
        // for every requirement, this is called when a course is picked up
        activate: function(event, ui) {
            const req: DegreeRequirement = $(this).data(DroppableDataGetDegreeRequirement)
            const course: CourseTaken = ui.draggable.data(DraggableDataGetCourseTaken)
            // console.log(`activate ${course}`)
            // detach course from its current req
            if (course.consumedBy != undefined) {
                course.consumedBy.unapplyCourse(course)
            }
            // try to apply course to req, and then undo it so req stays incomplete and course stays unattached
            if (req.coursesApplied.length == 0) {
                const result = req.satisfiedBy([course])
                if (result != undefined) {
                    req.updateViewWeb(true)
                    req.unapplyCourse(course)
                }
            }
        },
        // for every requirement, this is called when a course is dropped
        deactivate: function(event, ui) {
            if ($(this).hasClass("requirementCouldBeSatisfied")) {
                const req: DegreeRequirement = $(this).data(DroppableDataGetDegreeRequirement)
                req.updateViewWeb()
            }
        },
        // when a course is released over a requirement. NB: course was already bound to the req at over()
        drop: function(event, ui) {
            const destReq: DegreeRequirement = $(this).data(DroppableDataGetDegreeRequirement)
            const realCourse: CourseTaken = ui.draggable.data(DraggableDataGetCourseTaken)
            // console.log(`drop ${realCourse} onto ${destReq}`)
            if (destReq.coursesApplied.includes(realCourse)) {
                snapCourseIntoPlace(realCourse, destReq)

                // if moving a course across degrees, try to double-count it
                const originReq: DegreeRequirement = ui.draggable.data(DraggableOriginalRequirement)
                const crossDegree =
                    (ugradDegreeReqs.includes(originReq) && mastersDegreeReqs.includes(destReq)) ||
                    (mastersDegreeReqs.includes(originReq) && ugradDegreeReqs.includes(destReq))
                // console.log(`JLD ${doubleCountedCourses.length} ${originReq} ${crossDegree}`)
                if (doubleCountedCourses.length < 3 && !doubleCountedCourses.includes(realCourse) && crossDegree) {
                    // console.log(`double-counting ${realCourse.code()} with ${originReq} and ${destReq}`)
                    doubleCountedCourses.push(realCourse)

                    // create shadowCourse and place that in originReq
                    const shadowCourse = realCourse.copy()
                    const origReqElem = $("#" + originReq.uuid)
                    origReqElem.append(`
<span 
class="course courseDoubleCountShadow myTooltip"  
id="${shadowCourse.uuid}" 
>
${realCourse.code()}
<span class="myTooltipText">click to remove</span>
</span>`)

                    originReq.satisfiedBy([shadowCourse])
                    originReq.updateViewWeb()
                    realCourse.updateViewWeb(true)
                    updateGlobalReqs()

                    snapCourseIntoPlace(shadowCourse, originReq)
                    // close shadowCourse on click
                    $(`#${shadowCourse.uuid}`).on('click', function() {
                        // console.log("removing double-count shadow course " + shadowCourse)

                        originReq.unapplyCourse(shadowCourse)
                        originReq.updateViewWeb()
                        realCourse.updateViewWeb(false)

                        // remove origin course from doubleCountedCourses
                        const i = doubleCountedCourses.indexOf(realCourse)
                        myAssert(i >= 0, `expected ${realCourse} in ${doubleCountedCourses}`)
                        doubleCountedCourses.splice(i, 1)
                        $(this).remove()
                        updateGlobalReqs()

                        allDegreeReqs.forEach(r => {
                            if (r.doesntConsume) { return }
                            r.coursesApplied.forEach(c => snapCourseIntoPlace(c, r))
                        })
                    })
                }
            }
        },
        // when a course is dragged over a requirement
        over: function(event,ui) {
            const req: DegreeRequirement = $(this).data(DroppableDataGetDegreeRequirement)
            const course: CourseTaken = ui.draggable.data(DraggableDataGetCourseTaken)
            // console.log(`${course.code()} *over* ${req}, ${course.consumedBy?.uuid}`)

            // if req is already filled, ignore this course
            if (req.remainingCUs == 0) {
                return
            }

            req.satisfiedBy([course])
            // console.log(`jld0 ${course.code()} over ${req}: ${result}`)
            req.updateViewWeb()
            updateGlobalReqs()
        },
        // when a course leaves a requirement
        out: function(event, ui) {
            const req: DegreeRequirement = $(this).data(DroppableDataGetDegreeRequirement)
            const course: CourseTaken = ui.draggable.data(DraggableDataGetCourseTaken)
            // console.log(`${course.code()} *left* ${req.uuid} ${req}`)

            // update model
            if (req.coursesApplied.includes(course)) {
                // console.log(`unapplying ${course.code()}`)
                req.unapplyCourse(course)
                req.updateViewWeb(true)
                updateGlobalReqs()
            }
        }
    });
}

function renderRequirementOutcomesWeb(requirementOutcomes: RequirementOutcome[], column1Id: string, column2Id: string | undefined) {
    requirementOutcomes.forEach( (ro: RequirementOutcome, i: number, allReqs: RequirementOutcome[]) => {
        let column = column1Id
        if (column2Id != undefined && (i+1) > allReqs.length/2) {
            column = column2Id
        }
        if (ro.degreeReq.doesntConsume) {
            $(column).append(`<div class="requirement" id="${ro.degreeReq.uuid}"><span class="outcome"></span></div>`)
            ro.degreeReq.updateViewWeb()
            return
        }

        $(column).append(`
<div class="droppable requirement" id="${ro.degreeReq.uuid}">
<span class="outcome"></span><span id="${ro.degreeReq.uuid}_snapTarget" class="courseSnapTarget"></span></div>`)

        const courses = ro.coursesApplied.map(c => {
            const completed = c.completed ? "courseCompleted" : "courseInProgress"
            return `<span class="course ${completed}" id="${c.uuid}">${c.code()}</span>`
        }).join(" ")
        $(NodeCoursesList).append(courses)
        ro.degreeReq.updateViewWeb()

        // must delay course placement, I guess because courses aren't added to DOM instantly?
        setTimeout(function() {
            ro.coursesApplied.forEach(c => {
                // console.log(`positioning ${c.uuid} next to ${ro.degreeReq.uuid}_snapTarget`)
                snapCourseIntoPlace(c, ro.degreeReq)
            })
        }, 200)
    })
}

function countRemainingCUs(allReqs: DegreeRequirement[]): number {
    const bucketsProcessed: string[] = []
    return allReqs
        .map(r => {
            if (r instanceof RequireBucketNamedCourses) {
                if (!bucketsProcessed.includes(r.groupName)) {
                    bucketsProcessed.push(r.groupName)
                    return r.getBucketGroupCoursesRemaining()
                }
                return 0
            }
            return r.doesntConsume ? 0 : r.remainingCUs
        })
        .reduce((sum, remCUs) => sum + remCUs, 0)
}

function setRemainingCUs(n: number) {
    $(NodeRemainingCUs).empty()
    $(NodeRemainingCUs).append(`<div class="alert alert-primary" role="alert">${n} CUs needed to graduate</div>`)
}

if (typeof window === 'undefined') {
    cliMain()
}
async function cliMain(): Promise<void> {
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
            await runOneWorksheet(worksheetText, path.basename(worksheetFile))

        } else {
            // aggregate multiple worksheets for the same student
            const allMyWorksheets: string = myWorksheetFiles
                .map((f: string): string => fs.readFileSync(f, 'utf8'))
                .filter((ws: string): boolean =>
                    ws.includes("Degree in Bachelor of Science in Engineering") ||
                    ws.includes("Degree in Bachelor of Applied Science") ||
                    ws.includes("Degree in Master of Science in Engineering"))
                .join("\n")
            await runOneWorksheet(allMyWorksheets, path.basename(worksheetFile))
        }
        i += myWorksheetFiles.length
    }
    if (IncorrectCMAttributes.size > 0) {
        console.log(`found ${IncorrectCMAttributes.size} incorrect/missing attributes in CM`)
        console.log(IncorrectCMAttributes.keys())
    }
}

async function runOneWorksheet(worksheetText: string, analysisOutput: string): Promise<void> {
    const fs = require('fs');
    try {
        const parser = CourseParser.getParser(worksheetText)
        let parseResult
        try {
            parseResult = await parser.parse(worksheetText, undefined)
        } catch (Error) {
            return
        }
        const coursesTaken = parseResult.courses
        const degrees = parseResult.degrees

        const response = await fetch("https://advising.cis.upenn.edu/37cu_csci_tech_elective_list.json")
        const telist = await response.json()
        const result = run(telist, degrees!, coursesTaken)

        const unsat = result.requirementOutcomes
            .filter(ro => ro.applyResult != RequirementApplyResult.Satisfied)
            .map(ro => "  " + ro.outcomeString())
            .join("\n")
        const unconsumed = result.unconsumedCourses
            .sort()
            .map(c => "  " + c.toString())
            .join("\n")
            const summary = `
${result.cusRemaining} CUs remaining in ${degrees}

unsatisfied requirements:
${unsat}

unused courses:
${unconsumed}

`
        // console.log(summary)
        if (!fs.existsSync(AnalysisOutputDir)) {
            fs.mkdirSync(AnalysisOutputDir)
        }
        const outputFile = `${AnalysisOutputDir}${result.cusRemaining}left-${analysisOutput}.analysis.txt`
        fs.writeFileSync(outputFile, summary + JSON.stringify(result, null, 2) + worksheetText)
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

export enum RequirementApplyResult {
    Unsatisfied, PartiallySatisfied, Satisfied
}
class RequirementOutcome {
    /** true if this is an undergraduate degree requirement, false if masters */
    readonly ugrad: boolean
    readonly degreeReq: DegreeRequirement
    readonly applyResult: RequirementApplyResult
    readonly coursesApplied: CourseTaken[]
    constructor(ugrad: boolean, req: DegreeRequirement, outcome: RequirementApplyResult, courses: CourseTaken[]) {
        this.ugrad = ugrad
        this.degreeReq = req
        this.applyResult = outcome
        this.coursesApplied = courses
    }
    public outcomeString(): string {
        let by = " by"
        // is this a bucket requirement that is empty because enough other buckets are filled?
        if (this.degreeReq instanceof RequireBucketNamedCourses &&
            this.degreeReq.satisfiedByOtherBuckets()) {
            by = " by other buckets"
        }
        switch (this.applyResult) {
            case RequirementApplyResult.Satisfied:
                return `${this.degreeReq} satisfied${by}`
            case RequirementApplyResult.PartiallySatisfied:
                return `${this.degreeReq} PARTIALLY satisfied${by}`
            case RequirementApplyResult.Unsatisfied:
                return `${this.degreeReq} NOT satisfied`
            default:
                throw new Error("invalid applyResult " + this.applyResult)
        }
    }
}

class RunResult {
    readonly requirementOutcomes: RequirementOutcome[]
    readonly gpaOverall: number
    readonly gpaStem: number
    readonly gpaMathNatSci: number
    readonly cusRemaining: number
    readonly unconsumedCourses: CourseTaken[]

    constructor(requirementOutcomes: RequirementOutcome[],
                cusRemaining: number,
                unconsumedCourses: CourseTaken[],
                overallGpa: number,
                stemGpa: number,
                mathNatSciGpa: number) {
        this.requirementOutcomes = requirementOutcomes
        this.cusRemaining = cusRemaining
        this.unconsumedCourses = unconsumedCourses
        this.gpaOverall = overallGpa
        this.gpaStem = stemGpa
        this.gpaMathNatSci = mathNatSciGpa
    }
}

export function run(csci37techElectiveList: TechElectiveDecision[], degrees: Degrees, coursesTaken: CourseTaken[]): RunResult {
    csci37techElectiveList
        .filter((te: TechElectiveDecision): boolean => te.status == "yes")
        .forEach((te: TechElectiveDecision) => {
            RequirementCsci40TechElective.techElectives.add(te.course4d)
        })
    const csci37TechElectives: string[] = csci37techElectiveList
        .filter((te: TechElectiveDecision): boolean => te.status == "yes")
        .map(te => te.course4d)
    const bothLightAndFull = [...NetsFullTechElectives].filter(full => NetsLightTechElectives.has(full))
    myAssertEquals(bothLightAndFull.length, 0, `Uh-oh, some NETS TEs are both light AND full: ${bothLightAndFull}`)

    let ugradDegreeRequirements: DegreeRequirement[] = []

    const _40cuAscsNSCourses = ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100","PHYS 093","PHYS 094",
        "PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120",
        "EAS 0091","CHEM 1012","BIOL 1101","BIOL 1121"]
    const _40cuAscsNSElectives = ["LING 2500", "LING 2300", "LING 5310", "LING 5320",
        "LING 5510", "LING 5520", "LING 6300", "LING 6400",
        "PHIL 4840",
        "PSYC 1210", "PSYC 1340", "PSYC 1310", "PSYC 2310", "PSYC 2737",
    ]
    const _37cuAscsNSCourses = ["PHYS 0140","PHYS 0150","PHYS 0170", "PHYS 0141","PHYS 0151","PHYS 0171",
        "EAS 0091","CHEM 1012","BIOL 1101","BIOL 1121"]

    // NB: below, requirements are listed from highest => lowest priority. Display order is orthogonal.
    switch (degrees.undergrad) {
        case "40cu CSCI":
            ugradDegreeRequirements = [
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

                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 2620","CIS 5110"]),
                new RequirementNamedCourses(16, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(17, "Major", ["CIS 4710","CIS 5710"]),
                new RequirementNamedCourses(18, "Major", ["CIS 3800", "CIS 5480"]),
                new RequirementNamedCourses(19, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(20, "Senior Design", SeniorDesign2ndSem),

                new RequirementNamedCourses(21, "Project Elective", CsciProjectElectives),

                new RequireCis1100(11),
                new RequirementCisElective(23).withMinLevel(2000),
                new RequirementCisElective(24).withMinLevel(2000),
                new RequirementCisElective(22),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),

                new RequirementTechElectiveEngineering(25, false),
                new RequirementTechElectiveEngineering(26, false),
                new RequirementCsci40TechElective(27),
                new RequirementCsci40TechElective(28),
                new RequirementCsci40TechElective(29),
                new RequirementCsci40TechElective(30),

                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(37, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),

                // NB: Writing, Ethics, SSH Depth are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "40cu ASCS":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2620","CIS 5110"]),

                new RequirementNamedCourses(7, "Natural Science", _40cuAscsNSCourses),
                new RequirementNamedCourses(8, "Natural Science",_40cuAscsNSCourses).withConcise(),
                new RequirementNamedCoursesOrAttributes(9, "Natural Science Elective", _40cuAscsNSElectives, [CourseAttribute.NatSci]),
                new RequirementNamedCoursesOrAttributes(10, "Natural Science Elective", _40cuAscsNSElectives, [CourseAttribute.NatSci])
                    .withConcise(),

                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(18, "Project Elective", AscsProjectElectives),
                new RequirementNamedCourses(19, "Project Elective", AscsProjectElectives).withConcise(),
                new RequirementNamedCourses(22, "Senior Capstone", ["EAS 4990","CIS 4980"].concat(SeniorDesign2ndSem)),

                new RequireCis1100(11),
                new RequirementCisElective(17).withMinLevel(2000),
                new RequirementCisElective(16),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),

                new RequirementTechElectiveEngineering(20, true),
                new RequirementTechElectiveEngineering(21, true),

                new RequirementAscs40TechElective(23),
                new RequirementAscs40TechElective(24),
                new RequirementAscs40TechElective(25),
                new RequirementAscs40TechElective(26),
                new RequirementAscs40TechElective(27),
                new RequirementAscs40TechElective(28),
                new RequirementAscs40TechElective(29),
                new RequirementAscs40TechElective(30),

                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(37, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing, SSH Depth, Ethics are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "40cu ASCC":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2620"]),

                new RequirementNamedCourses(7, "Natural Science", _40cuAscsNSCourses),
                new RequirementNamedCourses(8, "Natural Science",_40cuAscsNSCourses).withConcise(),
                new RequirementNamedCoursesOrAttributes(9, "Natural Science Elective", _40cuAscsNSElectives, [CourseAttribute.NatSci]),
                new RequirementNamedCoursesOrAttributes(10, "Natural Science Elective", _40cuAscsNSElectives, [CourseAttribute.NatSci])
                    .withConcise(),

                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1400","COGS 1001"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3200"]),
                new RequirementNamedCourses(15, "Major", ["CIS 4210","CIS 5210"]),
                new RequirementNamedCourses(22, "Senior Capstone", ["EAS 4990","CIS 4980"].concat(SeniorDesign2ndSem)),

                new RequireCis1100(11),
                new RequirementCisElective(16),
                new RequirementCisElective(17),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),

                new RequirementTechElectiveEngineering(20, true),
                new RequirementTechElectiveEngineering(21, true),

                new RequirementAscs40TechElective(23),
                new RequirementAscs40TechElective(24),
                new RequirementAscs40TechElective(25),
                new RequirementAscs40TechElective(26),
                new RequirementAscs40TechElective(27),
                new RequirementAscs40TechElective(28),
                new RequirementAscs40TechElective(29),
                new RequirementAscs40TechElective(30),

                new RequirementSsh(31, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(37, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing, Ethics, SSH Depth are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "40cu CMPE":
            ugradDegreeRequirements = [
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
                new RequirementNamedCourses(20, "Major", ["CIS 3800", "CIS 5480"]),
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
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),

                new RequirementAttributes(28, "Tech Elective", [CourseAttribute.MathNatSciEngr]).withMinLevel(2000),
                new RequirementNamedCoursesOrAttributes(29,
                    "Tech Elective",
                    ["ESE 4000","EAS 5450","EAS 5950","MGMT 2370","OIDD 2360"],
                    [CourseAttribute.MathNatSciEngr])
                    .withMinLevel(2000),
                new RequirementAttributes(26, "Tech Elective", [CourseAttribute.MathNatSciEngr]),
                new RequirementAttributes(27, "Tech Elective", [CourseAttribute.MathNatSciEngr]),

                // NB: Writing, Ethics, SSH Depth are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "40cu NETS":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["MATH 2400","MATH 2600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(5, "Math", ["EAS 205","MATH 3120","MATH 3130","MATH 3140"]),
                new RequirementNamedCourses(6, "Math", ["ESE 3010","STAT 4300"]),

                new RequirementNamedCourses(7, "Physics", ["PHYS 0150","PHYS 0170"]).withCUs(1.5),
                new RequirementNamedCourses(8, "Physics", ["PHYS 0151","PHYS 0171"]).withCUs(1.5),

                new RequirementNamedCourses(11, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(13, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(14, "Major", ["ESE 2100"]),
                new RequirementNamedCourses(15, "Major", ["ESE 3030"]),
                new RequirementNamedCourses(16, "Major", ["ESE 304","ESE 2040"]),
                new RequirementNamedCourses(17, "Major", ["NETS 1120"]),
                new RequirementNamedCourses(18, "Major", ["NETS 1500"]),
                new RequirementNamedCourses(19, "Major", ["NETS 2120"]),
                new RequirementNamedCourses(20, "Major", ["NETS 3120"]),
                new RequirementNamedCourses(21, "Major", ["NETS 4120"]),
                new RequirementNamedCourses(22, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(23, "Senior Design", SeniorDesign2ndSem),
                new RequireCis1100(10),

                new RequirementNamedCourses(30, SsHTbsTag, ["ECON 2100"]),
                new RequirementNamedCourses(31, SsHTbsTag, ["ECON 4100","ECON 4101","ECON 6110"]),

                new RequirementAttributes(9, "Natural Science", [CourseAttribute.NatSci]),

                new RequirementSsh(32, [CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),

                new RequirementAttributes(24, "Tech Elective (Light)",
                    [CourseAttribute.NetsLightTechElective, CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(25, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(26, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(27, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(28, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(29, "Tech Elective", [CourseAttribute.NetsFullTechElective]),

                // NB: Writing, Ethics, SSH Depth are [41,43]
                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "40cu DMD":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Math", ["CIS 2620"]),
                new RequirementNamedCourses(5, "Math", ["EAS 205","MATH 3120","MATH 3130","MATH 3140"]),

                new RequirementNamedCourses(7, "Physics", ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100","PHYS 093"]),
                new RequirementNamedCourses(8, "Physics", ["PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120","PHYS 094"]),

                new RequirementNamedCourses(12, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(14, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(16, "Major", ["CIS 4600","CIS 5600"]),
                new RequirementNamedCourses(17, "Major", ["CIS 4610","CIS 5610","CIS 4620","CIS 5620","CIS 4550","CIS 5550"]),
                new RequirementNamedCourses(18, "Major", ["CIS 4610","CIS 5610","CIS 4620","CIS 5620","CIS 4550","CIS 5550"]),
                new RequirementNamedCourses(19, "Major", ["CIS 4970"]),

                new RequireCis1100(11),
                new RequirementCisElective(20).withMinLevel(2000),
                new RequirementCisElective(21).withMinLevel(2000),
                new RequirementCisElective(22).withMinLevel(2000),
                new RequirementCisElective(23).withMinLevel(2000),
                new RequirementCisElective(24),

                new RequirementAttributes(6, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(9, "Natural Science", [CourseAttribute.NatSci]),
                new RequirementAttributes(10, "Natural Science", [CourseAttribute.NatSci]),

                new RequirementDmdElective(25),
                new RequirementDmdElective(26),
                new RequirementDmdElective(27),
                new RequirementDmdElective(28),
                new RequirementDmdElective(29),
                new RequirementDmdElective(30),
                new RequirementDmdElective(31),

                new RequirementSsh(32, [CourseAttribute.SocialScience]),
                new RequirementSsh(33, [CourseAttribute.SocialScience]),
                new RequirementSsh(34, [CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(37, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(38, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing, Ethics, SSH Depth are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
            ]
            break
        case "40cu EE":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["MATH 2400","MATH 2600"]),
                new RequirementNamedCourses(4, "Math", ["ESE 3010"]),
                new RequirementNamedCourses(6, "Physics",
                    ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses(7, "Physics", ["PHYS 0151","PHYS 0171","ESE 1120"]).withCUs(1.5),
                new RequirementNamedCourses(8, "Natural Science", ["CHEM 1012","BIOL 1101","BIOL 1121"]),
                new RequirementNaturalScienceLab(10, "Natural Science Lab").withCUs(0.5),

                new RequirementNamedCourses(11, "Major", ["CIS 1100","ENGR 1050"]),
                new RequirementNamedCourses(12, "Major", ["ESE 1110"]),
                new RequirementNamedCourses(13, "Major", ["ESE 2150"]).withCUs(1.5),
                new RequirementNamedCourses(14, "Major", ["ESE 2180"]).withCUs(1.5),
                new RequirementNamedCourses(15, "Major", ["ESE 2240"]).withCUs(1.5),
                new RequirementNamedCourses(16, "Major", ["CIS 1200","CIS 2400"]),

                new RequirementEseEngineeringElective(17).withMinLevel(2000),
                new RequirementAdvancedEseElective(19, true),
                new RequirementAdvancedEseElective(20, true),
                new RequirementAdvancedEseElective(21, true),
                new RequirementAdvancedEseElective(18, false),

                new RequirementAttributes(5, "Math", [CourseAttribute.Math]),
                new RequirementAttributes(9, "Math", [CourseAttribute.Math,CourseAttribute.NatSci]),

                new RequirementNamedCourses(22, "ESE Lab",
                    ["ESE 2900", "ESE 2910", "ESE 3190", "ESE 3360",
                        "ESE 3500", "ESE 4210", "BE 4700"]).withCUs(1.5),

                new RequirementNamedCourses(23, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(24, "Senior Design", SeniorDesign2ndSem),

                new RequirementEseProfessionalElective(25, true),
                new RequirementEseProfessionalElective(26, false),
                new RequirementEseProfessionalElective(27, false),
                new RequirementEseProfessionalElective(28, false,
                    ["ESE 4000", "EAS 5450", "EAS 5950", "MGMT 2370", "OIDD 2360"]),

                new RequirementNamedCourses(30, SsHTbsTag, ["EAS 2030"]),
                new RequirementSsh(34, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing, Ethics, SSH Depth are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "40cu SSE":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["MATH 2400","MATH 2600"]),
                new RequirementNamedCourses(4, "Math", ["ESE 3010"]),
                new RequirementNamedCourses(5, "Math", ["ESE 302","ESE 4020","ESE 5420"]),
                new RequirementNamedCourses(6, "Physics",
                    ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses(7, "Physics", ["PHYS 0141","PHYS 0151","PHYS 0171","ESE 1120"]),
                new RequirementNamedCourses(8, "Natural Science", ["CHEM 1012","BIOL 1101","BIOL 1121"]),
                new RequirementNamedCourses(9, "Math", ["MATH 3120","MATH 3130","MATH 3140","EAS 205",]),
                new RequirementNaturalScienceLab(10, "Natural Science Lab").withCUs(1.0),

                new RequirementNamedCourses(11, "Major", ["CIS 1100","ENGR 1050"]),
                new RequirementNamedCourses(12, "Major", ["ESE 1110"]),
                new RequirementNamedCourses(13, "Major", ["CIS 1200"]),

                new RequirementNamedCourses(14, "Major", ["ESE 2040"]),
                new RequirementNamedCourses(15, "Major", ["ESE 2100"]),
                new RequirementNamedCourses(16, "Major", ["ESE 2240"]).withCUs(1.5),
                new RequirementNamedCourses(17, "Major", ["ESE 3030"]),

                new RequirementNamedCourses(18, "ISE Elective", SseIseElectives),
                new RequirementNamedCourses(19, "ISE Elective", SseIseElectives).withConcise(),
                new RequirementNamedCourses(20, "ISE Elective", SseIseElectives).withConcise(),

                new RequirementNamedCourses(23, "System Project Lab",
                    ["ESE 2900", "ESE 2910", "ESE 3500", "ESE 4210", "ESE 5050", "BE 4700"]).withCUs(1.5),
                new RequirementNamedCourses(24, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(25, "Senior Design", SeniorDesign2ndSem),

                new RequirementNamedCourses(26, "Tech Management Elective",
                    ["ESE 4000", "EAS 5450", "EAS 5950", "MGMT 2370", "OIDD 2360"]),
                new RequirementSpa(27, true),
                new RequirementSpa(28, false),
                new RequirementSpa(29, false),

                new RequirementEngineeringElective(22).withMinLevel(2000),
                new RequirementEngineeringElective(21),

                new RequirementNamedCourses(30, SsHTbsTag, ["EAS 2030"]),
                new RequirementSsh(34, [CourseAttribute.SocialScience]),
                new RequirementSsh(32, [CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing, Ethics, SSH Depth are [41,43]

                new RequirementFreeElective(44),
                new RequirementFreeElective(45),
                new RequirementFreeElective(46),
            ]
            break
        case "37cu CSCI":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Probability", ["CIS 2610", "ESE 3010", "ENM 321", "STAT 4300"]),
                new RequirementNamedCourses(5, "Linear Algebra", ["MATH 2400", "MATH 2600", "MATH 3120", "MATH 3130", "MATH 3140"]),
                new RequirementNamedCourses(6, "Physics", ["PHYS 0150","PHYS 0170","MEAM 1100","MEAM 1470"]).withCUs(1.5),
                new RequirementNamedCourses(7, "Physics", ["PHYS 0151","PHYS 0171","ESE 1120"]).withCUs(1.5),
                new RequirementAttributes(8, "Math/Natural Science Elective", [CourseAttribute.Math, CourseAttribute.NatSci]),

                new RequirementNamedCourses(10, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(11, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(12, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(13, "Math", ["CIS 2620","CIS 5110"]),
                new RequirementNamedCourses(14, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(15, "Major", ["CIS 3800","CIS 5480"]),
                new RequirementNamedCourses(16, "Major", ["CIS 4710","CIS 5710"]),
                new RequirementNamedCourses(17, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(18, "Senior Design", SeniorDesign2ndSem),

                new RequireCis1100(9),
                new RequirementCisElective(20).withMinLevel(2000),
                new RequirementCisElective(21).withMinLevel(2000),
                new RequirementCisElective(22).withMinLevel(2000),
                new RequirementCisElective(19),

                new RequirementNamedCourses(23, "Technical Elective", csci37TechElectives).withConcise(),
                new RequirementNamedCourses(24, "Technical Elective", csci37TechElectives).withConcise(),
                new RequirementNamedCourses(25, "Technical Elective", csci37TechElectives).withConcise(),
                new RequirementNamedCourses(26, "Technical Elective", csci37TechElectives).withConcise(),
                new RequirementNamedCourses(27, "Technical Elective", csci37TechElectives).withConcise(),
                new RequirementNamedCourses(28, "Technical Elective", csci37TechElectives).withConcise(),

                // elective "breadth" requirements
                new RequirementNamedCourses(29, "Networking Elective",
                    ["NETS 1500", "NETS 2120", "CIS 3310", "CIS 4550", "CIS 5550", "CIS 5050", "CIS 5530"]).withNoConsume(),
                new RequirementNamedCourses(30, "Database Elective",
                    ["CIS 4500", "CIS 5500", "CIS 4550", "CIS 5550", "CIS 5450"]).withNoConsume(),
                new RequirementNamedCourses(31, "Distributed Systems Elective",
                    ["NETS 2120", "CIS 4410", "CIS 5410", "CIS 4500", "CIS 5500", "CIS 5050", "CIS 5450"]).withNoConsume(),
                new RequirementNamedCourses(32, "Machine Learning/AI Elective",
                    ["CIS 4190", "CIS 5190", "CIS 4210", "CIS 5210", "CIS 5200", "CIS 5450", "CIS 6200"]).withNoConsume(),
                new RequirementNamedCourses(33, "Project Elective",
                    ["NETS 2120", "CIS 3410", "CIS 3500", "CIS 4410", "CIS 5410", "CIS 4500", "CIS 5500",
                        "CIS 4550", "CIS 5550", "CIS 4600", "CIS 5600", "CIS 5050", "CIS 5530", "ESE 3500"]).withNoConsume(),

                new RequirementNamedCourses(34, "Ethics", CsciEthicsCourses),
                new RequirementSsh(35, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(36, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(37, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(38, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(39, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(40, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing requirement is @ index 41

                new RequirementFreeElective(42),
            ]
            break
        case "37cu ASCS":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Natural Science", _37cuAscsNSCourses),
                new RequirementNamedCourses(5, "Natural Science",_37cuAscsNSCourses).withConcise(),
                new RequirementAttributes(6, "Math/Natural Science Elective", [CourseAttribute.NatSci, CourseAttribute.Math]),
                new RequirementAttributes(7, "Math/Natural Science Elective", [CourseAttribute.NatSci, CourseAttribute.Math]).withConcise(),
                new RequirementAttributes(8, "Math/Natural Science Elective", [CourseAttribute.NatSci, CourseAttribute.Math]).withConcise(),

                new RequirementNamedCourses(10, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(11, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(12, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(13, "Math", ["CIS 2620","CIS 5110"]),
                new RequirementNamedCourses(14, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(15, "Project Elective", AscsProjectElectives),
                new RequirementNamedCourses(16, "Project Elective", AscsProjectElectives).withConcise(),
                new RequirementNamedCourses(17, "Senior Capstone", ["EAS 4990","CIS 4980"].concat(SeniorDesign2ndSem)),

                new RequireCis1100(9),
                new RequirementCisElective(19).withMinLevel(2000),
                new RequirementCisElective(18),

                new RequirementTechElectiveEngineering(20, false),
                new RequirementTechElectiveEngineering(21, false),

                new RequirementAscs40TechElective(22),
                new RequirementAscs40TechElective(23),
                new RequirementAscs40TechElective(24),
                new RequirementAscs40TechElective(25),
                new RequirementAscs40TechElective(26),
                new RequirementAscs40TechElective(27),
                new RequirementAscs40TechElective(28),
                new RequirementAscs40TechElective(29),

                new RequirementNamedCourses(36, "Ethics", CsciEthicsCourses),
                new RequirementSsh(30, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(31, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(32, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing requirement is @ index 41

                new RequirementFreeElective(42),
            ]
            break
        case "37cu CMPE":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["MATH 2400", "MATH 2600"]),
                new RequirementNamedCourses(4, "Probability", ["CIS 2610", "ESE 3010", "ENM 321", "STAT 4300"]),
                new RequirementNamedCourses(5, "Math", ["CIS 1600"]),

                new RequirementNamedCourses(6, "Physics", ["PHYS 0140","PHYS 0150","PHYS 0170","MEAM 1100"]),
                new RequirementNamedCourses(7, "Physics", ["ESE 1120"]).withCUs(1.5),
                new RequirementNamedCourses(8, "Natural Science", ["CHEM 1011","EAS 0091","BIOL 1101","BIOL 1121","PHYS 1240"]),
                new RequirementAttributes(9, "Math/Natural Science Elective", [CourseAttribute.Math, CourseAttribute.NatSci]),
                new RequirementNaturalScienceLab(10, "Natural Science Lab").withCUs(0.5),

                new RequirementNamedCourses(11, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(12, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(13, "Major", ["ESE 1500"]),
                new RequirementNamedCourses(14, "Major", ["ESE 2150"]).withCUs(1.5),
                new RequirementNamedCourses(15, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(16, "Major", ["ESE 3500"]).withCUs(1.5),
                new RequirementNamedCourses(17, "Major", ["CIS 3500","CIS 4600","CIS 5600"]),
                new RequirementNamedCourses(18, "Major", ["ESE 3700"]),
                new RequirementNamedCourses(19, "Major", ["CIS 3800","CIS 5480"]),
                new RequirementNamedCourses(20, "Major", ["CIS 4410","CIS 5410","CIS 5470"]),
                new RequirementNamedCourses(21, "Major", ["CIS 4710","CIS 5710"]),
                new RequirementNamedCourses(22, "Networking", ["ESE 4070","ESE 5070","CIS 5530"]),
                new RequirementNamedCourses(23, "Concurrency Lab",
                    ["CIS 4550","CIS 5550","CIS 5050","ESE 5320","CIS 5650"]),
                new RequirementNamedCourses(24, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(25, "Senior Design", SeniorDesign2ndSem),

                new RequirementAttributes(26, "Professional Elective",
                    [CourseAttribute.Math,CourseAttribute.NatSci,CourseAttribute.MathNatSciEngr]).withMinLevel(2000),
                new RequirementNamedCoursesOrAttributes(27, "Professional Elective",
                    ["ESE 4000","EAS 5450","EAS 5950","MGMT 2370","OIDD 2360"],
                    [CourseAttribute.Math,CourseAttribute.NatSci,CourseAttribute.MathNatSciEngr]).withMinLevel(2000),
                new RequirementAttributes(28, "Professional Elective",
                    [CourseAttribute.Math,CourseAttribute.NatSci,CourseAttribute.MathNatSciEngr]),
                new RequirementAttributes(29, "Professional Elective",
                    [CourseAttribute.Math,CourseAttribute.NatSci,CourseAttribute.MathNatSciEngr]),

                new RequirementNamedCourses(30, "Ethics", CsciEthicsCourses),
                new RequirementSsh(31, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(32, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(36, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing requirement is @ index 41
            ]
            break
        case "37cu NETS":
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["MATH 2400", "MATH 2600"]),
                new RequirementNamedCourses(4, "Linear Algebra", ["MATH 3120", "MATH 3130", "MATH 3140"]),
                new RequirementNamedCourses(5, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(6, "Probability", ["CIS 2610", "ESE 3010", "ENM 321", "STAT 4300"]),
                new RequirementNamedCourses(7, "Physics", ["PHYS 0150","PHYS 0170","MEAM 1100","MEAM 1470"]).withCUs(1.5),
                new RequirementNamedCourses(8, "Physics", ["PHYS 0151","PHYS 0171","ESE 1120"]).withCUs(1.5),

                new RequirementNamedCourses(10, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(11, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(12, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(13, "Major", ["ESE 2040","ESE 5040"]),
                new RequirementNamedCourses(14, "Major", ["ESE 3030"]),
                new RequirementNamedCourses(15, "Major", ["ESE 3050"]),
                new RequirementNamedCourses(16, "Major", ["NETS 1120"]),
                new RequirementNamedCourses(17, "Major", ["NETS 1500"]),
                new RequirementNamedCourses(18, "Major", ["NETS 2120"]),
                new RequirementNamedCourses(19, "Major", ["NETS 3120"]),
                new RequirementNamedCourses(20, "Major", ["NETS 4120"]),
                new RequirementNamedCourses(21, "Senior Design", SeniorDesign1stSem),
                new RequirementNamedCourses(22, "Senior Design", SeniorDesign2ndSem),
                new RequireCis1100(9),

                new RequirementAttributes(23, "Tech Elective (Light)",
                    [CourseAttribute.NetsLightTechElective, CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(24, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(25, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(26, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(27, "Tech Elective", [CourseAttribute.NetsFullTechElective]),
                new RequirementAttributes(28, "Tech Elective", [CourseAttribute.NetsFullTechElective]),

                new RequirementNamedCourses(29, "Ethics", CsciEthicsCourses),
                new RequirementNamedCourses(30, "Microeconomics", ["ECON 2100"]),
                new RequirementNamedCourses(31, "Game Theory", ["ECON 4100","ECON 6110"]),
                new RequirementSsh(32, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing requirement is @ index 41

                new RequirementFreeElective(42),
            ]
            break
        case "37cu DMD":
            const dmdAdvancedGraphics = ["CIS 4610","CIS 5610","CIS 4620","CIS 5620","CIS 4550","CIS 5550"]
            ugradDegreeRequirements = [
                new RequirementNamedCourses(1, "Math", ["MATH 1400"]),
                new RequirementNamedCourses(2, "Math", ["MATH 1410","MATH 1610"]),
                new RequirementNamedCourses(3, "Math", ["CIS 1600"]),
                new RequirementNamedCourses(4, "Probability", ["CIS 2610", "ESE 3010", "ENM 321", "STAT 4300"]),
                new RequirementNamedCourses(5, "Linear Algebra", ["MATH 2400", "MATH 2600", "MATH 3120", "MATH 3130", "MATH 3140"]),
                new RequirementNamedCourses(6, "Physics", ["PHYS 0150","PHYS 0170","MEAM 1100","MEAM 1470"]).withCUs(1.5),
                new RequirementNamedCourses(7, "Natural Science",
                    ["BIOL 1101","BIOL 1121","BIOL 1124","CHEM 1011","CHEM 1101","PHYS 0151","PHYS 0171","ESE 1120"]).withCUs(1.5),
                new RequirementAttributes(8, "Math/Natural Science Elective", [CourseAttribute.Math, CourseAttribute.NatSci]),

                new RequirementNamedCourses(10, "Major", ["CIS 1200"]),
                new RequirementNamedCourses(11, "Major", ["CIS 1210"]),
                new RequirementNamedCourses(12, "Major", ["CIS 2400"]),
                new RequirementNamedCourses(13, "Math", ["CIS 2620","CIS 5110"]),
                new RequirementNamedCourses(14, "Major", ["CIS 3200","CIS 5020"]),
                new RequirementNamedCourses(15, "Major", ["CIS 4600","CIS 5600"]),
                new RequirementNamedCourses(16, "Major", dmdAdvancedGraphics),
                new RequirementNamedCourses(17, "Major", dmdAdvancedGraphics),
                //new RequirementNamedCourses(18, "Major", ["CIS 4670","CIS 5670"]), // CIS 467/567 is retired
                new RequirementNamedCourses(19, "DMD Senior Project", ["CIS 4970"]),
                new RequireCis1100(9),

                new RequirementCisElective(18).withMinLevel(3000),
                new RequirementCisElective(21).withMinLevel(2000),
                new RequirementCisElective(22).withMinLevel(2000),
                new RequirementCisElective(20),

                new RequirementNamedCourses(23, "Drawing", ["FNAR 0010","FNAR 2200","FNAR 1080"]),
                new RequirementNamedCourses(24, "3D Modeling", ["DSGN 1030","DSGN 2010"]),
                new RequirementDmdElective(25),
                new RequirementDmdElective(26),
                new RequirementDmdElective(27),
                new RequirementDmdElective(28),

                new RequirementSsh(29, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(30, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(31, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(32, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(33, [CourseAttribute.SocialScience,CourseAttribute.Humanities]),
                new RequirementSsh(34, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                new RequirementSsh(35, [CourseAttribute.TBS,CourseAttribute.Humanities,CourseAttribute.SocialScience]),
                // NB: Writing requirement is @ index 41

                new RequirementFreeElective(42),
            ]
            break
        case "none":
            break
        default:
            myAssertUnreachable(degrees.undergrad)
    }
    if (ugradDegreeRequirements.length > 0) {
        const displayIndices = new Set<number>(ugradDegreeRequirements.map(r => r.displayIndex))
        myAssertEquals(displayIndices.size, ugradDegreeRequirements.length, "duplicate ugrad displayIndex")
        const degreeCUs = ugradDegreeRequirements.map(r => r.doesntConsume ? 0 : r.cus).reduce((sum, e) => sum + e, 0)
        const expectedCUs = degrees.getUndergradCUs()
        myAssertEquals(expectedCUs, degreeCUs, `${degrees.undergrad} degree should be ${expectedCUs} CUs but was ${degreeCUs}`)
    }

    let mastersDegreeRequirements: DegreeRequirement[] = []

    switch (degrees.masters) {
        case "CIS-MSE":
            const cisCrossListNumbers = [4190, 4210, 4230, 4360, 4410, 4500, 4550, 4600, 4610, 4620, 4710]
            mastersDegreeRequirements = [
                new RequirementNamedCourses(1, "Systems", ["CIS 5050", "CIS 5480", "CIS 5530", "CIS 4550", "CIS 5550", "CIS 4710", "CIS 5710"]),
                new RequirementNamedCourses(2, "Theory", ["CIS 5020", "CIS 5110"]),
                new RequirementNamedCourses(3, "Core non-ML",
                    ["CIS 5050", "CIS 5480", "CIS 5530", "CIS 4550", "CIS 5550", "CIS 4710", "CIS 5710", "CIS 5020", "CIS 5110", "CIS 5000"]),
                new RequirementNamedCourses(4, "Core",
                    ["CIS 5050", "CIS 5480", "CIS 5530", "CIS 4550", "CIS 5550", "CIS 4710", "CIS 5710", "CIS 5020", "CIS 5110", "CIS 5000", "CIS 4190", "CIS 5190", "CIS 5200", "CIS 4210", "CIS 5210"]),
                new RequirementNumbered(5, "CIS Elective [5000,7000]", "CIS",
                    function(x: number) { return cisCrossListNumbers.includes(x) || (x >= 5000 && x <= 7000)}),
                new RequirementNumbered(6, "CIS Elective [5000,6999]", "CIS",
                    function(x: number) { return cisCrossListNumbers.includes(x) || (x >= 5000 && x < 7000)}),
                new RequirementNumbered(7, "CIS Elective [5000,6999]", "CIS",
                    function(x: number) { return cisCrossListNumbers.includes(x) || (x >= 5000 && x < 7000)}),
                new RequirementNumbered(8, "Elective + Restriction 1", "CIS",
                    function(x: number) { return cisCrossListNumbers.includes(x) || (x >= 5000 && x < 8000)},
                    new Set<string>([...CisMseNonCisElectives, ...CisMseNonCisElectivesRestrictions1])),
                new RequirementNumbered(9, "Elective + Restriction 2", "CIS",
                    function(x: number) { return cisCrossListNumbers.includes(x) || (x >= 5000 && x < 8000)},
                    new Set<string>([...CisMseNonCisElectives, ...CisMseNonCisElectivesRestrictions2])),
                new RequirementNumbered(10, "Elective", "CIS",
                    function(x: number) { return cisCrossListNumbers.includes(x) || (x >= 5000 && x < 8000)},
                    new Set<string>([...CisMseNonCisElectives])),
            ]
            break
        case "CGGT":
            mastersDegreeRequirements = [
                new RequirementNamedCourses(1, "Creative Arts & Design", ["DSGN 5005"]),
                new RequirementNamedCourses(2, "Interactive Computer Graphics", ["CIS 4600", "CIS 5600"]),
                new RequirementNamedCourses(3, "Computer Animation", ["CIS 4620", "CIS 5620"]),
                new RequirementNamedCourses(4, "Advanced Topics in Graphics", ["CIS 6600"]),
                new RequirementNamedCourses(5, "Math",
                    ["CIS 4190", "CIS 5190", "CIS 5200", "CIS 4610", "CIS 5610", "CIS 5630", "CIS 5800", "CIS 5810", "ENM 5030"]),
                new RequirementNamedCourses(6, "Business & Entrepreneurship", CggtBusiness),
                new RequirementNamedCourses(7, "Graphics Elective",CggtGraphicsElectives),
                new RequirementNamedCourses(8, "Technical Elective", CggtTechnicalElectives),
                new RequirementNamedCourses(9, "Design Project", ["CIS 5680", "CIS 5970"]),
                new RequirementNamedCourses(10, "Free Elective",
                    ["DSGN 5009", "FNAR 5066", "DSGN 5004", "EAS 5460", "OIDD 6620"]
                        .concat(CggtBusiness).concat(CggtGraphicsElectives).concat(CggtTechnicalElectives))
            ]
            break
        case "ROBO":
            const roboFoundation = "roboFoundation"
            mastersDegreeRequirements = [
                new RequirementLabel(0, "<b>Take courses in at least 3 of the 4 buckets below:</b>"),
                new RequireBucketNamedCourses(1, "Artificial Intelligence Bucket", ["CIS 4190","CIS 5190","CIS 5200","CIS 4210","CIS 5210","ESE 6500"], roboFoundation),
                new RequireBucketNamedCourses(2, "Robot Design & Analysis Bucket", ["MEAM 5100","MEAM 5200","MEAM 6200"], roboFoundation),
                new RequireBucketNamedCourses(3, "Control Bucket", ["ESE 5000","ESE 5050","ESE 6190","MEAM 5130","MEAM 5170"], roboFoundation),
                new RequireBucketNamedCourses(4, "Perception Bucket", ["CIS 5800","CIS 5810","CIS 6800"], roboFoundation),
                new RequirementAttributes(5, "Technical Elective", [CourseAttribute.RoboTechElective]),
                new RequirementAttributes(6, "Technical Elective", [CourseAttribute.RoboTechElective]),
                new RequirementAttributes(7, "Technical Elective", [CourseAttribute.RoboTechElective]),
                new RequirementAttributes(8, "Technical Elective", [CourseAttribute.RoboTechElective]),
                new RequirementAttributes(9, "Technical Elective", [CourseAttribute.RoboTechElective]),
                new RequirementAttributes(10, "General Elective", [CourseAttribute.RoboGeneralElective]),
                new RequirementAttributes(11, "General Elective", [CourseAttribute.RoboGeneralElective]),
            ]
            const roboBuckets = <RequireBucketNamedCourses>mastersDegreeRequirements[1]
            roboBuckets.connectBucketGroup(3, mastersDegreeRequirements)
            break
        case "DATS":
            const datsTE = "datsTechElective"
            const allDatsCourses = DatsThesis.concat(DatsBiomedicine,DatsNetworkScience,DatsProgramming,DatsStats,DatsAI,DatsSimulation,DatsMath)
            mastersDegreeRequirements = [
                new RequirementNamedCourses(1, "Programming", ["CIT 5900","CIT 5910"]),
                new RequirementNamedCourses(2, "Statistics", ["ESE 5420"]),
                new RequirementNamedCourses(3, "Big Data Analytics", ["CIS 5450"]),
                new RequirementNamedCourses(4, "Linear Algebra", ["CIS 5150", "MATH 5130"]),
                new RequirementNamedCourses(5, "Machine Learning", ["CIS 4190", "CIS 5190", "CIS 5200", "ENM 5310", "ESE 5450", "STAT 5710"]),
                new RequirementLabel(6, "<b>Take courses in at least 3 of the 8 buckets below</b>"),
                new RequireBucketNamedCourses(7, "Thesis Bucket", DatsThesis, datsTE),
                new RequireBucketNamedCourses(8, "Biomedicine Bucket", DatsBiomedicine, datsTE),
                new RequireBucketNamedCourses(9, "Social/Network Science Bucket", DatsNetworkScience, datsTE),
                new RequireBucketNamedCourses(10, "Data-centric Programming Bucket", DatsProgramming, datsTE),
                new RequireBucketNamedCourses(11, "Surveys and Statistics Bucket", DatsStats, datsTE),
                new RequireBucketNamedCourses(12, "Data Analysis & AI Bucket", DatsAI, datsTE),
                new RequireBucketNamedCourses(13, "Simulation Methods Bucket", DatsSimulation, datsTE),
                new RequireBucketNamedCourses(14, "Math & Algorithms Bucket", DatsMath, datsTE),

                new RequirementNamedCourses(15, "Elective (from any bucket)", allDatsCourses).withConcise(),
                new RequirementNamedCourses(16, "Elective (from any bucket)", allDatsCourses).withConcise(),
            ]
            const datsBuckets = <RequireBucketNamedCourses>mastersDegreeRequirements[6]
            datsBuckets.connectBucketGroup(3, mastersDegreeRequirements)
            break
        case "none":
            break
        default:
            myAssertUnreachable(degrees.masters)
    }
    if (mastersDegreeRequirements.length > 0) {
        const displayIndices = new Set<number>(mastersDegreeRequirements.map(r => r.displayIndex))
        myAssertEquals(displayIndices.size, mastersDegreeRequirements.length, "duplicate masters displayIndex")
    }

    // APPLY COURSES TO DEGREE REQUIREMENTS

    const degreeRequirements = ugradDegreeRequirements.concat(mastersDegreeRequirements)

    // use undergrad courses first, reserve grad courses for AM
    coursesTaken.sort((a,b): number => a.courseNumberInt - b.courseNumberInt)

    // displayIndex, DegreeRequirement, RequirementOutcome, course(s) applied
    let reqOutcomes: [number,DegreeRequirement,RequirementApplyResult,CourseTaken[]][] = []
    degreeRequirements.forEach(req => {
        const displayIndex = mastersDegreeRequirements.includes(req) ? 100 + req.displayIndex : req.displayIndex
        const matched1 = req.satisfiedBy(coursesTaken)
        if (matched1 == undefined) {
            reqOutcomes.push([displayIndex, req, RequirementApplyResult.Unsatisfied, []])
        } else if (req.remainingCUs > 0) {
            const matched2 = req.satisfiedBy(coursesTaken)
            if (matched2 == undefined) { // partially satisfied by 1 course
                reqOutcomes.push([displayIndex, req, RequirementApplyResult.PartiallySatisfied, [matched1]])
            } else {
                // fully satisfied by 2 courses
                reqOutcomes.push([displayIndex, req, RequirementApplyResult.Satisfied, [matched1,matched2]])
            }
        } else {
            // fully satisfied by 1 course
            reqOutcomes.push([displayIndex, req, RequirementApplyResult.Satisfied, [matched1]])
        }
    })
    const totalRemainingCUs = countRemainingCUs(degreeRequirements)

    if (ugradDegreeRequirements.length > 0) {
        // handle special ShareWith requirements: writing, depth, ethics
        const sshCourses: CourseTaken[] = coursesTaken.filter(c => c.consumedBy != undefined && c.consumedBy!.toString().startsWith(SsHTbsTag))

        { // Writing requirement
            const writingReq = new RequirementAttributes(41, "Writing", [CourseAttribute.Writing]).withNoConsume()
            const matched = writingReq.satisfiedBy(sshCourses)
            if (matched == undefined) {
                reqOutcomes.push([writingReq.displayIndex, writingReq, RequirementApplyResult.Unsatisfied, []])
            } else {
                reqOutcomes.push([writingReq.displayIndex, writingReq, RequirementApplyResult.Satisfied, [matched]])
            }
        }
        if (degrees.getUndergradCUs() == 40) { // SS/H Depth requirement
            const depthReq = new RequirementSshDepth(42).withNoConsume()
            if (depthReq.satisfiedBy(sshCourses) != undefined) {
                reqOutcomes.push([42, depthReq, RequirementApplyResult.Satisfied, depthReq.coursesApplied])
            } else {
                reqOutcomes.push([42, depthReq, RequirementApplyResult.Unsatisfied, []])
            }
        }
        if (degrees.getUndergradCUs() == 40) { // ethics requirement: NB doesn't have to come from SSH block!
            const ethicsReq = new RequirementNamedCourses(43, "Engineering Ethics", CsciEthicsCourses).withNoConsume()
            const match1 = ethicsReq.satisfiedBy(coursesTaken)
            if (match1 == undefined) {
                reqOutcomes.push([ethicsReq.displayIndex, ethicsReq, RequirementApplyResult.Unsatisfied, []])
            } else if (ethicsReq.remainingCUs == 0) {
                reqOutcomes.push([ethicsReq.displayIndex, ethicsReq, RequirementApplyResult.Satisfied, [match1]])
            } else {
                // match VIPR 1200 & 1201
                const match2 = ethicsReq.satisfiedBy(coursesTaken)
                if (match2 == undefined) {
                    reqOutcomes.push([ethicsReq.displayIndex, ethicsReq, RequirementApplyResult.PartiallySatisfied, [match1]])
                } else {
                    reqOutcomes.push([ethicsReq.displayIndex, ethicsReq, RequirementApplyResult.Satisfied, [match1,match2]])
                }
            }
        }
    }

    // calculate GPAs
    const gpaOverallCUs = coursesTaken.reduce((sum,c) => sum + c.getGpaCUs(), 0)
    const gpaOverallPoints = coursesTaken.reduce((sum,c) => sum + c.getGpaPoints(), 0)
    const gpaOverall = gpaOverallPoints / gpaOverallCUs
    const gpaStemCUs = coursesTaken
        .filter(c => c.suhSaysMath() || c.suhSaysNatSci() || c.suhSaysEngr())
        .reduce((sum,c) => sum + c.getGpaCUs(), 0)
    const gpaStemPoints = coursesTaken
        .filter(c => c.suhSaysMath() || c.suhSaysNatSci() || c.suhSaysEngr())
        .reduce((sum,c) => sum + c.getGpaPoints(), 0)
    const gpaStem = gpaStemPoints / gpaStemCUs
    const gpaMnsCUs = coursesTaken
        .filter(c => c.suhSaysMath() || c.suhSaysNatSci())
        .reduce((sum,c) => sum + c.getGpaCUs(), 0)
    const gpaMnsPoints = coursesTaken
        .filter(c => c.suhSaysMath() || c.suhSaysNatSci())
        .reduce((sum,c) => sum + c.getGpaPoints(), 0)
    const gpaMns = gpaMnsPoints / gpaMnsCUs

    // sort by displayIndex
    reqOutcomes.sort((a,b) => a[0] - b[0])
    return new RunResult(
        reqOutcomes.map((o: [number, DegreeRequirement, RequirementApplyResult, CourseTaken[]]): RequirementOutcome => {
            return new RequirementOutcome(!mastersDegreeRequirements.includes(o[1]), o[1], o[2], o[3])
        }),
        totalRemainingCUs,
        coursesTaken.filter(c => c.courseUnitsRemaining > 0),
        gpaOverall, gpaStem, gpaMns
    )
}
