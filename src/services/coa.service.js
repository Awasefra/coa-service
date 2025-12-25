import dgram from "dgram";
import radius from "radius";
import { logger } from "../utils/logger.js";

const secret = "12345678";

export async function sendCoaToNas(nasIp, username, sessionid) {
  const packet = {
    code: "Disconnect-Request",
    secret,
    identifier: Math.floor(Math.random() * 255),
    attributes: [
      ["User-Name", username],
      ["NAS-IP-Address", nasIp],
      ["Acct-Session-Id", sessionid],
    ],
  };

  const encoded = radius.encode(packet);
  const socket = dgram.createSocket("udp4");

  return new Promise((resolve) => {
    const start = Date.now();

    const timeout = setTimeout(() => {
      socket.close();

      logger.warn("COA_TIMEOUT", {
        nas: nasIp,
        username,
        sessionid,
        duration_ms: Date.now() - start,
      });

      resolve(null);
    }, 3000);

    socket.on("message", (msg) => {
      clearTimeout(timeout);

      try {
        const response = radius.decode({ packet: msg, secret });

        logger.info("COA_SUCCESS", {
          nas: nasIp,
          username,
          sessionid,
          response: response.code,
          duration_ms: Date.now() - start,
        });

        socket.close();
        resolve(response.code);
      } catch (err) {
        logger.error("COA_DECODE_ERROR", {
          nas: nasIp,
          username,
          sessionid,
          error: err.message,
        });

        socket.close();
        resolve(null);
      }
    });

    socket.send(encoded, 3799, nasIp, (err) => {
      if (err) {
        clearTimeout(timeout);
        socket.close();

        logger.error("COA_SEND_ERROR", {
          nas: nasIp,
          username,
          sessionid,
          error: err.message,
        });

        resolve(null);
      } else {
        logger.info("COA_SENT", {
          nas: nasIp,
          username,
          sessionid,
        });
      }
    });
  });
}
