import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

interface ExportData {
  title: string;
  author: string;
  type: string;
  date: string;
  payout: number;
}

export async function createAndGetSpreadsheet(auth: OAuth2Client) {
  try {
    // Create a new spreadsheet
    const drive = google.drive({ version: 'v3', auth });
    const timestamp = new Date().toISOString().split('T')[0];
    const fileMetadata = {
      name: `Payout Report ${timestamp}`,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    if (!file.data.id) {
      throw new Error('Failed to create spreadsheet');
    }

    const spreadsheetId = file.data.id;
    
    // Create new spreadsheet instance
    const doc = new GoogleSpreadsheet(spreadsheetId, auth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

export async function exportToGoogleSheets(data: ExportData[], auth: OAuth2Client) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const doc = await createAndGetSpreadsheet(auth);

    // Create a new sheet
    const sheet = await doc.addSheet({ 
      title: 'Payout Report', 
      headerValues: ['Title', 'Author', 'Type', 'Date', 'Payout'] 
    });

    // Add the data rows
    const rows = data.map(item => ({
      Title: item.title,
      Author: item.author,
      Type: item.type,
      Date: item.date,
      Payout: item.payout,
    }));

    await sheet.addRows(rows);

    // Add total row
    const totalPayout = data.reduce((sum, item) => sum + item.payout, 0);
    await sheet.addRow({
      Title: 'TOTAL',
      Author: '',
      Type: '',
      Date: '',
      Payout: totalPayout,
    });

    // Format the sheet
    await sheet.loadCells('A1:E' + (data.length + 2));

    // Format header row
    for (let i = 0; i < 5; i++) {
      const cell = sheet.getCell(0, i);
      cell.textFormat = { bold: true };
      cell.backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 };
    }

    // Format payout column as currency
    for (let i = 1; i <= data.length + 1; i++) {
      const cell = sheet.getCell(i, 4);
      cell.numberFormat = { type: 'CURRENCY', pattern: '$#,##0.00' };
    }

    // Format total row
    const totalCell = sheet.getCell(data.length + 1, 0);
    totalCell.textFormat = { bold: true };

    await sheet.saveUpdatedCells();

    return {
      success: true,
      url: `https://docs.google.com/spreadsheets/d/${doc.spreadsheetId}/edit?usp=sharing`,
      error: null,
    };
  } catch (error) {
    console.error('Error in exportToGoogleSheets:', error);
    return {
      success: false,
      url: null,
      error: error instanceof Error ? error.message : 'Failed to export to Google Sheets',
    };
  }
} 