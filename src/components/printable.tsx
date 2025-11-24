 import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "./ui/button";

type PrintableProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  brand: string;
  quantity: number;
};

interface Props {
  products: PrintableProduct[];
}

export default function Printable({ products }: Props) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Product Download Report", 14, 20);

    // Table headers
    const headers = [["ID", "Name", "Category", "Brand", "Initial Price", "Initial Qty"]];

    // Format price into Rp
    const formatPrice = (value: number) =>
      `Rp${new Intl.NumberFormat("id-ID").format(value)}`;

    // Table rows
    const data = products.map((p) => [
      p.id,
      p.name,
      p.category,
      p.brand,
      p.price ? formatPrice(p.price) : "N/A",
      p.quantity ?? "N/A",
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: data,
    });

    // Generate blob and open print dialog
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
    };
  };

  return <Button className="cursor-pointer hover:bg-[#b4dff3] hover:text-black" onClick={generatePDF}>Print PDF</Button>;
}
 