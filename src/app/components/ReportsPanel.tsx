"use client"; // This component uses hooks and event handlers

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

// Define types for better code clarity
interface Chat {
    chat_id: string;
    chat_name: string;
    active: boolean;
    source_name: string;
}

// Assuming report data rows are objects with string keys/values after parsing
type ReportRow = Record<string, string>;

export default function ReportGeneratorPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string>('');
    const [reportData, setReportData] = useState<ReportRow[]>([]);
    const [reportHeaders, setReportHeaders] = useState<string[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch active chats from both WhatsApp and Telegram
    const fetchChats = useCallback(async () => {
        setIsLoadingChats(true);
        setError(null);
        setChats([]); // Clear previous chats
        
        try {
            // Fetch chats from both sources
            const [whatsappResponse, telegramResponse] = await Promise.all([
                fetch(`/api/chats?source_name=${encodeURIComponent("whatsapp")}`),
                fetch(`/api/chats?source_name=${encodeURIComponent("telegram")}`)
            ]);

            if (!whatsappResponse.ok) {
                const errorData = await whatsappResponse.json();
                throw new Error(errorData.error || `Failed to fetch WhatsApp chats (status: ${whatsappResponse.status})`);
            }
            
            if (!telegramResponse.ok) {
                const errorData = await telegramResponse.json();
                throw new Error(errorData.error || `Failed to fetch Telegram chats (status: ${telegramResponse.status})`);
            }

            const whatsappData: { chats: Chat[] } = await whatsappResponse.json();
            const telegramData: { chats: Chat[] } = await telegramResponse.json();
            
            // Combine and filter active chats from both sources
            const allActiveChats = [
                ...whatsappData.chats.filter(chat => chat.active),
                ...telegramData.chats.filter(chat => chat.active)
            ];
            
            setChats(allActiveChats);
        } catch (err: any) {
            console.error("Error fetching chats:", err);
            setError(err.message || "An unknown error occurred while fetching chats.");
        } finally {
            setIsLoadingChats(false);
        }
    }, []);

    // Fetch chats on component mount
    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // Handle chat selection change
    const handleChatSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChatId(event.target.value);
        // Reset report data when selection changes
        setReportData([]);
        setReportHeaders([]);
        setError(null);
    };

    // Generate report for display
    const generateReport = async () => {
        if (!selectedChatId) return;

        setIsGeneratingReport(true);
        setError(null);
        setReportData([]);
        setReportHeaders([]);

        try {
            const url = `/api/services/generate_table?chat_id=${encodeURIComponent(selectedChatId)}&format=csv`;
            const response = await fetch(url);

            if (!response.ok) {
                // Try to get error message from response body if possible
                let errorMsg = `Failed to generate report (status: ${response.status})`;
                try {
                    const errorText = await response.text();
                    errorMsg = `Failed to generate report: ${errorText || response.statusText}`;
                } catch (_) { /* Ignore parsing error */ }
                throw new Error(errorMsg);
            }

            const csvText = await response.text();

            // Parse CSV data
            Papa.parse<ReportRow>(csvText, {
                header: true, // Assumes first row is header
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.error("CSV Parsing errors:", results.errors);
                        setError(`Failed to parse CSV report. ${results.errors[0]?.message || ''}`);
                        setReportData([]);
                        setReportHeaders([]);
                    } else {
                        setReportHeaders(results.meta.fields || []);
                        setReportData(results.data);
                    }
                },
                error: (err: Error) => {
                    console.error("CSV Parsing error:", err);
                    setError(`Failed to parse CSV report: ${err.message}`);
                    setReportData([]);
                    setReportHeaders([]);
                }
            });

        } catch (err: any) {
            console.error("Error generating report:", err);
            setError(err.message || "An unknown error occurred while generating the report.");
            setReportData([]);
            setReportHeaders([]);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Download report file
    const downloadReport = async (format: 'csv' | 'xlsx') => {
        if (!selectedChatId) return;

        setIsDownloading(true);
        setError(null); // Clear previous errors

        try {
            const url = `/api/services/generate_table?chat_id=${encodeURIComponent(selectedChatId)}&format=${format}`;
            const response = await fetch(url);

            if (!response.ok) {
                let errorMsg = `Failed to download report (status: ${response.status})`;
                 try {
                    const errorText = await response.text();
                    errorMsg = `Failed to download report: ${errorText || response.statusText}`;
                } catch (_) { /* Ignore parsing error */ }
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `report-${selectedChatId}.${format}`; // Set filename
            document.body.appendChild(link);
            link.click(); // Trigger download
            document.body.removeChild(link); // Clean up
            window.URL.revokeObjectURL(downloadUrl); // Free up memory

        } catch (err: any) {
            console.error(`Error downloading ${format} report:`, err);
            setError(err.message || `An unknown error occurred while downloading the ${format} report.`);
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold mb-4 text-base-content">Chat Report Generator</h1>

            {/* Chat Selection */}
            <div className="form-control w-full max-w-xs">
                <label className="label">
                    <span className="label-text text-base-content">Select an Active Chat</span>
                </label>
                <select
                    className={`select select-bordered text-base-content ${isLoadingChats ? 'opacity-50' : ''}`}
                    value={selectedChatId}
                    onChange={handleChatSelect}
                    disabled={isLoadingChats || chats.length === 0}
                >
                    <option value="" disabled className="text-base-content">
                        {isLoadingChats ? "Loading chats..." : (chats.length === 0 ? "No active chats found" : "Select a chat")}
                    </option>
                    {chats.map((chat) => (
                        <option key={chat.chat_id} value={chat.chat_id} className="text-base-content">
                            {chat.chat_name} ({chat.chat_id}) - {chat.source_name}
                        </option>
                    ))}
                </select>
                {isLoadingChats && <span className="loading loading-spinner loading-sm ml-2"></span>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    className="btn btn-primary text-base-content"
                    onClick={generateReport}
                    disabled={!selectedChatId || isGeneratingReport || isDownloading}
                >
                    {isGeneratingReport ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            <span className="text-base-content">Generating...</span>
                        </>
                    ) : (
                        <span className="text-base-content">Generate Report</span>
                    )}
                </button>
                <button
                    className="btn btn-secondary text-base-content"
                    onClick={() => downloadReport('csv')}
                    disabled={!selectedChatId || isGeneratingReport || isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            <span className="text-base-content">Downloading...</span>
                        </>
                    ) : (
                        <span className="text-base-content">Download CSV</span>
                    )}
                </button>
                <button
                    className="btn btn-accent text-base-content"
                    onClick={() => downloadReport('xlsx')}
                    disabled={!selectedChatId || isGeneratingReport || isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            <span className="text-base-content">Downloading...</span>
                        </>
                    ) : (
                        <span className="text-base-content">Download XLSX</span>
                    )}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div role="alert" className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-base-content">Error: {error}</span>
                </div>
            )}

            {/* Report Table Display */}
            {reportData.length > 0 && reportHeaders.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2 text-base-content">Report Preview</h2>
                    <div className="overflow-x-auto border border-base-300 rounded-lg">
                        <table className="table table-zebra w-full">
                            {/* head */}
                            <thead className="bg-base-200">
                                <tr>
                                    {reportHeaders.map((header) => (
                                        <th key={header} className="text-base-content">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* body */}
                                {reportData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover">
                                        {reportHeaders.map((header) => (
                                            <td key={`${rowIndex}-${header}`} className="text-base-content">{row[header]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {isGeneratingReport && reportData.length === 0 && (
                <div className="text-center p-4 text-base-content">Generating report preview...</div>
            )}
        </div>
    );
}