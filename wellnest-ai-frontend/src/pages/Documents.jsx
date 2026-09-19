import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  FolderOpen,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Pill,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useHealth } from "../context/HealthContext";
import { enrichFindingInterpretation } from "../utils/nimApi";

const typeStyles = {
  "Prescription": "bg-indigo-soft text-indigo border-indigo/20",
  "Lab result": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Discharge summary": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function Documents() {
  const navigate = useNavigate();
  const {
    documents,
    processAndAddDocument,
    isProcessingDoc,
    deleteDocument,
  } = useHealth();

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showRawText, setShowRawText] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setError("");

    for (const file of files) {
      try {
        const processed = await processAndAddDocument(file);
        // Automatically open the detailed explanation for the newly uploaded document
        setSelectedDoc(processed);
      } catch (err) {
        console.error("[Documents] Failed to process file:", err);
        setError(err.message || "Failed to read document with OCR. Please verify your connection or try another file.");
      }
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Medical documents"
        title="Upload your records"
        subtitle="Prescriptions, lab results, and discharge summaries — WellNest reads and explains each one."
      />

      {/* Upload Source Actions */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessingDoc}
          className="flex items-center gap-3 rounded-xl border border-mist bg-white px-4 py-4 text-left shadow-panel transition-colors hover:border-indigo hover:bg-indigo-soft/40 disabled:opacity-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
            <Camera size={18} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">Scan a document</p>
            <p className="text-[12.5px] text-slate">Use your camera</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingDoc}
          className="flex items-center gap-3 rounded-xl border border-mist bg-white px-4 py-4 text-left shadow-panel transition-colors hover:border-indigo hover:bg-indigo-soft/40 disabled:opacity-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
            <Upload size={18} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">Upload a file</p>
            <p className="text-[12.5px] text-slate">Image or PDF</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingDoc}
          className="flex items-center gap-3 rounded-xl border border-mist bg-white px-4 py-4 text-left shadow-panel transition-colors hover:border-indigo hover:bg-indigo-soft/40 disabled:opacity-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
            <FolderOpen size={18} />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink">Choose from device</p>
            <p className="text-[12.5px] text-slate">Browse your files</p>
          </div>
        </button>
      </section>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Drag and Drop Zone */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          if (!isProcessingDoc) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isProcessingDoc) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !isProcessingDoc && fileInputRef.current?.click()}
        className={[
          "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          isDragging ? "border-indigo bg-indigo-soft" : "border-mist bg-white hover:border-indigo/50",
          isProcessingDoc ? "cursor-wait bg-canvas" : "",
        ].join(" ")}
      >
        {isProcessingDoc ? (
          <>
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo border-t-transparent" />
            <p className="mt-2 text-[14.5px] font-semibold text-ink">WellNest AI is reading your document...</p>
            <p className="text-[13px] text-slate">Running OCR and extracting clinical details and medication schedule.</p>
          </>
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-soft text-indigo">
              <Upload size={18} />
            </span>
            <p className="mt-1 text-[14.5px] font-medium text-ink">Drop your document here</p>
            <p className="text-[13px] text-slate">or click to browse — Prescriptions, Lab Results, Discharge Summaries (PDF, JPG, PNG)</p>
          </>
        )}
      </section>

      {error && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Documents List */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[17px] font-semibold text-ink">Uploaded records</h3>
          <span className="text-[13px] text-slate">{documents.length} total</span>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-mist bg-white/60 px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-ink">No medical documents uploaded yet.</p>
            <p className="mt-1 text-[12.5px] text-slate">
              Upload a prescription, lab result, or hospital discharge summary above to view your clinical summary and sync your medicines.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-mist bg-white shadow-panel">
            <ul className="divide-y divide-mist">
              {documents.map((doc) => {
                const badgeClass = typeStyles[doc.type] || "bg-canvas text-slate border-mist";
                const medCount = doc.medications?.length || 0;

                return (
                  <li
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-canvas sm:px-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
                      <FileText size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-semibold text-ink">{doc.name}</p>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}>
                          {doc.type}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-slate">
                        Uploaded {doc.date}
                        {medCount > 0 && ` · ${medCount} medication${medCount > 1 ? "s" : ""} added to schedule`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="hidden items-center gap-1 text-[12.5px] font-medium text-meadow sm:flex">
                        <CheckCircle2 size={14} /> Analyzed
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                          if (selectedDoc?.id === doc.id) setSelectedDoc(null);
                        }}
                        className="rounded p-1.5 text-slate-light hover:bg-mist hover:text-coral"
                        title="Remove document"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={18} className="text-slate-light" />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-slate-light">
          <Clock size={13} /> Documents are analyzed automatically by WellNest AI — summaries and medication plans are extracted instantly.
        </p>
      </section>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-mist bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-mist px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
                  <FileText size={18} />
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-bold text-ink">
                    {selectedDoc.documentTitle || selectedDoc.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeStyles[selectedDoc.type] || "bg-canvas text-slate border-mist"}`}>
                      {selectedDoc.type}
                    </span>
                    <span className="text-[12px] text-slate">{selectedDoc.date}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDoc(null);
                  setShowRawText(false);
                }}
                className="rounded-lg p-2 text-slate hover:bg-canvas hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6 scrollbar-thin">

              {/* WellNest Plain-Language Explanation */}
              {(selectedDoc.laymanExplanation || selectedDoc.explanation) && (
                <div className="rounded-xl border border-indigo/20 bg-indigo-soft/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-indigo">
                    <Sparkles size={16} />
                    <h4 className="text-[13px] font-semibold uppercase tracking-wider">WellNest Explanation</h4>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-ink whitespace-pre-line">
                    {selectedDoc.laymanExplanation || selectedDoc.explanation}
                  </p>
                </div>
              )}

              {/* Diagnosis / Key Findings */}
              {selectedDoc.diagnosis && (
                <div className="rounded-xl border border-mist bg-white p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-slate">
                    <Stethoscope size={16} />
                    <h4 className="text-[13px] font-semibold uppercase tracking-wider">Condition or Finding</h4>
                  </div>
                  <p className="text-[14px] font-medium text-ink">{selectedDoc.diagnosis}</p>
                </div>
              )}

              {/* Test & Clinical Findings */}
              {selectedDoc.findingsList && selectedDoc.findingsList.length > 0 && (
                <div className="rounded-xl border border-mist bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-[13px] font-semibold uppercase tracking-wider text-slate">Test & Clinical Findings</h4>
                    <span className="text-[11.5px] text-slate">{selectedDoc.findingsList.length} finding{selectedDoc.findingsList.length > 1 ? "s" : ""} recorded</span>
                  </div>
                  <div className="space-y-2">
                    {selectedDoc.findingsList.map((f, idx) => {
                      const lowerStatus = (f.status || "").toLowerCase();
                      const isNormal = lowerStatus.includes("normal");
                      const isLow = lowerStatus.includes("low");
                      const statusColor = isNormal
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isLow
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200";

                      const interpText =
                        f.interpretation && f.interpretation.trim().length > 15
                          ? f.interpretation.trim()
                          : enrichFindingInterpretation(f.name, f.value, f.status);

                      return (
                        <div key={idx} className="rounded-lg border border-mist bg-canvas p-3.5 transition-colors hover:border-slate-light/60">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13.5px] font-semibold text-ink">{f.name}</p>
                            <div className="flex items-center gap-2">
                              {f.value && <span className="font-mono text-[13px] font-bold text-ink">{f.value}</span>}
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColor}`}>
                                {f.status || "Normal"}
                              </span>
                            </div>
                          </div>
                          {interpText && (
                            <p className="mt-2 text-[12.5px] leading-relaxed text-slate border-t border-mist/70 pt-2">
                              {interpText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Extracted Medication Plan (if prescription) */}
              {selectedDoc.medications && selectedDoc.medications.length > 0 && (
                <div className="rounded-xl border border-mist bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink">
                      <Pill size={16} className="text-indigo" />
                      <h4 className="text-[14px] font-semibold">Medication Plan Extracted</h4>
                    </div>
                    <span className="rounded bg-meadow-soft px-2 py-0.5 text-[11px] font-semibold text-meadow">
                      Added to Medicines tab
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedDoc.medications.map((m, idx) => (
                      <div key={idx} className="rounded-lg border border-mist bg-canvas p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[13.5px] font-semibold text-ink">
                            {m.name} <span className="font-normal text-slate">({m.dose})</span>
                          </p>
                          <span className="rounded bg-indigo-soft px-2 py-0.5 text-[11px] font-medium text-indigo">
                            {m.time} · {m.clock}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] text-slate">
                          {m.purpose} — {m.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Recommendations */}
              {selectedDoc.followUpRecommendations && (
                <div className="rounded-xl border border-mist bg-canvas p-4">
                  <h4 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-slate">Follow-up & Next Steps</h4>
                  <div className="space-y-2 text-[13px] text-ink">
                    {selectedDoc.followUpRecommendations
                      .split(/(?:\s*\*\s*|\n+)/)
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo" />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Ask WellNest AI in Chat Callout */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-indigo/20 bg-indigo-soft/30 p-3.5">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-indigo shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-ink">Have questions about this record?</p>
                    <p className="text-[12px] text-slate">Ask WellNest AI in chat to explain test results or clarify doctor instructions.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoc(null);
                    navigate("/chat");
                  }}
                  className="shrink-0 rounded-lg bg-indigo px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-indigo-deep"
                >
                  Ask in AI Chat
                </button>
              </div>

              {/* Raw Extracted Text Accordion */}
              {selectedDoc.rawExtractedText && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-[12.5px] font-medium text-indigo hover:underline"
                  >
                    {showRawText ? "Hide original OCR text" : "View original OCR text"}
                  </button>
                  {showRawText && (
                    <div className="mt-2 rounded-lg border border-mist bg-canvas p-3 font-mono text-[12px] text-slate">
                      <pre className="whitespace-pre-wrap">{selectedDoc.rawExtractedText}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-mist px-6 py-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDoc(null);
                  setShowRawText(false);
                }}
                className="rounded-lg bg-indigo px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-indigo-deep"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
