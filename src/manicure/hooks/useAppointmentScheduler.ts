import { useEffect, useRef } from 'react';
import { AgendamentoManicure, MensagemTemplate, MensagemEnviada, ManicureWhatsAppInstance, ConfigManicure } from '../types';
import { newId } from '../localDb';
import { sendNotification } from '../../lib/notifications';

const LOCK_KEY = 'manicure_scheduler_leader';
const LOCK_TTL = 30000;
const LEADER_CHECK_INTERVAL = 10000;

function acquireLeaderLock(): boolean {
  const now = Date.now();
  const raw = localStorage.getItem(LOCK_KEY);
  if (raw) {
    try {
      const { expires } = JSON.parse(raw);
      if (now < expires) return false;
    } catch {}
  }
  localStorage.setItem(LOCK_KEY, JSON.stringify({ leader: true, expires: now + LOCK_TTL }));
  const verify = localStorage.getItem(LOCK_KEY);
  if (!verify) return false;
  try {
    const parsed = JSON.parse(verify);
    return parsed.leader === true && now < parsed.expires;
  } catch { return false; }
}

function refreshLeaderLock() {
  const now = Date.now();
  localStorage.setItem(LOCK_KEY, JSON.stringify({ leader: true, expires: now + LOCK_TTL }));
}

function releaseLeaderLock() {
  localStorage.removeItem(LOCK_KEY);
}

interface SchedulerProps {
  agendamentos: AgendamentoManicure[];
  templates: MensagemTemplate[];
  mensagensEnviadas: MensagemEnviada[];
  config: ConfigManicure;
  instances: ManicureWhatsAppInstance[];
  onAddMensagem: (m: MensagemEnviada) => void;
}

function preencherTemplate(template: string, vars: Record<string, string>): string {
  let msg = template;
  for (const [key, value] of Object.entries(vars)) {
    msg = msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return msg;
}

function formatarDataBR(dataStr: string): string {
  const d = new Date(dataStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function useAppointmentScheduler({
  agendamentos, templates, mensagensEnviadas, config, instances, onAddMensagem,
}: SchedulerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLeader = useRef(false);
  const leaderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const instanceConectada = instances.find((i) => i.status === 'CONNECTED');
    if (!instanceConectada) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (leaderIntervalRef.current) { clearInterval(leaderIntervalRef.current); leaderIntervalRef.current = null; }
      if (isLeader.current) { releaseLeaderLock(); isLeader.current = false; }
      return;
    }

    const acquireLeadership = () => {
      if (acquireLeaderLock()) {
        isLeader.current = true;
        if (leaderIntervalRef.current) clearInterval(leaderIntervalRef.current);
        leaderIntervalRef.current = setInterval(refreshLeaderLock, LEADER_CHECK_INTERVAL);
        return true;
      }
      return false;
    };

    if (!acquireLeadership()) {
      if (!leaderIntervalRef.current) {
        leaderIntervalRef.current = setInterval(() => {
          if (!isLeader.current) acquireLeadership();
        }, LEADER_CHECK_INTERVAL);
      }
    }

    const check = async () => {
      if (!isLeader.current) return;
      refreshLeaderLock();
      const agora = new Date();

      const enviadosSet = new Set(
        mensagensEnviadas
          .filter((m) => m.tipo === 'lembrete_1dia' || m.tipo === 'lembrete_1hora')
          .map((m) => `${m.agendamentoId}_${m.tipo}`)
      );

      for (const ag of agendamentos) {
        if (ag.status === 'cancelado' || ag.status === 'concluido') continue;
        if (!ag.telefoneCliente) continue;

        const dataHora = new Date(`${ag.data}T${ag.hora.slice(0, 5)}:00`);
        const diffMs = dataHora.getTime() - agora.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);

        if (diffHoras >= 23 && diffHoras <= 25) {
          const key = `${ag.id}_lembrete_1dia`;
          if (!enviadosSet.has(key)) {
            const tmpl = templates.find((t) => t.tipo === 'lembrete_1dia' && t.ativo);
            if (tmpl) {
              const msg = preencherTemplate(tmpl.mensagem, {
                nome: ag.clienteNome.split(' ')[0],
                salao: config.nomeSalao,
                data: formatarDataBR(ag.data),
                hora: ag.hora.slice(0, 5),
              });
              const ok = await enviarMensagem(instanceConectada.id, ag.telefoneCliente, msg);
              if (ok) sendNotification('Lembrete 1 dia enviado', `${ag.clienteNome.split(' ')[0]} — ${ag.data} ${ag.hora.slice(0, 5)}`);
              onAddMensagem({
                id: newId('msg'), agendamentoId: ag.id, clienteId: ag.clienteId,
                clienteNome: ag.clienteNome, tipo: 'lembrete_1dia', mensagem: msg,
                status: ok ? 'enviado' : 'falha', dataEnvio: new Date().toISOString(),
              });
            }
          }
        }

        if (diffHoras >= 0.8 && diffHoras <= 1.2) {
          const key = `${ag.id}_lembrete_1hora`;
          if (!enviadosSet.has(key)) {
            const tmpl = templates.find((t) => t.tipo === 'lembrete_1hora' && t.ativo);
            if (tmpl) {
              const msg = preencherTemplate(tmpl.mensagem, {
                nome: ag.clienteNome.split(' ')[0],
                salao: config.nomeSalao,
                data: formatarDataBR(ag.data),
                hora: ag.hora.slice(0, 5),
              });
              const ok = await enviarMensagem(instanceConectada.id, ag.telefoneCliente, msg);
              if (ok) sendNotification('Lembrete 1h enviado', `${ag.clienteNome.split(' ')[0]} — ${ag.data} ${ag.hora.slice(0, 5)}`);
              onAddMensagem({
                id: newId('msg'), agendamentoId: ag.id, clienteId: ag.clienteId,
                clienteNome: ag.clienteNome, tipo: 'lembrete_1hora', mensagem: msg,
                status: ok ? 'enviado' : 'falha', dataEnvio: new Date().toISOString(),
              });
            }
          }
        }
      }
    };

    check();
    intervalRef.current = setInterval(check, 60000);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (leaderIntervalRef.current) { clearInterval(leaderIntervalRef.current); leaderIntervalRef.current = null; }
      if (isLeader.current) { releaseLeaderLock(); isLeader.current = false; }
    };
  }, [agendamentos, templates, mensagensEnviadas, config, instances, onAddMensagem]);
}

async function enviarMensagem(instanceId: string, telefone: string, texto: string): Promise<boolean> {
  const numero = telefone.replace(/\D/g, '');
  try {
    const mod = await import('../../lib/vps');
    await mod.whatsapp.send(instanceId, `55${numero}`, texto);
    return true;
  } catch (e) {
    console.warn('Falha ao enviar WhatsApp (VPS offline?):', e);
    return false;
  }
}
