import { ClienteMounjaro, DoseMounjaro, PagamentoMounjaro, PesagemMounjaro, ScorePagamento, DoseLevel } from './types';

export function calcIMC(pesoKg: number, alturaCm: number): number {
  if (!pesoKg || !alturaCm) return 0;
  const h = alturaCm / 100;
  const imc = pesoKg / (h * h);
  return Math.round(imc * 10) / 10;
}

export function classificacaoIMC(imc: number): string {
  if (imc <= 0) return '-';
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Eutrófico';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
}

export function diasEntre(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

// Próxima data de aplicação com base na última dose e seu intervalo.
export function proximaDose(dose: DoseMounjaro | undefined): string | null {
  if (!dose) return null;
  const base = new Date(dose.dataAplicacao + 'T00:00:00');
  base.setDate(base.getDate() + dose.intervaloDias);
  return base.toISOString().slice(0, 10);
}

// Status da dose em relação a hoje: em dia, vence hoje, atrasada.
export function statusDose(dataAplicacao: string, intervaloDias: number): {
  status: 'ok' | 'hoje' | 'atrasada';
  diasRestantes: number;
} {
  const prox = new Date(dataAplicacao + 'T00:00:00');
  prox.setDate(prox.getDate() + intervaloDias);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diff = Math.round((prox.getTime() - hoje.getTime()) / 86400000);
  if (diff < 0) return { status: 'atrasada', diasRestantes: diff };
  if (diff === 0) return { status: 'hoje', diasRestantes: 0 };
  return { status: 'ok', diasRestantes: diff };
}

// Última pesagem de um cliente (ou peso inicial).
export function pesoAtual(cliente: ClienteMounjaro, pesagens: PesagemMounjaro[]): number {
  const lista = pesagens
    .filter(p => p.clienteId === cliente.id)
    .sort((a, b) => b.data.localeCompare(a.data));
  if (lista.length > 0) return lista[0].peso;
  return cliente.pesoInicial ?? 0;
}

// Peso registrado antes da primeira dose (linha de base).
export function pesoBase(cliente: ClienteMounjaro, pesagens: PesagemMounjaro[], doses: DoseMounjaro[]): number {
  const primeiraDose = doses
    .filter(d => d.clienteId === cliente.id)
    .sort((a, b) => a.dataAplicacao.localeCompare(b.dataAplicacao))[0];
  if (primeiraDose?.pesoAplicacao) return primeiraDose.pesoAplicacao;
  // pesagem mais antiga
  const lista = pesagens
    .filter(p => p.clienteId === cliente.id)
    .sort((a, b) => a.data.localeCompare(b.data));
  if (lista.length > 0) return lista[0].peso;
  return cliente.pesoInicial ?? 0;
}

// Peso perdido desde o início do tratamento.
export function pesoPerdido(cliente: ClienteMounjaro, pesagens: PesagemMounjaro[], doses: DoseMounjaro[]): number {
  const base = pesoBase(cliente, pesagens, doses);
  const atual = pesoAtual(cliente, pesagens);
  if (!base || !atual) return 0;
  return Math.round((base - atual) * 10) / 10;
}

// Perda de peso média por dose (kg/dose).
export function perdaMediaPorDose(cliente: ClienteMounjaro, pesagens: PesagemMounjaro[], doses: DoseMounjaro[]): number {
  const totalPerdido = pesoPerdido(cliente, pesagens, doses);
  if (totalPerdido <= 0) return 0;
  const qtdDoses = doses.filter(d => d.clienteId === cliente.id).length;
  if (qtdDoses === 0) return 0;
  return Math.round((totalPerdido / qtdDoses) * 10) / 10;
}

// Quantidade de doses aplicadas e total de doses previstas (estimado).
export function contagemDoses(clienteId: string, doses: DoseMounjaro[]): number {
  return doses.filter(d => d.clienteId === clienteId).length;
}

// Calcula o score de pagamento (0-100) de um cliente.
export function calcularScore(
  clienteId: string,
  pagamentos: PagamentoMounjaro[],
  hoje: string = new Date().toISOString().slice(0, 10)
): ScorePagamento {
  const lista = pagamentos.filter(p => p.clienteId === clienteId);
  const total = lista.length;
  let emDia = 0, atrasados = 0, pendentes = 0, cancelados = 0;
  let valorPago = 0, valorAberto = 0;
  let somaAtraso = 0, nAtraso = 0;

  for (const p of lista) {
    if (p.status === 'cancelado') { cancelados++; continue; }
    if (p.status === 'pago') {
      emDia++;
      valorPago += p.valor;
      if (p.dataPagamento && p.dataVencimento) {
        const diff = diasEntre(p.dataVencimento, p.dataPagamento);
        if (diff > 0) { somaAtraso += diff; nAtraso++; }
      }
    } else if (p.status === 'atrasado') {
      atrasados++;
      valorAberto += p.valor;
      const diff = diasEntre(p.dataVencimento, hoje);
      somaAtraso += Math.max(0, diff);
      nAtraso++;
    } else if (p.status === 'pendente') {
      pendentes++;
      if (p.dataVencimento < hoje) {
        // pendente vencido conta como atraso parcial
        const diff = diasEntre(p.dataVencimento, hoje);
        somaAtraso += Math.max(0, diff);
        nAtraso++;
        atrasados++;
      } else {
        valorAberto += p.valor;
      }
    }
  }

  const efetivos = total - cancelados;
  let pontuacao = 100;
  if (efetivos > 0) {
    const taxaAtraso = atrasados / efetivos;
    // Penaliza até 60 pts pela taxa de atraso
    pontuacao -= Math.round(taxaAtraso * 60);
    // Penaliza pela média de dias de atraso (até 30 pts)
    const atrasoMedio = nAtraso > 0 ? somaAtraso / nAtraso : 0;
    pontuacao -= Math.min(30, Math.round(atrasoMedio * 2));
    // Pequeno bônus por pontualidade total
    if (atrasados === 0 && efetivos >= 3) pontuacao = Math.min(100, pontuacao + 5);
    pontuacao = Math.max(0, Math.min(100, pontuacao));
  }

  let classificacao: ScorePagamento['classificacao'] = 'ruim';
  if (pontuacao >= 85) classificacao = 'excelente';
  else if (pontuacao >= 65) classificacao = 'bom';
  else if (pontuacao >= 40) classificacao = 'regular';

  return {
    clienteId,
    pontuacao,
    classificacao,
    totalPagamentos: total,
    pagamentosEmDia: emDia,
    pagamentosAtrasados: atrasados,
    pagamentosPendentes: pendentes,
    valorTotalPago: Math.round(valorPago * 100) / 100,
    valorEmAberto: Math.round(valorAberto * 100) / 100,
    atrasoMedioDias: nAtraso > 0 ? Math.round((somaAtraso / nAtraso) * 10) / 10 : 0,
  };
}

// Faixas de dose padrão (bula): inicia 2,5mg, escalona de 2,5 em 2,5.
export const DOSES_DISPONIVEIS: DoseLevel[] = [2.5, 5, 7.5, 10, 12.5, 15];

export function formatarMoeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarDataCurta(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Esquema de referência oficial (bula) para exibir ao usuário.
export const ESCALA_REFERENCIA = [
  { fase: 'Inicial', dose: '2,5 mg', duracao: '4 semanas', obs: 'Adaptação (não é dose terapêutica)' },
  { fase: 'Passo 1', dose: '5 mg', duracao: '4 semanas', obs: 'Dose terapêutica inicial' },
  { fase: 'Ajuste', dose: '7,5 mg', duracao: 'conforme tolerância', obs: 'Aumento de 2,5 mg se necessário' },
  { fase: 'Ajuste', dose: '10 mg', duracao: 'manutenção', obs: 'Dose de manutenção' },
  { fase: 'Ajuste', dose: '12,5 mg', duracao: 'conforme tolerância', obs: 'Aumento de 2,5 mg se necessário' },
  { fase: 'Máxima', dose: '15 mg', duracao: 'manutenção', obs: 'Dose máxima recomendada' },
];
