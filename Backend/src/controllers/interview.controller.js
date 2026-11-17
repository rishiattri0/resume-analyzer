const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

function isAiBusyError(err) {
    const code = err?.status || err?.code || err?.error?.code || ""
    const message = String(err?.message || "")
    return code === 503 || code === 429 || code === "UNAVAILABLE" || code === "RESOURCE_EXHAUSTED" ||
        /high demand|overloaded|temporar|try again/i.test(message)
}


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const jobDescription = String(req.body?.jobDescription || "").trim()
    const selfDescription = String(req.body?.selfDescription || "").trim()

    if (!jobDescription) {
        return res.status(400).json({
            message: "Please paste the target job description."
        })
    }

    let resumeText = ""
    if (req.file) {
        try {
            const resumeContent = await pdfParse(req.file.buffer)
            resumeText = String(resumeContent.text || "").trim()
        } catch (err) {
            return res.status(400).json({
                message: "We couldn't read that file. Please upload a PDF resume."
            })
        }
    }

    if (!resumeText && !selfDescription) {
        return res.status(400).json({
            message: "Upload a resume or add a quick self-description."
        })
    }

    let interViewReportByAi
    try {
        interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })
    } catch (err) {
        console.error("Interview report generation failed:", err?.message || err)
        if (isAiBusyError(err)) {
            return res.status(503).json({
                message: "The AI service is busy right now. Please try again in a moment."
            })
        }
        return res.status(500).json({
            message: "We couldn't generate your plan. Please try again."
        })
    }

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    let pdfBuffer
    try {
        pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })
    } catch (err) {
        console.error("Resume PDF generation failed:", err?.message || err)
        if (isAiBusyError(err)) {
            return res.status(503).json({
                message: "The AI service is busy right now. Please try again in a moment."
            })
        }
        return res.status(500).json({
            message: "We couldn't build that PDF. Please try again."
        })
    }

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }
