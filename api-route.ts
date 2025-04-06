import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files: any) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to process upload' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        // For formidable v2+, use file.filepath; for older versions, use file.path
        const filePath = file.filepath || file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        
        return res.status(200).json({ text: data.text });
      } catch (error) {
        console.error('PDF parsing error:', error);
        return res.status(500).json({ error: 'Failed to parse PDF' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
