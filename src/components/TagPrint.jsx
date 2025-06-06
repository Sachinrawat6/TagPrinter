import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import axios from "axios";
const BASE_URL = "https://return-inventory-backend.onrender.com";

const TagPrint = ({ styleNumber, size }) => {
  const [tag, setTag] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const fetchTagDetails = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/label/print`, {
        styleNumber,
        size,
      });

      const data = response.data?.data;

      if (data?.tag && data?.synced?.all_orders?.[0]) {
        setTag(data.tag);
        setOrderId(data.synced.all_orders[0].order_id);
      }
    } catch (err) {
      console.error("Failed to fetch tag details", err);
    }
  };

  useEffect(() => {
    fetchTagDetails();
  }, []);

  useEffect(() => {
    if (tag && orderId) {
      setTimeout(() => {
        autoPrintTag();
      }, 200);
    }
  }, [tag, orderId]);

  const autoPrintTag = async () => {
    const element = document.getElementById("tag-print-area");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [100, 50],
    });

    pdf.addImage(imgData, "PNG", 0, 0, 100, 50);
    pdf.autoPrint();
    window.open(pdf.output("bloburl"));
  };

  if (!tag || !orderId) return null;

  return (
    <div
      id="tag-print-area"
      style={{
        width: "100mm",
        height: "50mm",
        padding: "1mm",
        background: "#fff",
        fontSize: "11px",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #000",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div style={{ lineHeight: "1.3" }}>
        <b>
        <p>Product: {tag.product_name}</p>
        <p>Brand: {tag.brand} | SKU: {`${tag.styleNumber}-${tag.color}-${tag.size}`}</p>
        <p>Color: {tag.color} | Size: {tag.size}</p>
        <p>MRP: ₹{tag.mrp} (Incl. of all taxes)</p>
        <p>Net Qty: 1 | Unit: 1 Pcs | Order Id : {orderId} </p>
        <p>MFG & MKT BY: {tag.mfg}</p>
        <p>Contact: {tag.contact}</p>
        </b>
      </div>

      <div
        style={{
          position: "absolute",
          top: "10mm",
          right: "8mm",
          background: "#fff",
          textAlign: "center",
        }}
      >
        <QRCode value={String(orderId)} size={90} />
        
      </div>
    </div>
  );
};

export default TagPrint;
