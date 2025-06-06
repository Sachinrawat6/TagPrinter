// npm install qz-tray axios

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

  const setupQZSecurity = () => {
    // Self-signed dummy certificate for testing
    const cert = `-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIEb7WT3zANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJV
UzELMAkGA1UECAwCTkMxEDAOBgNVBAcMB0R1cmhhbTEMMAoGA1UECgwDWFlaMRMw
EQYDVQQLDApEZXZlbG9wbWVudDEQMA4GA1UEAwwHbG9jYWxob3N0MB4XDTIwMTAy
MjA1MTgzMVoXDTMwMTAyMDA1MTgzMVowczELMAkGA1UEBhMCVVMxCzAJBgNVBAgM
Ak5DMRAwDgYDVQQHDAdEdXJoYW0xDDAKBgNVBAoMA1hZWiETMBEGA1UECwwKRGV2
ZWxvcG1lbnQxEDAOBgNVBAMMB2xvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBAMN0/JoaAZcwNYYL0PpjcU0KRdXhnY2AvN1zPUZyS9m+TbzP
Ug3Pq51CQj7k2w+gMdQl5DXF7V0QwWXsIdr7d2rUNIQPbJ1cxTjAxYkM2v4I2r8r
I4q05XY2HGX32xSguSYvRu7fxoAjCkPYQKKOshlLG+ruJ0uHD/Eu7b1sOv5EqLqe
zWVKzXyUBylMg7OY+fZkK7C7DwJjXLnL6LFRyE33V7Za/fW7f5vMxLk3BN+m+c5D
By0CHOMJYm6xRztbC4Wr5HbwQ2G7GPExkxqhhTmUjs3lnzvzpZpBD4oVZj6GgPbQ
gGw9GhIfhFkWsWvPPF5Yqdt1S2hlTTWx0KUJPeMCAwEAAaMhMB8wHQYDVR0OBBYE
FHGlW9YcmqhrTPznnpgEEHPX6AK2MA0GCSqGSIb3DQEBCwUAA4IBAQBf1KvzxtBP
9Jh9ThD2eg/JAbF/cvSytNg54t9EcV9gUfl27oLZSmxGWySmR6L0Ewh1xeAJS+Fr
T1S2InMD+7T0dHL9dkf2sKcRnvYRAz5UqDrHkm8c5lZae9T8ktmV9MTCuQnqzjYr
Gn6DwQUELxCMyBp/kHJmHvAw2Ndp/lyRoF1eN8TW+yMLxxjHHTt/FrlZqylhzRaC
aDkhP1Aj+RzqfWUSVYQ6f4MzU7ZD6dvX2rIFjSV30eXyGekT2k2pS3EMUTxd3ZLu
l0SBYBAG7lDYc6Z2LFE9EGVDWko+/v4PxSPZkMW7XLyMV5p4lmqC37DPM2aT/g0j
2YOmtmDC57/X
-----END CERTIFICATE-----`;

    const signature = function (toSign) {
      return function (resolve, reject) {
        // WARNING: This is only for testing purposes, bypasses real signing
        resolve(); 
      };
    };

    qz.security.setCertificatePromise(() => Promise.resolve(cert));
    qz.security.setSignaturePromise(signature);
  };

  const connectToQZ = async () => {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
      setupQZSecurity();
    }
  };

  const printTagToTSC = async () => {
    try {
      await connectToQZ();

      const config = qz.configs.create("TSC TE244"); // Change to your printer's name

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
