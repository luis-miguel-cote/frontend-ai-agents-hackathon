import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import "pdfjs-dist/build/pdf.worker.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/node_modules/pdfjs-dist/build/pdf.worker.js";

function InputPanel({ onSubmit }) {
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState("");
    const [fileUploaded, setFileUploaded] = useState(false);
    const [extractStatus, setExtractStatus] = useState(null); // null | 'success' | 'warning' | 'error'
    const [extractMsg, setExtractMsg] = useState("");


    const handleFile = async (file) => {
        if (!file) return;
        setFileName(file.name);
        setFileUploaded(true);

        const extension = file.name.split(".").pop().toLowerCase();


        // 📄 PDF
        if (extension === "pdf") {
            setExtractStatus(null);
            setExtractMsg("");
            const reader = new FileReader();
            reader.onload = async function () {
                try {
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let extractedText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const strings = content.items.map((item) => item.str);
                        extractedText += strings.join(" ") + "\n";
                    }
                    setText(extractedText);
                    if (extractedText.trim().length > 0) {
                        setExtractStatus('success');
                        setExtractMsg('Texto extraído correctamente del PDF.');
                    } else {
                        setExtractStatus('warning');
                        setExtractMsg('No se pudo extraer texto del PDF. ¿El archivo contiene texto seleccionable?');
                    }
                } catch (err) {
                    setText("");
                    setExtractStatus('error');
                    setExtractMsg('Error al leer el PDF: ' + err.message);
                }
            };
            reader.readAsArrayBuffer(file);
        }


        // 📘 WORD (.docx)
        else if (extension === "docx") {
            setExtractStatus(null);
            setExtractMsg("");
            const reader = new FileReader();
            reader.onload = async function () {
                try {
                    const result = await mammoth.extractRawText({
                        arrayBuffer: this.result,
                    });
                    setText(result.value);
                    if (result.value && result.value.trim().length > 0) {
                        setExtractStatus('success');
                        setExtractMsg('Texto extraído correctamente del DOCX.');
                    } else {
                        setExtractStatus('warning');
                        setExtractMsg('No se pudo extraer texto del DOCX.');
                    }
                } catch (err) {
                    setText("");
                    setExtractStatus('error');
                    setExtractMsg('Error al leer el DOCX: ' + err.message);
                }
            };
            reader.readAsArrayBuffer(file);
        }


        // 📝 TXT
        else if (extension === "txt") {
            setExtractStatus(null);
            setExtractMsg("");
            const reader = new FileReader();
            reader.onload = function () {
                setText(this.result);
                if (this.result && this.result.trim().length > 0) {
                    setExtractStatus('success');
                    setExtractMsg('Texto extraído correctamente del TXT.');
                } else {
                    setExtractStatus('warning');
                    setExtractMsg('No se pudo extraer texto del archivo TXT.');
                }
            };
            reader.readAsText(file);
        }



        // 🖼️ IMAGEN (OCR real)
        else if (["png", "jpg", "jpeg"].includes(extension)) {
            setExtractStatus(null);
            setExtractMsg("Procesando imagen con OCR...");
            setText("Procesando imagen con OCR...");
            const reader = new FileReader();
            reader.onload = async function () {
                try {
                    const { data: { text: ocrText } } = await Tesseract.recognize(
                        this.result,
                        "spa+eng", // Español e inglés
                        { logger: m => console.log(m) }
                    );
                    setText(ocrText || "No se detectó texto en la imagen");
                    if (ocrText && ocrText.trim().length > 0) {
                        setExtractStatus('success');
                        setExtractMsg('Texto extraído correctamente de la imagen.');
                    } else {
                        setExtractStatus('warning');
                        setExtractMsg('No se detectó texto en la imagen.');
                    }
                } catch (err) {
                    setText("");
                    setExtractStatus('error');
                    setExtractMsg('Error al procesar la imagen con OCR: ' + err.message);
                }
            };
            reader.readAsDataURL(file);
        }

        else {
            alert("Formato no soportado");
        }
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        // Validar que haya texto no vacío
        if ((!text || text.trim().length === 0) && !fileUploaded) {
            alert("Por favor ingresa texto o sube un archivo con los requerimientos");
            return;
        }
        if (text && text.trim().length === 0) {
            alert("El texto extraído o ingresado está vacío. Por favor revisa el archivo o ingresa texto manualmente.");
            return;
        }
        onSubmit({ text: text.trim(), fileName: fileName || "manual-input" });
    };

    const isReadyToSubmit = (text && text.trim().length > 0) || fileUploaded;


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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <textarea
                        className="textarea-field"
                        placeholder="Describe el requerimiento o sube un archivo..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    {fileUploaded && fileName && (
                        <div style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            background: extractStatus === 'success' ? 'rgba(74, 222, 128, 0.08)' : extractStatus === 'warning' ? 'rgba(251, 191, 36, 0.08)' : extractStatus === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(74, 222, 128, 0.08)',
                            border: extractStatus === 'success' ? '1px solid rgba(74, 222, 128, 0.25)' : extractStatus === 'warning' ? '1px solid #fbbf24' : extractStatus === 'error' ? '1px solid #ef4444' : '1px solid rgba(74, 222, 128, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: extractStatus === 'success' ? '#4ade80' : extractStatus === 'warning' ? '#fbbf24' : extractStatus === 'error' ? '#ef4444' : '#4ade80',
                            fontSize: '0.95rem',
                            marginTop: '4px'
                        }}>
                            <span style={{fontSize: '1.2em'}}>
                                {extractStatus === 'success' ? '✔' : extractStatus === 'warning' ? '⚠️' : extractStatus === 'error' ? '✖' : '✔'}
                            </span>
                            <span>
                                Archivo: <strong>{fileName}</strong><br/>
                                {extractMsg}
                            </span>
                        </div>
                    )}
                </div>

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

                    <button type="submit" disabled={!isReadyToSubmit} className="button button-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Enviar al sistema
                    </button>
                </div>

                <p className="helper-text">
                    Formatos soportados: PDF, Word (.docx), TXT, JPG, PNG. {fileUploaded && text ? 'El archivo se ha cargado correctamente.' : ''}
                </p>
            </form>
        </section>
    );
}

export default InputPanel;