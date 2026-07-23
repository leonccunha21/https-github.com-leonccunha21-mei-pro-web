export type StatusAgendamento = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface ClienteManicure {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  indicadoPor?: string;
  dataNascimento?: string; // yyyy-mm-dd
  createdAt: string;
  updatedAt?: string;
}

export interface ServicoManicure {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracaoMinutos: number;
  categoria?: 'unhas' | 'podologia' | 'estetica' | 'maquiagem' | 'outro';
  ativo: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AgendamentoManicure {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  hora: string;
  servicoId: string;
  servicoNome: string;
  valor: number;
  status: StatusAgendamento;
  observacoes?: string;
  telefoneCliente?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MovimentoCaixa {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  categoria: 'servico' | 'produto' | 'despesa' | 'outro';
  formaPagamento?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia';
  clienteId?: string;
  agendamentoId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProdutoEstoque {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  unidade: 'un' | 'ml' | 'g' | 'par' | 'kit';
  precoCusto: number;
  precoVenda: number;
  fornecedor?: string;
  estoqueMinimo: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ManicureWhatsAppInstance {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  qrCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MensagemTemplate {
  id: string;
  nome: string;
  tipo: 'lembrete_1dia' | 'lembrete_1hora' | 'confirmacao' | 'personalizado';
  mensagem: string;
  ativo: boolean;
  updatedAt?: string;
}

export interface MensagemEnviada {
  id: string;
  agendamentoId: string;
  clienteId: string;
  clienteNome: string;
  tipo: 'lembrete_1dia' | 'lembrete_1hora' | 'manual' | 'confirmacao';
  mensagem: string;
  status: 'enviado' | 'falha';
  dataEnvio: string;
  erro?: string;
  updatedAt?: string;
}

export interface ConfigManicure {
  nomeSalao: string;
  profissional: string;
  telefoneContato?: string;
  endereco?: string;
  logo?: string;
  whatsAppInstanceId?: string;
}

export interface ManicureDb {
  clientes: ClienteManicure[];
  servicos: ServicoManicure[];
  agendamentos: AgendamentoManicure[];
  movimentos: MovimentoCaixa[];
  produtos: ProdutoEstoque[];
  whatsappInstances: ManicureWhatsAppInstance[];
  mensagemTemplates: MensagemTemplate[];
  mensagensEnviadas: MensagemEnviada[];
  config: ConfigManicure;
  initialized?: boolean;
}
