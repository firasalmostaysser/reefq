const fs = require('fs');

function children(buffer, start, end) {
  const out = [];
  for (let offset = start; offset + 8 <= end;) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      size = Number(buffer.readBigUInt64BE(offset + 8));
      header = 16;
    }
    if (!size || offset + size > end) break;
    out.push({ offset, size, type, header });
    offset += size;
  }
  return out;
}

function fullBoxTiming(buffer, box) {
  const version = buffer[box.offset + box.header];
  const payload = box.offset + box.header + 4;
  if (version === 0) {
    return {
      timescaleOffset: payload + 8,
      durationOffset: payload + 12,
      durationBytes: 4,
    };
  }
  return {
    timescaleOffset: payload + 16,
    durationOffset: payload + 20,
    durationBytes: 8,
  };
}

function readDuration(buffer, timing) {
  return timing.durationBytes === 4
    ? buffer.readUInt32BE(timing.durationOffset)
    : Number(buffer.readBigUInt64BE(timing.durationOffset));
}

function writeDuration(buffer, timing, duration) {
  if (timing.durationBytes === 4) {
    buffer.writeUInt32BE(duration, timing.durationOffset);
  } else {
    buffer.writeBigUInt64BE(BigInt(duration), timing.durationOffset);
  }
}

function fix(file) {
  const buffer = fs.readFileSync(file);
  const moov = children(buffer, 0, buffer.length).find((box) => box.type === 'moov');
  if (!moov) throw new Error(`No moov box in ${file}`);
  const moovChildren = children(buffer, moov.offset + moov.header, moov.offset + moov.size);
  const mvhd = moovChildren.find((box) => box.type === 'mvhd');
  if (!mvhd) throw new Error(`No mvhd box in ${file}`);
  const movieTiming = fullBoxTiming(buffer, mvhd);
  const movieScale = buffer.readUInt32BE(movieTiming.timescaleOffset);
  const movieSeconds = readDuration(buffer, movieTiming) / movieScale;

  for (const trak of moovChildren.filter((box) => box.type === 'trak')) {
    const mdia = children(buffer, trak.offset + trak.header, trak.offset + trak.size)
      .find((box) => box.type === 'mdia');
    if (!mdia) continue;
    const mdhd = children(buffer, mdia.offset + mdia.header, mdia.offset + mdia.size)
      .find((box) => box.type === 'mdhd');
    if (!mdhd) continue;
    const mediaTiming = fullBoxTiming(buffer, mdhd);
    const mediaScale = buffer.readUInt32BE(mediaTiming.timescaleOffset);
    writeDuration(buffer, mediaTiming, Math.round(movieSeconds * mediaScale));
  }

  fs.writeFileSync(file, buffer);
  console.log(`${file}: ${movieSeconds.toFixed(3)} s`);
}

process.argv.slice(2).forEach(fix);
