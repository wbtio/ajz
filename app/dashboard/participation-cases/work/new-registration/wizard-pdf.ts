/**
 * PDF builders for the registration wizard.
 *
 * These were ~400 lines of drawing code embedded in wizard-controller.tsx.
 * They are pure functions of their inputs: they take the data, return bytes,
 * and never touch component state, Supabase or toasts.
 */

import type { RegistrationDocument } from './wizard-types'

export interface PackageCoverInput {
  caseNumber: string
  clientName: string
  applicantDetails: [string, string][]
  eventName: string
  participationType: string
  travelPurpose: string
  visaDestination: string
  visaEmbassy: string
  visaType: string
  visaSubmissionMethod: string
  appointmentAt: string
  appointmentReference: string
  documents: RegistrationDocument[]
}

/** Renders the cover + index pages that are prepended to the merged package. */
export async function buildPackageCoverPdf(input: PackageCoverInput): Promise<ArrayBuffer> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF()
  const generatedAt = new Date().toLocaleString('en-GB')
  const valueOrDash = (value: unknown) => String(value ?? '').trim() || '—'

  pdf.setFontSize(18)
  pdf.text('JAZ Visa Document Package', 20, 22)
  pdf.setFontSize(10)
  pdf.text(`Application: ${input.caseNumber || 'Draft'}`, 20, 34)
  pdf.text(`Client: ${input.clientName || 'Client'}`, 20, 41)
  pdf.text(`Destination: ${input.visaDestination}`, 20, 48)
  pdf.text(`Generated: ${generatedAt}`, 20, 55)
  pdf.line(20, 62, 190, 62)

  pdf.setFontSize(12)
  pdf.text('Applicant details', 20, 74)
  pdf.setDrawColor(220)
  let detailsY = 82
  input.applicantDetails.forEach(([label, value], index) => {
    const column = index % 2
    const x = column === 0 ? 20 : 108
    if (column === 0 && index > 0) detailsY += 18
    pdf.setFontSize(8)
    pdf.setTextColor(100)
    pdf.text(label, x, detailsY)
    pdf.setFontSize(10)
    pdf.setTextColor(25)
    const wrappedValue = pdf.splitTextToSize(valueOrDash(value), 78)
    pdf.text(wrappedValue.slice(0, 2), x, detailsY + 6)
    pdf.line(x, detailsY + 12, x + 78, detailsY + 12)
  })

  const detailsBottom = detailsY + 22
  pdf.setTextColor(25)
  pdf.setFontSize(12)
  pdf.text('Visa application details', 20, detailsBottom)
  const applicationDetails = [
    `Event: ${input.eventName || '—'}`,
    `Participation type: ${input.participationType || '—'}`,
    `Travel purpose: ${input.travelPurpose || '—'}`,
    `Visa destination: ${input.visaDestination || '—'}`,
    `Embassy: ${input.visaEmbassy || '—'}`,
    `Visa type: ${input.visaType || '—'}`,
    `Submission method: ${input.visaSubmissionMethod || '—'}`,
    `Appointment: ${input.appointmentAt || '—'}`,
    `Appointment reference: ${input.appointmentReference || '—'}`,
  ]
  pdf.setFontSize(9)
  let applicationY = detailsBottom + 9
  applicationDetails.forEach((line) => {
    const wrappedLine = pdf.splitTextToSize(line, 166)
    pdf.text(wrappedLine, 24, applicationY)
    applicationY += wrappedLine.length * 5 + 2
  })

  pdf.addPage()
  pdf.setFontSize(15)
  pdf.text('Documents included in this JAZ file', 20, 22)
  pdf.setFontSize(9)
  pdf.text(`Application: ${input.caseNumber || 'Draft'}  |  Total files: ${input.documents.length}`, 20, 31)
  pdf.line(20, 37, 190, 37)
  let documentsY = 48
  input.documents.forEach((document, index) => {
    const documentLine = `${index + 1}. ${document.name} (${document.type})`
    const wrappedLine = pdf.splitTextToSize(documentLine, 160)
    const requiredHeight = wrappedLine.length * 6 + 4
    if (documentsY + requiredHeight > 278) {
      pdf.addPage()
      pdf.setFontSize(12)
      pdf.text('Documents included — continued', 20, 22)
      pdf.line(20, 28, 190, 28)
      documentsY = 40
      pdf.setFontSize(9)
    }
    pdf.text(wrappedLine, 24, documentsY)
    documentsY += requiredHeight
  })
  pdf.setFontSize(8)
  pdf.text('The original documents remain available from the application record.', 20, 288)

  return pdf.output('arraybuffer')
}

/** Merges the cover pages and the selected source files into one PDF. */
export async function mergeDocumentsIntoPdf(coverPdf: ArrayBuffer | null, documents: RegistrationDocument[]): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib')
  const mergedPdf = await PDFDocument.create()

  if (coverPdf) {
    const infoPdf = await PDFDocument.load(coverPdf)
    const infoPages = await mergedPdf.copyPages(infoPdf, infoPdf.getPageIndices())
    infoPages.forEach((page) => mergedPdf.addPage(page))
  }

  for (const document of documents) {
    const response = await fetch(document.path)
    if (!response.ok) throw new Error(`Could not load file: ${document.name}`)
    const bytes = new Uint8Array(await response.arrayBuffer())
    const contentType = response.headers.get('content-type')?.toLowerCase() || ''
    const lowerName = document.name.toLowerCase()

    if (contentType.includes('pdf') || lowerName.endsWith('.pdf')) {
      const sourcePdf = await PDFDocument.load(bytes)
      const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices())
      pages.forEach((page) => mergedPdf.addPage(page))
    } else if (contentType.includes('png') || lowerName.endsWith('.png')) {
      const image = await mergedPdf.embedPng(bytes)
      const page = mergedPdf.addPage([595.28, 841.89])
      const scale = Math.min(555.28 / image.width, 801.89 / image.height)
      page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale })
    } else if (contentType.includes('jpeg') || contentType.includes('jpg') || /\.(jpe?g)$/i.test(lowerName)) {
      const image = await mergedPdf.embedJpg(bytes)
      const page = mergedPdf.addPage([595.28, 841.89])
      const scale = Math.min(555.28 / image.width, 801.89 / image.height)
      page.drawImage(image, { x: (595.28 - image.width * scale) / 2, y: (841.89 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale })
    } else {
      throw new Error(`Unsupported package file: ${document.name}. Use PDF, PNG, or JPG.`)
    }
  }

  return mergedPdf.save()
}

export interface ReceiptInput {
  receiptId: string
  caseNumber: string
  registrationId: string
  clientName: string
  clientCompany: string
  eventName: string
  paymentDate: string
  paymentMethod: string
  paymentNotes: string
  currency: string
  pricingItems: { label: string; price: number }[]
  discount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
}

const money = (currency: string, value: number) => `${currency === 'IQD' ? 'IQD' : currency === 'EUR' ? 'EUR' : '$'} ${value.toFixed(2)}`

/** Internal receipt with the full fee breakdown. */
export async function buildCompanyReceiptPdf(input: ReceiptInput): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const left = 18
  const right = pageWidth - 18
  const amount = (value: number) => money(input.currency, value)

  const drawLabelValue = (label: string, value: string, x: number, y: number, width: number) => {
    pdf.setFontSize(7.5)
    pdf.setTextColor(112, 128, 144)
    pdf.text(label.toUpperCase(), x, y)
    pdf.setFontSize(9.5)
    pdf.setTextColor(31, 41, 55)
    pdf.text(pdf.splitTextToSize(value || '—', width), x, y + 5)
  }

  pdf.setFillColor(139, 0, 0)
  pdf.rect(0, 0, pageWidth, 34, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(21)
  pdf.text('JAZ', left, 16)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('APPLICATIONS CONTROL', left, 23)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(15)
  pdf.text('PAYMENT RECEIPT', right, 16, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.text(input.receiptId, right, 23, { align: 'right' })

  pdf.setFillColor(248, 250, 252)
  pdf.roundedRect(left, 44, pageWidth - 36, 27, 3, 3, 'F')
  drawLabelValue('Receipt number', input.receiptId, left + 6, 51, 45)
  drawLabelValue('Issue date', input.paymentDate || new Date().toLocaleDateString('en-GB'), left + 62, 51, 45)
  drawLabelValue('Payment method', input.paymentMethod || '—', left + 118, 51, 55)

  pdf.setTextColor(139, 0, 0)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('CLIENT & APPLICATION', left, 84)
  pdf.setDrawColor(226, 232, 240)
  pdf.line(left, 87, right, 87)
  drawLabelValue('Client name', input.clientName, left, 96, 75)
  drawLabelValue('Application ID', input.caseNumber || 'Draft', left + 82, 96, 45)
  drawLabelValue('Event', input.eventName, left + 137, 96, 37)

  pdf.setTextColor(139, 0, 0)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('PRICING BREAKDOWN', left, 124)
  const rowGap = 7.5
  const rowsCount = Math.max(1, input.pricingItems.length) + (input.discount > 0 ? 1 : 0)
  const breakdownHeight = Math.max(28, rowsCount * rowGap + 18)
  const breakdownTop = 128
  pdf.setFillColor(248, 250, 252)
  pdf.roundedRect(left, breakdownTop, pageWidth - 36, breakdownHeight, 3, 3, 'F')
  let feeY = breakdownTop + 12
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  if (input.pricingItems.length === 0) {
    pdf.setTextColor(148, 163, 184)
    pdf.text('No pricing items defined for this event.', left + 7, feeY)
    feeY += rowGap
  }
  input.pricingItems.forEach((item) => {
    pdf.setTextColor(71, 85, 105)
    pdf.text(item.label, left + 7, feeY)
    pdf.text(amount(item.price), right - 7, feeY, { align: 'right' })
    pdf.setDrawColor(226, 232, 240)
    pdf.line(left + 7, feeY + 3, right - 7, feeY + 3)
    feeY += rowGap
  })
  if (input.discount > 0) {
    pdf.setTextColor(190, 24, 93)
    pdf.text('Discount', left + 7, feeY)
    pdf.text(amount(-input.discount), right - 7, feeY, { align: 'right' })
    pdf.setDrawColor(226, 232, 240)
    pdf.line(left + 7, feeY + 3, right - 7, feeY + 3)
    feeY += rowGap
  }

  const totalsTop = breakdownTop + breakdownHeight + 4
  const totalsHeight = 30
  pdf.setFillColor(139, 0, 0)
  pdf.roundedRect(left, totalsTop, pageWidth - 36, totalsHeight, 3, 3, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text('TOTAL AMOUNT', left + 8, totalsTop + 11)
  pdf.text('AMOUNT PAID', left + 8, totalsTop + 19.5)
  pdf.text('BALANCE DUE', left + 8, totalsTop + 28)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text(amount(input.totalAmount), right - 8, totalsTop + 11, { align: 'right' })
  pdf.text(amount(input.amountPaid), right - 8, totalsTop + 19.5, { align: 'right' })
  pdf.text(amount(input.balanceDue), right - 8, totalsTop + 28, { align: 'right' })

  const notesTop = totalsTop + totalsHeight + 12
  if (input.paymentNotes) {
    pdf.setTextColor(71, 85, 105)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('NOTES', left, notesTop)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(pdf.splitTextToSize(input.paymentNotes, pageWidth - 36), left, notesTop + 7)
  }
  pdf.setDrawColor(226, 232, 240)
  pdf.line(left, notesTop + 19, right, notesTop + 19)
  pdf.setTextColor(148, 163, 184)
  pdf.setFontSize(8)
  pdf.text('Generated by JAZ Applications Control', left, notesTop + 27)
  pdf.text(input.caseNumber || input.registrationId, right, notesTop + 27, { align: 'right' })

  return pdf.output('blob')
}

/** Client-facing receipt, without the internal fee breakdown. */
export async function buildClientReceiptPdf(input: ReceiptInput, logoDataUrl: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const left = 18
  const right = pageWidth - 18
  const amount = (value: number) => money(input.currency, value)

  pdf.setFillColor(11, 52, 58)
  pdf.rect(0, 0, pageWidth, 42, 'F')
  pdf.setFillColor(38, 190, 151)
  pdf.rect(0, 0, pageWidth * 0.22, 42, 'F')
  pdf.setFillColor(246, 190, 32)
  pdf.triangle(pageWidth * 0.22, 42, pageWidth * 0.31, 42, pageWidth * 0.27, 25, 'F')
  if (logoDataUrl) pdf.addImage(logoDataUrl, 'PNG', left, 8, 30, 20)
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(17)
  pdf.text('PAYMENT RECEIPT', right, 18, { align: 'right' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.text(input.receiptId, right, 27, { align: 'right' })

  pdf.setTextColor(83, 48, 91)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(15)
  pdf.text('Your payment', pageWidth / 2, 57, { align: 'center' })
  pdf.setTextColor(31, 41, 55)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.text(`Order number: ${input.receiptId}`, left, 72)
  pdf.text(`Order date: ${input.paymentDate || new Date().toLocaleDateString('en-GB')}`, left, 79)
  pdf.text('Order status: Confirmed', left, 86)
  pdf.text(`Method of payment: ${input.paymentMethod || '—'}`, left, 93)
  const clientInfoX = right - 76
  pdf.text(`Client name: ${input.clientName}`, clientInfoX, 72)
  pdf.text(`Company: ${input.clientCompany}`, clientInfoX, 79)
  pdf.text(`Application: ${input.caseNumber || '—'}`, clientInfoX, 86)

  pdf.setDrawColor(148, 163, 184)
  pdf.setLineWidth(0.35)
  const tableTop = 119
  const tableBottom = 139
  const quantityX = left + 48
  const amountX = right - 92
  pdf.line(left, tableTop, right, tableTop)
  pdf.line(left, tableTop + 8, right, tableTop + 8)
  pdf.line(left, tableBottom, right, tableBottom)
  pdf.line(quantityX, tableTop, quantityX, tableBottom)
  pdf.line(amountX, tableTop, amountX, tableBottom)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('Description', left + 5, tableTop + 5)
  pdf.text('Quantity', quantityX + 5, tableTop + 5)
  pdf.text('Total amount (incl. services)', amountX + 5, tableTop + 5)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Event & visa services', left + 2, tableTop + 15)
  pdf.text('1', quantityX + 8, tableTop + 15)
  pdf.text(amount(input.totalAmount), right - 5, tableTop + 15, { align: 'right' })
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('TOTAL (incl. services):', right - 5, 155, { align: 'right' })
  pdf.text(amount(input.totalAmount), right - 5, 163, { align: 'right' })

  pdf.setTextColor(100, 116, 139)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8.5)
  pdf.text('Thank you for your payment.', left, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.line(left, 263, right, 263)
  pdf.setTextColor(71, 85, 105)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('JOINT ANNUAL ZONE (JAZ)', left, 272)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7.5)
  pdf.text("Iraq's gateway to international exhibitions and partnerships", left, 278)
  pdf.text('info@jaz.iq  •  +964 771 900 0600  •  www.jaz.iq', left, 284)
  pdf.text(input.receiptId, right, 287, { align: 'right' })

  return pdf.output('blob')
}

/** Loads the brand logo as a data URL; returns '' when it cannot be fetched. */
export async function loadLogoDataUrl(): Promise<string> {
  try {
    const logoBlob = await fetch('/Joint Annual Zone logo.png').then((response) => response.blob())
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '')
      reader.readAsDataURL(logoBlob)
    })
  } catch {
    return ''
  }
}
