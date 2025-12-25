import dgram from "dgram";
import radius from "radius";
const secret = "12345678"

export async function sendCoaToNas(nasIp, username, sessionid ) {
  const packet = {
    code: "Disconnect-Request", // atau "CoA-Request"
    secret,
    identifier: Math.floor(Math.random() * 255),
    attributes: [
      ["User-Name", username],
      ["NAS-IP-Address", nasIp],
      ["Acct-Session-Id", sessionid],
    ]
  };

  const encoded = radius.encode(packet);

  const socket = dgram.createSocket("udp4");

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.close();
      console.warn(`CoA timeout / no response from NAS ${nasIp}`);
      resolve(null); // kembalikan null atau status gagal tapi jangan throw
    }, 3000);

    socket.on("message", (msg) => {
      clearTimeout(timeout);

      try {
        const response = radius.decode({ packet: msg, secret });

        console.log("NAS Response:", response.code);
        socket.close();

        resolve(response.code);
      } catch (err) {
        console.error(`Error decoding response from NAS ${nasIp}:`, err);
        socket.close();
        resolve(null); // tetap resolve agar tidak stop
      }
    });

    socket.send(encoded, 3799, nasIp, (err) => {
      if (err) {
        clearTimeout(timeout);
        socket.close();
        reject(err);
      } else {
        console.log(`COA sent -> ${username} @ ${nasIp}`);
      }
    });
  });
}
