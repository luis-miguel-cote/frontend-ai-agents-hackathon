import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function InputPanel({ onSubmit }) {
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState("");

    const handleFile = async (file) => {
        if (!file) return;

        setFileName(file.name);

        const extension = file.name.split(".").pop().toLowerCase();

        // 📄 PDF
        if (extension === "pdf") {
            const reader = new FileReader();

            reader.onload = async function () {
                const typedArray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;

                let extractedText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map((item) => item.str);
                    extractedText += strings.join(" ") + "\n";
                }

                onSubmit({ text: extractedText, fileName: file.name });
            };

            reader.readAsArrayBuffer(file);
        }

        // 📘 WORD (.docx)
        else if (extension === "docx") {
            const reader = new FileReader();

            reader.onload = async function () {
                const result = await mammoth.extractRawText({
                    arrayBuffer: this.result,
                });

                onSubmit({ text: result.value, fileName: file.name });
            };

            reader.readAsArrayBuffer(file);
        }

        // 📝 TXT
        else if (extension === "txt") {
            const reader = new FileReader();

            reader.onload = function () {
                onSubmit({ text: this.result, fileName: file.name });
            };

            reader.readAsText(file);
        }

        // 🖼️ IMAGEN (simulado)
        else if (["png", "jpg", "jpeg"].includes(extension)) {
            onSubmit({
                text: "Texto detectado desde imagen (simulación OCR)",
                fileName: file.name,
            });
        }

        else {
            alert("Formato no soportado");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!text) {
            alert("Ingresa texto o sube un archivo");
            return;
        }

        onSubmit({ text });
    };

    return (
        <section className="section-card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
                <div>
                    <p className="section-label">Ingresar requerimiento</p>
                    <h2 className="section-title">Texto o archivo</h2>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="9" y2="9" />
                  <line x1="14" y1="9" x2="13" y2="9" />
                </svg>
            </div>

            <form onSubmit={handleSubmit} className="panel-grid">
                <textarea
                    className="textarea-field"
                    placeholder="Describe el requerimiento..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <div className="layout-grid columns-2" style={{ alignItems: "end" }}>
                    <label className="file-input">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M16 16v5H8v-5" />
                          <path d="M12 12v9" />
                          <path d="M20 8v-2a2 2 0 0 0-2-2h-8l-4 4v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
                          <path d="M16 2v4h4" />
                        </svg>
                        Seleccionar archivo
                        <input
                            type="file"
                            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                    </label>

                    <button type="submit" className="button button-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Enviar al sistema
                    </button>
                </div>

                <p className="helper-text">
                    Formatos soportados: PDF, Word (.docx), TXT, JPG, PNG.
                </p>

                {fileName && <p className="file-label">Archivo seleccionado: {fileName}</p>}
            </form>
        </section>
    );
}

export default InputPanel;