import mammoth from "mammoth";
import fs from "fs";

async function readDoc() {
  try {
    const result = await mammoth.extractRawText({path: "../Nishant_Kumar_Resume.docx"});
    console.log(result.value);
  } catch (error) {
    console.error("Error reading doc:", error);
  }
}

readDoc();
