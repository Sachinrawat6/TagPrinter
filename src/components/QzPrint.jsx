// QzPrint.jsx

import React, { useEffect, useState } from "react";
import qz from "qz-tray";
import { sha256 } from "js-sha256"; // npm install js-sha256

const QzPrint = ({ styleNumber, size }) => {
  const [printerName, setPrinterName] = useState(null);

  const tag = {
    product_name: "Cool Shirt",
    brand: "Qurvii",
    styleNumber: styleNumber,
    color: "Red",
    size: size,
    mrp: 1299,
    mfg: "06/2025",
    contact: "support@example.com"
  };

  const orderId = `ORD-${styleNumber}-${size}`;

  // 1. Certificate from QZ.io (sample)
  const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIE0DCCA7igAwIBAgIJANkL6Km+Lmh8MA0GCSqGSIb3DQEBCwUAMIGkMQswCQYD
VQQGEwJVUzELMAkGA1UECAwCTUExEzARBgNVBAcMCk5vcnRoIEJvc3RvbjEQMA4G
A1UECgwHUVogSW5rMRAwDgYDVQQLDAdRWiB0ZWFtMR8wHQYDVQQDDBZTZWxmLXNp
Z25lZCBDZXJ0aWZpY2F0ZTEiMCAGCSqGSIb3DQEJARYTZW5naW5lZXJAcXouaW8w
HhcNMjIwMzE2MDUyMjE4WhcNMzIwMzEzMDUyMjE4WjCBpDELMAkGA1UEBhMCVVMx
CzAJBgNVBAgMAk1BMREwDwYDVQQHDAhCb3N0b24gTjEQMA4GA1UECgwHUVoJdGVh
bTEQMA4GA1UECwwHUVoJZGV2czEfMB0GA1UEAwwWc2VsZi1zaWduZWQgQ2VydGlm
aWNhdGUxIjAgBgkqhkiG9w0BCQEWE2VuZ2luZWVyQHF6LmlvMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuHaTRdS4BFjQST0KvJ03zH0SVSLqTAYu+zbi
pxzAZBN5h5T+aLJ0Pz8BFeZKO/CWPOK/Zy7ukwXeZc5KhBz+pD90gEo62YcMSy7/
pmJ9PZH1q3UgB5zUOi7UffujxXEyFfM8rDFfM/RAa7BdTIj7PgMFCgzzupF7qLk/
RTOFv/7QnUv3U6WZ3kMEZ8I/IBJ1LsL2KHaAGPRUdbfZ9cGmmdXcX+3nLDr81mj2
OeTNdFUR17y3xXkZn3hDaGLhILoFZKo0LSkIgBNsYkoGeEEXs07QNN5LbVSpRb1z
FePvF8A9FGaD+d6U++qIpP2RzTn0uJ0PazBecqEYQYLRab9/3QIDAQABo1AwTjAd
BgNVHQ4EFgQUWlUJIKF5kZoHMG/GyxVfgOwzPBcwHwYDVR0jBBgwFoAUWlUJIKF5
kZoHMG/GyxVfgOwzPBcwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEA
kEfRE7mMWiCkPUwBQIHhCrgQfqWmgKiKXMDbpM/fW9oYXNKnDciH8qREJtMLXLmh
CV79AxBpMi0rK6ZIj+/9jK7s7LQXRZkPRPdloAvRfnPl2PlPqKshqUBzYm4V7tp+
UQk0i1ydl/0eYJtAFHjLRuHxvBCvM5c7I2YrAOfJuLZTaeOX9x54TtFROvFRYROZ
vVGmEjvI+Qfgu+dwUjY9Ha1EJKtwcN6mcO3zBqFZbs3FjDiSHMdFRaJZ1TV5hFcr
WkZyRCQuYhaIBFSoy+fqUKYDzGAlkKyV4jG8SPN2nmqAnX1mAYiwP07W9R3En5xs
6nkE41ZrAxr6J9qZm1H+KA==
-----END CERTIFICATE-----`;

  // 2. SHA256 + Sign using test key
  const setupSecurity = () => {
    qz.security.setCertificatePromise(async () => CERTIFICATE);

    qz.security.setSignaturePromise(async (toSign) => {
      // ✍️ Use test private key or insecure JS hash — don't use this in production!
      const hash = sha256(toSign); // fake signing (hash only)
      return hash;
    });
  };

  const connectToQZ = async () => {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
      setupSecurity();
    }
  };

  const detectPrinter = async () => {
    await connectToQZ();
    const printers = await qz.printers.find();
    console.log("Printers:", printers);
    const preferred = printers.find((p) => p.toLowerCase().includes("tsc"));
    setPrinterName(preferred || printers[0]);
  };

  const printTag = async () => {
    if (!printerName) return console.warn("No printer found");

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
    console.log("Print sent");
    await qz.websocket.disconnect();
  };

  useEffect(() => {
    detectPrinter();
  }, []);

  useEffect(() => {
    if (printerName) {
      printTag();
    }
  }, [printerName]);

  return null;
};

export default QzPrint;
