//This utility file isolates all certificate and report download logic.

// src/components/pages/EmployeeHistorySearch/utils/certificateService.ts
// import { OperatorSkill, HanchouResult, ShokuchouResult, Score, MasterEmployee } from "../types";
import type { OperatorSkill, HanchouResult, ShokuchouResult, Score, MasterEmployee } from "../types";

const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};

const handleFetch = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed: ${response.statusText}`);
    }
    return response;
};

export const downloadFullReport = async (employee: MasterEmployee): Promise<void> => {
    const response = await handleFetch("http://127.0.0.1:8000/employee-report/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_no: employee.emp_id }),
    });
    const blob = await response.blob();
    downloadBlob(blob, `employee_report_${employee.emp_id}.pdf`);
};

export const downloadSkillCertificate = async (skill: OperatorSkill): Promise<void> => {
    const response = await handleFetch(`http://127.0.0.1:8000/operator-skills/${skill.id}/download-certificate/`);
    const blob = await response.blob();
    const skillName = skill.station_name.replace(/\W+/g, "_");
    const operatorName = skill.employee_name.replace(/\W+/g, "_");
    downloadBlob(blob, `Certificate_${operatorName}_${skillName}.pdf`);
};

export const downloadScoreCertificate = async (score: Score): Promise<void> => {
    const response = await handleFetch(`http://127.0.0.1:8000/scores/${score.id}/download-certificate/`);
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'Assessment_Certificate.pdf';
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch?.[1]) filename = filenameMatch[1];
    }
    downloadBlob(blob, filename);
};

export const downloadHanchouCertificate = async (result: HanchouResult, employeeName: string): Promise<void> => {
    const response = await handleFetch(`http://127.0.0.1:8000/hanchou-results/${result.id}/download-certificate/`);
    const blob = await response.blob();
    const cleanEmployeeName = employeeName.replace(/\W+/g, "_");
    const examName = result.exam_name.replace(/\W+/g, "_");
    downloadBlob(blob, `Certificate_${cleanEmployeeName}_${examName}.pdf`);
};

export const downloadShokuchouCertificate = async (result: ShokuchouResult, employeeName: string): Promise<void> => {
    const response = await handleFetch(`http://127.0.0.1:8000/shokuchou-results/${result.id}/download-certificate/`);
    const blob = await response.blob();
    const cleanEmployeeName = employeeName.replace(/\W+/g, "_");
    const examName = result.exam_name.replace(/\W+/g, "_");
    downloadBlob(blob, `Certificate_${cleanEmployeeName}_${examName}.pdf`);
};