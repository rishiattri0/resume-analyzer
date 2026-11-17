import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


function describeError(err, fallback) {
    if (!err?.response) {
        return {
            message: `${fallback} The request never reached the server, so your network or a firewall is blocking it.`,
            detail: "No response (network blocked or offline)"
        }
    }

    const status = err.response.status
    const serverMessage = err.response.data?.message

    if (status === 401) {
        return { message: "Your session expired. Please sign in again.", detail: "HTTP 401 (not signed in)" }
    }
    if (status === 413) {
        return { message: serverMessage || "That file is too large. Please upload a PDF under 3MB.", detail: "HTTP 413 (file too large)" }
    }
    if (status === 503) {
        return { message: serverMessage || "The AI service is busy right now. Please try again in a moment.", detail: "HTTP 503 (AI capacity)" }
    }
    if (status === 400) {
        return { message: serverMessage || fallback, detail: "HTTP 400 (invalid request)" }
    }
    if (status === 404) {
        return { message: serverMessage || "That plan could not be found.", detail: "HTTP 404 (not found)" }
    }
    return { message: serverMessage || fallback, detail: `HTTP ${status}` }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context
    const [ error, setError ] = useState("")
    const [ errorDetail, setErrorDetail ] = useState("")
    const [ downloading, setDownloading ] = useState(false)

    const fail = (err, fallback) => {
        const described = describeError(err, fallback)
        setError(described.message)
        setErrorDetail(described.detail)
    }

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError("")
        setErrorDetail("")
        let response = null
        try {
            // One automatic retry when the AI model is briefly at capacity.
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
                    break
                } catch (err) {
                    const busy = err?.response?.status === 503
                    if (attempt === 0 && busy) {
                        await sleep(2500)
                        continue
                    }
                    throw err
                }
            }
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            } else {
                setError("We couldn't generate your plan. The AI service may be busy — please try again in a moment.")
                setErrorDetail("Server returned no report")
            }
        } catch (err) {
            fail(err, "We couldn't generate your plan.")
        } finally {
            setLoading(false)
        }

        return response?.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        setError("")
        setErrorDetail("")
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            } else {
                setError("We couldn't load this interview plan. Please try again.")
                setErrorDetail("Server returned no report")
            }
        } catch (err) {
            fail(err, "We couldn't load this interview plan.")
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        setError("")
        setErrorDetail("")
        let response = null
        try {
            response = await getAllInterviewReports()
            if (response?.interviewReports) {
                setReports(response.interviewReports)
            } else {
                setError("We couldn't load your saved plans. Please try again.")
                setErrorDetail("Server returned no list")
            }
        } catch (err) {
            fail(err, "We couldn't load your saved plans.")
        } finally {
            setLoading(false)
        }

        return response?.interviewReports || []
    }

    const getResumePdf = async (interviewReportId) => {
        setError("")
        setErrorDetail("")
        setDownloading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (err) {
            fail(err, "We couldn't download the resume.")
        } finally {
            setDownloading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, downloading, report, reports, error, errorDetail, setError, generateReport, getReportById, getReports, getResumePdf }

}
