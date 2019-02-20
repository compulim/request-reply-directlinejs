export default async function (req) {
  return new Promise((resolve, reject) => {
    let buffers = [];
    let numBytes = 0;

    req.on('data', buffer => {
      buffers.push(buffer);
      numBytes += buffer.length;
    });

    req.on('end', () => {
      const final = Buffer.concat(buffers, numBytes);

      buffers = [];
      resolve(final);
    });

    req.on('error', err => reject(err));
  });
}
