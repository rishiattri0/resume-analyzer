import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useState } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context
    const [ error, setError ] = useState("")
    const [ downloading, setDownloading ] = useState(false)

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            } else {
                setError("We couldn't generate your plan. The AI service may be busy — please try again in a moment.")
            }
        } catch (err) {
            const status = err?.response?.status
            const message = err?.response?.data?.message
            if (status === 401) {
                setError("Your session expired. Please sign in again.")
            } else if (status === 503 && message) {
                setError(message)
            } else if (status === 400 && message) {
                setError(message)
            } else {
                setError("We couldn't generate your plan. Please check your connection and try again.")
            }
        } finally {
            setLoading(false)
        }

        return response?.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
            } else {
                setError("We couldn't load this interview plan. Please try again.")
            }
        } catch (err) {
            const status = err?.response?.status
            if (status === 401) {
                setError("Your session expired. Please sign in again.")
            } else if (status === 404) {
                setError("This interview plan doesn't exist anymore.")
            } else {
                setError("We couldn't load this interview plan. Please check your connection and try again.")
            }
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await getAllInterviewReports()
            if (response?.interviewReports) {
                setReports(response.interviewReports)
            } else {
                setError("We couldn't load your saved plans. Please try again.")
            }
        } catch (err) {
            const status = err?.response?.status
            if (status === 401) {
                setError("Your session expired. Please sign in again.")
            } else {
                setError("We couldn't reach the server. Check your connection, then retry.")
            }
        } finally {
            setLoading(false)
        }

        return response?.interviewReports || []
    }

    const getResumePdf = async (interviewReportId) => {
        setError("")
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
        catch (error) {
            setError("We couldn't download the resume. The AI service may be busy — please try again.")
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

    return { loading, downloading, report, reports, error, setError, generateReport, getReportById, getReports, getResumePdf }

}