import { readFileSync, writeFileSync } from 'node:fs'

async function main() {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const data = readFileSync('/Users/hasanainalmazrai/Downloads/JAZ_Cooperation_Section_Content.pdf')
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise
    let out = ''
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const text = await page.getTextContent()
        const lines = []
        let lastY = null
        for (const item of text.items) {
            const y = Math.round(item.transform[5])
            if (lastY !== null && Math.abs(y - lastY) > 2) lines.push('\n')
            lines.push(item.str)
            if (item.hasEOL) lines.push('\n')
            lastY = y
        }
        out += `===== PAGE ${i} =====\n` + lines.join(' ').replace(/  +/g, ' ').replace(/\n /g, '\n') + '\n\n'
    }
    writeFileSync('/tmp/cooperation.txt', out)
    console.log(out)
}

main().catch(e => { console.error(e); process.exit(1) })
