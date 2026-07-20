import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOfx } from './ofxParser';

test('parseOfx: parses basic OFX with one transaction', () => {
  const ofx = `OFXHEADER:100
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKID>001</BANKID>
        <ACCTID>12345-6</ACCTID>
        <BANKTRANLIST>
          <DTSTART>20250101</DTSTART>
          <DTEND>20250131</DTEND>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250115</DTPOSTED>
            <TRNAMT>-150.00</TRNAMT>
            <FITID>1001</FITID>
            <MEMO>Pagamento fornecedor</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;
  const result = parseOfx(ofx);
  assert.equal(result.bankId, '001');
  assert.equal(result.accountId, '12345-6');
  assert.equal(result.startDate, '2025-01-01');
  assert.equal(result.endDate, '2025-01-31');
  assert.equal(result.transactions.length, 1);
  const t = result.transactions[0];
  assert.equal(t.id, '1001');
  assert.equal(t.date, '2025-01-15');
  assert.equal(t.amount, 150);
  assert.equal(t.type, 'DEBIT');
  assert.equal(t.description, 'Pagamento fornecedor');
});

test('parseOfx: parses CREDIT transaction', () => {
  const ofx = `<OFX><STMTTRN><TRNTYPE>CREDIT</TRNTYPE><DTPOSTED>20250120</DTPOSTED><TRNAMT>500.00</TRNAMT><FITID>1002</FITID><MEMO>Depósito cliente</MEMO></STMTTRN></OFX>`;
  const result = parseOfx(ofx);
  assert.equal(result.transactions.length, 1);
  const t = result.transactions[0];
  assert.equal(t.amount, 500);
  assert.equal(t.type, 'CREDIT');
});

test('parseOfx: uses NAME tag when MEMO is absent', () => {
  const ofx = `<OFX><STMTTRN><TRNTYPE>DEBIT</TRNTYPE><DTPOSTED>20250110</DTPOSTED><TRNAMT>-30.00</TRNAMT><FITID>1003</FITID><NAME>COMPRA 123</NAME></STMTTRN></OFX>`;
  const result = parseOfx(ofx);
  assert.equal(result.transactions[0].description, 'COMPRA 123');
});

test('parseOfx: generates fallback id when FITID is missing', () => {
  const ofx = `<OFX><STMTTRN><TRNTYPE>CREDIT</TRNTYPE><DTPOSTED>20250105</DTPOSTED><TRNAMT>100.00</TRNAMT><MEMO>Credito</MEMO></STMTTRN></OFX>`;
  const result = parseOfx(ofx);
  assert.ok(result.transactions[0].id.startsWith('ofx_'));
});

test('parseOfx: handles QFX format (same OFX structure)', () => {
  const qfx = `<OFX><STMTTRN><TRNTYPE>DEBIT</TRNTYPE><DTPOSTED>20250301</DTPOSTED><TRNAMT>-75.00</TRNAMT><FITID>2001</FITID><MEMO>Assinatura</MEMO></STMTTRN></OFX>`;
  const result = parseOfx(qfx);
  assert.equal(result.transactions.length, 1);
  assert.equal(result.transactions[0].amount, 75);
});

test('parseOfx: returns empty list when no STMTTRN', () => {
  const ofx = `<OFX><BANKMSGSRSV1></BANKMSGSRSV1></OFX>`;
  const result = parseOfx(ofx);
  assert.equal(result.transactions.length, 0);
});

test('parseOfx: parses OFX date variants', () => {
  const ofx = `<OFX><STMTTRN><TRNTYPE>DEBIT</TRNTYPE><DTPOSTED>2025-04-10 14:30:00</DTPOSTED><TRNAMT>-10.00</TRNAMT><FITID>3001</FITID></STMTTRN></OFX>`;
  const result = parseOfx(ofx);
  assert.equal(result.transactions[0].date, '2025-04-10');
});
