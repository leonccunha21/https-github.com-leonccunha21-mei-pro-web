// Tipos do subsite Mounjaro (controle de tratamento com tirzepatida).
// Dados clínicos baseados na bula oficial (Eli Lilly / Anvisa) e estudos
// SURMOUNT-1/2 e SURPASS 1-5.

export type DoseLevel = 2.5 | 5 | 7.5 | 10 | 12.5 | 15;

export type SexoCliente = 'M' | 'F' | 'O';

export interface ClienteMounjaro {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  dataNascimento?: string; // YYYY-MM-DD
  sexo?: SexoCliente;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cpf?: string;
  // Dados clínicos
  alturaCm?: number; // altura em cm
  pesoInicial?: number; // peso no início do tratamento (kg)
  imcInicial?: number; // calculado
  comorbidades?: string; // texto livre (diabetes, hipertensão, etc.)
  objetivoPeso?: number; // peso alvo (kg)
  medicoResponsavel?: string;
  observacoes?: string;
  dataInicioTratamento?: string; // YYYY-MM-DD
  ativo: boolean; // cliente em tratamento ativo
  createdAt: string;
  updatedAt?: string;
}

export interface PesagemMounjaro {
  id: string;
  clienteId: string;
  data: string; // YYYY-MM-DD
  peso: number; // kg
  observacoes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DoseMounjaro {
  id: string;
  clienteId: string;
  dataAplicacao: string; // YYYY-MM-DD
  dose: DoseLevel;
  intervaloDias: number; // 7 a 15 dias (conforme protocolo do cliente)
  localAplicacao?: 'abdomen' | 'coxa' | 'braco' | 'outro';
  lote?: string;
  observacoes?: string;
  efeitosColaterais?: string; // náusea, vômito, etc.
  pesoAplicacao?: number; // peso registrado no dia da dose (kg)
  pago: boolean; // esta dose foi paga?
  valorDose?: number; // valor cobrado pela dose
  createdAt: string;
  updatedAt?: string;
}

export type StatusPagamento = 'pago' | 'pendente' | 'atrasado' | 'cancelado';

export interface PagamentoMounjaro {
  id: string;
  clienteId: string;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento?: string; // YYYY-MM-DD
  descricao: string;
  valor: number;
  status: StatusPagamento;
  metodo?: 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'transferencia';
  referenciaDoseId?: string; // dose vinculada
  observacoes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Score de pagamento do cliente (0-100), derivado do histórico.
export interface ScorePagamento {
  clienteId: string;
  pontuacao: number; // 0-100
  classificacao: 'excelente' | 'bom' | 'regular' | 'ruim';
  totalPagamentos: number;
  pagamentosEmDia: number;
  pagamentosAtrasados: number;
  pagamentosPendentes: number;
  valorTotalPago: number;
  valorEmAberto: number;
  atrasoMedioDias: number;
}

export interface MounjaroDb {
  clientes: ClienteMounjaro[];
  pesagens: PesagemMounjaro[];
  doses: DoseMounjaro[];
  pagamentos: PagamentoMounjaro[];
  fotos: FotoEvolucao[];
  auditoria: RegistroAuditoria[];
  config: ConfigMounjaro;
  initialized?: boolean;
}

export interface FotoEvolucao {
  id: string;
  clienteId: string;
  data: string; // YYYY-MM-DD
  legenda?: string;
  // Imagem compactada em base64 (data URL). Armazenada junto no sync da nuvem.
  imagem: string;
  createdAt: string;
  updatedAt?: string;
}

// Registro de auditoria: histórico de alterações críticas (doses, pagamentos, clientes).
export interface RegistroAuditoria {
  id: string;
  data: string; // ISO completo — data/hora do evento
  createdAt: string; // ISO — momento em que o registo foi gravado na BD
  usuario: string; // e-mail/nome do usuário logado (ou "local")
  entidade: 'cliente' | 'dose' | 'pagamento' | 'pesagem' | 'foto';
  acao: 'criar' | 'editar' | 'excluir';
  resumo: string; // texto legível (ex.: "Dose 5 mg de Maria")
  clienteId?: string;
  refId?: string; // id do registro afetado
}

// Configurações do profissional/clínica (aplicadas a relatórios e mensagens).
export interface ConfigMounjaro {
  nomeClinica: string;
  profissional: string; // nome do profissional responsável
  telefoneContato?: string;
  valorDosePadrao: number; // valor sugerido por dose (R$)
  intervaloPadraoDias: number; // intervalo padrão entre doses
  logo?: string; // imagem em base64 (data URL), opcional
}
