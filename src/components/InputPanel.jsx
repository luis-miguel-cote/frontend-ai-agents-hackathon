import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// worker PDF
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
        <div style={{ marginBottom: "20px" }}>
            <h3>📥 Ingresar requerimiento</h3>

            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Describe el requerimiento..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                        width: "100%",
                        height: "100px",
                        marginBottom: "10px",
                        borderRadius: "10px",
                        padding: "10px",
                    }}
                />

                <input
                    type="file"
                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => handleFile(e.target.files[0])}
                />
                <p style={{ fontSize: "12px", opacity: 0.7 }}>
                    Formatos soportados: PDF, Word (.docx), TXT, imágenes (JPG, PNG)
                </p>

                {fileName && <p>📄 {fileName} cargado</p>}

                <br /><br />

                <button type="submit">
                    🚀 Enviar al sistema
                </button>
            </form>
        </div>
    );
}

export default InputPanel;