var html_to_pdf = require('html-pdf-lts');
export class PDFHelper {
    static convertHTMLToPDF(html_content: string) {

        return new Promise(async (resolve: (val: Buffer) => void, reject) => {
            try {
                let options = {
                    "height": "12.5in",
                    "width": "15.5in"
                };

                html_to_pdf.create(html_content, options).toBuffer(function (err, pdfBuffer) {
                    if (err) {
                        console.log(err);
                    }
                    resolve(pdfBuffer);
                    return;
                });

            } catch (error) {
                reject(error);
                return;
            }

        });

    }


}
