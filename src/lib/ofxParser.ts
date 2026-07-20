export interface OfxTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'CREDIT' | 'DEBIT';
}

export interface OfxResult {
  transactions: OfxTransaction[];
  bankId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export function parseOfx(content: string): OfxResult {
  const result: OfxResult = { transactions: [] };

  let bankId = content.match(/<BANKID>(.*?)</);
  if (bankId) result.bankId = bankId[1].trim();

  let acctId = content.match(/<ACCTID>(.*?)</);
  if (acctId) result.accountId = acctId[1].trim();

  let dtStart = content.match(/<DTSTART>(.*?)</);
  if (dtStart) result.startDate = parseOfxDate(dtStart[1].trim());

  let dtEnd = content.match(/<DTEND>(.*?)</);
  if (dtEnd) result.endDate = parseOfxDate(dtEnd[1].trim());

  const stmts = content.split(/<STMTTRN>/g);
  for (const stmt of stmts) {
    if (!stmt.includes('<TRNTYPE>')) continue;

    const trnType = stmt.match(/<TRNTYPE>(.*?)</);
    const dtPosted = stmt.match(/<DTPOSTED>(.*?)</);
    const trnAmt = stmt.match(/<TRNAMT>(.*?)</);
    const fitId = stmt.match(/<FITID>(.*?)</);
    const memo = stmt.match(/<MEMO>(.*?)</) || stmt.match(/<NAME>(.*?)</);

    if (!dtPosted || !trnAmt) continue;

    const amount = parseFloat(trnAmt[1].trim());
    const type = amount >= 0 ? 'CREDIT' : 'DEBIT';

    result.transactions.push({
      id: fitId ? fitId[1].trim() : `ofx_${result.transactions.length}`,
      date: parseOfxDate(dtPosted[1].trim()),
      amount: Math.abs(amount),
      description: memo ? memo[1].trim() : 'Sem descrição',
      type,
    });
  }

  return result;
}

function parseOfxDate(ofxDate: string): string {
  const cleaned = ofxDate.replace(/[^0-9]/g, '');
  if (cleaned.length >= 8) {
    const y = cleaned.substring(0, 4);
    const m = cleaned.substring(4, 6);
    const d = cleaned.substring(6, 8);
    return `${y}-${m}-${d}`;
  }
  return ofxDate;
}
