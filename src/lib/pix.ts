function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return tag + len + value;
}

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  transactionId?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, transactionId } = params;

  const merchantAccountInfo =
    tlv('00', 'br.gov.bcb.pix') +
    tlv('01', pixKey);

  const payloadWithoutCRC =
    tlv('00', '01') +
    tlv('01', amount ? '12' : '11') +
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount !== undefined ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', merchantName.substring(0, 25).toUpperCase()) +
    tlv('60', merchantCity.substring(0, 15).toUpperCase()) +
    tlv('62', tlv('05', (transactionId || '***').substring(0, 25)));

  const crcValue = crc16(payloadWithoutCRC + '6304' + '0000');
  return payloadWithoutCRC + tlv('63', crcValue);
}
