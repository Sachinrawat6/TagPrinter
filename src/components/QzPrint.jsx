import React, { useEffect, useState } from "react";
import axios from "axios";
import qz from "qz-tray";

const BASE_URL = "https://return-inventory-backend.onrender.com";

const QzPrint = ({ styleNumber, size }) => {
  const [tag, setTag] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Paste your full certificate signature here (replace with your actual cert)
  const CERTIFICATE = `
-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIEbYkZ7DANBgkqhkiG9w0BAQsFADBvMQswCQYDVQQGEwJJ
...
-----END CERTIFICATE-----
`;

  // Paste your private key here (replace with your actual key)
  const PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYN0GJf...
-----END PRIVATE KEY-----
`;

  // QZ Tray signing callback - required for secure connection
  const signature = (toSign) => {
    return new Promise((resolve, reject) => {
      try {
        const crypto = window.crypto || window.msCrypto;
        // For real signing, you use your backend or proper signing method.
        // Here for demo, resolve empty or dummy signature.
        // **IMPORTANT** Replace this with your actual signature generation logic!
        resolve("your-signature-generated-from-toSign");
      } catch (err) {
        reject(err);
      }
    });
  };

  // Connect to QZ Tray with cert + signature
  const connectQZ = async () => {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect({
          // Provide your full certificate and private key
          // For Netlify, use this method since no backend available for signing
          certificates: CERTIFICATE,
          privateKey: PRIVATE_KEY,
          signature,
        });
      }
    } catch (err) {
      console.error("QZ Connect Error:", err);
    }
  };

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

  // Print the tag to the TSC printer using TSPL
  const printToTSC = async () => {
    try {
      await connectQZ();

      const printerName = await qz.printers.find("TSC"); // Or your exact printer name
      const config = qz.configs.create(printerName);

      const tspl = [
        "SIZE 100 mm, 50 mm",
        "GAP 3 mm, 0 mm",
        "DENSITY 7",
        "SPEED 4",
        "DIRECTION 1",
        "REFERENCE 0,0",
        "CLS",
        `TEXT 10,10,"3",0,1,1,"Product: ${tag.product_name}"`,
        `TEXT 10,40,"3",0,1,1,"Brand: ${tag.brand} | SKU: ${tag.styleNumber}-${tag.color}-${tag.size}"`,
        `TEXT 10,70,"3",0,1,1,"Color: ${tag.color} | Size: ${tag.size}"`,
        `TEXT 10,100,"3",0,1,1,"MRP: ₹${tag.mrp}"`,
        `TEXT 10,130,"3",0,1,1,"Qty: 1 | OrderId: ${orderId}"`,
        `TEXT 10,160,"3",0,1,1,"MFG: ${tag.mfg} | Contact: ${tag.contact}"`,
        `QRCODE 600,40,L,5,A,0,"${orderId}"`,
        "PRINT 1,1"
      ];

      await qz.print(config, tspl);

      // Optionally disconnect websocket after print
      qz.websocket.disconnect();
    } catch (err) {
      console.error("Print error:", err);
    }
  };

  useEffect(() => {
    fetchTagDetails();
  }, [styleNumber, size]);

  useEffect(() => {
    if (tag && orderId) {
      printToTSC();
    }
  }, [tag, orderId]);

  return null; // This component renders nothing visually
};

export default QzPrint;
