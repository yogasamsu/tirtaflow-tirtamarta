const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = path.join('..', 'Indeks Surat 2025.xlsx');
const outputPath = path.join('..', 'seed_classifications.sql');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let sqlContent = `-- Seed data for classification_codes\n`;
    sqlContent += `INSERT INTO classification_codes (code, description) VALUES\n`;

    const values = [];
    // Start from row 4 (index 3) based on previous analysis [No, Kode, Keterangan] is at index 2
    for (let i = 3; i < data.length; i++) {
        const row = data[i];
        // Expecting row[1] = code, row[2] = description
        const code = row[1];
        const desc = row[2];

        if (code && desc) {
            // Escape single quotes for SQL
            const safeCode = String(code).replace(/'/g, "''").trim();
            const safeDesc = String(desc).replace(/'/g, "''").trim();
            values.push(`('${safeCode}', '${safeDesc}')`);
        }
    }

    if (values.length > 0) {
        sqlContent += values.join(',\n') + ';\n';
        fs.writeFileSync(outputPath, sqlContent);
        console.log(`Successfully generated SQL seed file at ${outputPath} with ${values.length} entries.`);
    } else {
        console.log("No valid data found to generate SQL.");
    }

} catch (e) {
    console.error("Error generating SQL:", e);
}
