// Install qz-tray first
// npm install qz-tray

import React, { useEffect, useState } from "react";
import axios from "axios";
import qz from "qz-tray";
const BASE_URL = "https://return-inventory-backend.onrender.com";

const QzPrint = ({ styleNumber, size }) => {
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

  const connectToQZ = async () => {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }
  };

  const printTagToTSC = async () => {
    try {
      await connectToQZ();

      const config = qz.configs.create("TSC Printer"); // Replace with your printer's name

      const tspl = [
        "SIZE 100 mm, 50 mm",
        "GAP 3 mm, 0 mm",
        "DENSITY 7",
        "SPEED 4",
        "DIRECTION 1",
        "REFERENCE 0,0",
        "CLS",
        `TEXT 10,10,\"3\",0,1,1,\"Product: ${tag.product_name}\"`,
        `TEXT 10,40,\"3\",0,1,1,\"Brand: ${tag.brand} | SKU: ${tag.styleNumber}-${tag.color}-${tag.size}\"`,
        `TEXT 10,70,\"3\",0,1,1,\"Color: ${tag.color} | Size: ${tag.size}\"`,
        `TEXT 10,100,\"3\",0,1,1,\"MRP: ₹${tag.mrp}\"`,
        `TEXT 10,130,\"3\",0,1,1,\"Qty: 1 | OrderId: ${orderId}\"`,
        `TEXT 10,160,\"3\",0,1,1,\"MFG: ${tag.mfg} | Contact: ${tag.contact}\"`,
        `QRCODE 600,40,L,5,A,0,\"${orderId}\"`,
        "PRINT 1,1"
      ];

      await qz.print(config, tspl);
      await qz.websocket.disconnect();
    } catch (err) {
      console.error("Failed to print to TSC printer:", err);
    }
  };

  useEffect(() => {
    fetchTagDetails();
  }, []);

  useEffect(() => {
    if (tag && orderId) {
      printTagToTSC();
    }
  }, [tag, orderId]);

  return null;
};

export default QzPrint;
