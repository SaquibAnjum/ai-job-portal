const PDFDocument = require('pdfkit');

const generateOfferPdfStream = (offer, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Offer_Letter_${offer._id}.pdf`);

  doc.pipe(res);

  // Document Header
  doc
    .fillColor('#4F46E5')
    .fontSize(24)
    .text('OFFER OF EMPLOYMENT', { align: 'center' })
    .moveDown(0.5);

  doc
    .fillColor('#374151')
    .fontSize(12)
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
    .moveDown(1);

  // Recipient
  doc
    .fontSize(14)
    .fillColor('#111827')
    .text(`Dear Candidate,`, { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(11)
    .fillColor('#374151')
    .text(
      `We are pleased to extend to you an offer of employment for the position of ${offer.jobTitle}. We were impressed with your background and believe your technical skills will be a vital addition to our engineering team.`
    )
    .moveDown(1);

  // Offer Details Table Box
  doc
    .rect(50, doc.y, 500, 140)
    .fillAndStroke('#F9FAFB', '#E5E7EB');

  let y = doc.y - 130;
  doc
    .fillColor('#111827')
    .fontSize(12)
    .text(`Position: ${offer.jobTitle}`, 70, y)
    .text(`Annual Compensation: ${offer.currency || 'USD'} $${offer.salary?.toLocaleString()}`, 70, y + 25)
    .text(`Joining Date: ${new Date(offer.joiningDate).toLocaleDateString()}`, 70, y + 50)
    .text(`Employment Type: Full-Time Permanent`, 70, y + 75)
    .text(`Status: ${offer.status}`, 70, y + 100);

  doc.moveDown(4);

  // Terms & Conditions
  doc
    .fontSize(12)
    .fillColor('#111827')
    .text('Terms & Conditions:', { underline: true })
    .moveDown(0.3);

  doc
    .fontSize(10)
    .fillColor('#4B5563')
    .text(offer.terms || 'This offer is subject to standard background verification and company policies.')
    .moveDown(3);

  // Signatures
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Authorized Hiring Manager', 50, doc.y)
    .text('Candidate Acceptance', 350, doc.y - 14)
    .moveDown(2);

  doc
    .fontSize(9)
    .fillColor('#9CA3AF')
    .text('Generated electronically via AI Job Portal Platform.', { align: 'center' });

  doc.end();
};

module.exports = { generateOfferPdfStream };
