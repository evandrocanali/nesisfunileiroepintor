import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateQuotePDF = async (quoteData, { save = true, returnBlob = false } = {}) => {
  const doc = new jsPDF();
  const { client, vehicle, items, total, photos, workshopLogo, observations, validity } = quoteData;

  // Header Logo
  if (workshopLogo) {
    try {
      doc.addImage(workshopLogo, 'PNG', 160, 10, 35, 35);
    } catch (e) {
      console.error('Error adding logo to PDF:', e);
    }
  }

  // Header Text
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // Primary color
  doc.text('ORÇAMENTO', 14, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Muted text
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 32);
  if (validity) {
    doc.text(`Validade: ${validity}`, 70, 32);
  }

  // Client Info (Moved down slightly to accommodate header)
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Dados do Cliente', 14, 48);
  doc.line(14, 50, 196, 50);

  doc.setFontSize(10);
  doc.text(`Nome: ${client.name}`, 14, 58);
  doc.text(`Telefone: ${client.phone}`, 14, 63);
  doc.text(`Email: ${client.email}`, 14, 68);

  // Vehicle Info
  doc.setFontSize(14);
  doc.text('Dados do Veículo', 14, 83);
  doc.line(14, 85, 196, 85);

  doc.setFontSize(10);
  doc.text(`Modelo: ${vehicle.model}`, 14, 93);
  doc.text(`Placa: ${vehicle.plate}`, 70, 93);
  doc.text(`Ano: ${vehicle.year}`, 120, 93);
  doc.text(`Cor: ${vehicle.color}`, 160, 93);

  // Items Table
  const tableData = items.map(item => [
    item.description,
    `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}`,
    item.quantity,
    `R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['Descrição', 'Preço Unit.', 'Qtd', 'Subtotal']],
    body: tableData,
    headStyles: { fillColor: [99, 102, 241] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 105 },
  });

  const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 12;
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(`TOTAL: R$ ${total.toFixed(2).replace('.', ',')}`, 195, finalY, { align: 'right' });

  // Observations
  if (observations) {
    const obsY = finalY + 15;
    doc.setFontSize(12);
    doc.text('Observações:', 14, obsY);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const splitObs = doc.splitTextToSize(observations, 180);
    doc.text(splitObs, 14, obsY + 7);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Obrigado pela preferência!', 105, 280, { align: 'center' });

  // Photos Annex
  if (photos && photos.length > 0) {
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('ANEXO FOTOGRÁFICO', 105, 20, { align: 'center' });
    
    let xOffset = 14;
    let yOffset = 30;
    const imgWidth = 85;
    const imgHeight = 65;
    const margin = 10;

    photos.forEach((photo, index) => {
      if (index > 0 && index % 4 === 0) {
        doc.addPage();
        yOffset = 30;
        xOffset = 14;
      }
      
      try {
        doc.addImage(photo.src, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
      } catch (e) {
        console.error('Error adding image to PDF:', e);
      }

      xOffset += imgWidth + margin;
      if ((index + 1) % 2 === 0) {
        xOffset = 14;
        yOffset += imgHeight + margin;
      }
    });
  }

  if (save) {
    doc.save(`orcamento-${client.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }

  if (returnBlob) {
    return doc.output('blob');
  }
};
