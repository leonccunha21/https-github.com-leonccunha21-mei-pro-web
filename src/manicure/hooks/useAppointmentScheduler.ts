import { useEffect, useRef } from 'react';
import { AgendamentoManicure, MensagemTemplate, MensagemEnviada, ManicureWhatsAppInstance, ConfigManicure } from '../types';
import { newId } from '../localDb';

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

  useEffect(() => {
    const instanceConectada = instances.find((i) => i.status === 'CONNECTED');
    // BUG-FIX: sem instanceConectada o effect retornava undefined (sem cleanup),
    // o que fazia intervalRef ficar ativo de uma chamada anterior se instances
    // mudasse de conectado → desconectado. Agora limpa o interval em todos os casos.
    if (!instanceConectada) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    const check = async () => {
      const agora = new Date();

      const enviadosSet = new Set(
        mensagensEnviadas
          .filter((m) => m.tipo === 'lembrete_1dia' || m.tipo === 'lembrete_1hora')
          .map((m) => `${m.agendamentoId}_${m.tipo}`)
      );

      for (const ag of agendamentos) {
        if (ag.status === 'cancelado' || ag.status === 'concluido') continue;
        if (!ag.telefoneCliente) continue;

        // BUG-FIX: ag.hora pode ter segundos ("14:30:00") — slice(0,5) garante HH:mm.
        const dataHora = new Date(`${ag.data}T${ag.hora.slice(0, 5)}:00`);
        const diffMs = dataHora.getTime() - agora.getTime();
        const diffHoras = diffMs / (1000 * 60 * 60);

        // 1 dia antes (entre 23h e 25h de antecedência)
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
              onAddMensagem({
                id: newId('msg'), agendamentoId: ag.id, clienteId: ag.clienteId,
                clienteNome: ag.clienteNome, tipo: 'lembrete_1dia', mensagem: msg,
                status: ok ? 'enviado' : 'erro', dataEnvio: new Date().toISOString(),
              });
            }
          }
        }

        // 1 hora antes (entre 50min e 70min)
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
              onAddMensagem({
                id: newId('msg'), agendamentoId: ag.id, clienteId: ag.clienteId,
                clienteNome: ag.clienteNome, tipo: 'lembrete_1hora', mensagem: msg,
                status: ok ? 'enviado' : 'erro', dataEnvio: new Date().toISOString(),
              });
            }
          }
        }
      }
    };

    check();
    intervalRef.current = setInterval(check, 60000); // checa a cada 1 minuto

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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
