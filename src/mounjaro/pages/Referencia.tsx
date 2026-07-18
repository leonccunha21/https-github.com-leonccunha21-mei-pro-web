import React from 'react';
import { Info, Syringe, AlertTriangle, CalendarClock } from 'lucide-react';
import { Card, Badge } from '../ui';
import { ESCALA_REFERENCIA } from '../lib';

export default function Referencia() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Referência Clínica</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Informações baseadas na bula oficial (Eli Lilly / Anvisa) e nos estudos SURMOUNT-1/2 e SURPASS 1-5.</p>
      </div>

      <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-start gap-2">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold">Aviso importante</p>
            <p>Este sistema é uma ferramenta de <b>organização e acompanhamento</b>, não substitui avaliação médica. A prescrição e o ajuste de doses são sempre decisão do médico assistente. Mounjaro® (tirzepatida) é medicamento controlado.</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Syringe size={18} className="text-violet-600" />
          <h3 className="font-semibold">Esquema de doses (escalonamento padrão)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 dark:text-slate-400 text-left">
              <tr>
                <th className="py-2 pr-2">Fase</th>
                <th className="py-2 pr-2">Dose</th>
                <th className="py-2 pr-2">Duração</th>
                <th className="py-2 pr-2">Observação</th>
              </tr>
            </thead>
            <tbody>
              {ESCALA_REFERENCIA.map((e, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="py-2 pr-2">{e.fase}</td>
                  <td className="py-2 pr-2 font-semibold">{e.dose}</td>
                  <td className="py-2 pr-2">{e.duracao}</td>
                  <td className="py-2 pr-2 text-slate-500">{e.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock size={18} className="text-cyan-600" />
            <h3 className="font-semibold">Frequência</h3>
          </div>
          <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
            <li>• Aplicação <b>subcutânea</b>, uma vez por semana.</li>
            <li>• Locais: abdômen, coxa ou parte posterior do braço (alternar a cada dose).</li>
            <li>• Neste sistema o intervalo é configurável entre <b>7 e 15 dias</b> conforme protocolo do paciente.</li>
            <li>• Dose esquecida: aplicar em até 4 dias; se passou desse prazo, pular e retomar o cronograma.</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-rose-600" />
            <h3 className="font-semibold">Efeitos comuns</h3>
          </div>
          <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
            <li>• Náusea, vômito e diarreia (mais frequentes no ajuste de dose).</li>
            <li>• Dor abdominal, constipação, gases, refluxo.</li>
            <li>• Redução de apetite, fadiga.</li>
            <li>• Reação no local da injeção.</li>
            <li>• <b>Hidratação:</b> aumentar ingestão de líquidos para evitar desidratação.</li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} className="text-emerald-600" />
          <h3 className="font-semibold">Resultados esperados (estudos)</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No estudo SURMOUNT-1 (72 semanas, dose máxima 15 mg), a perda média de peso foi de até <b>22,5%</b> do peso inicial
          (≈ 24 kg para quem pesava ~105 kg). O ritmo não é linear: nas primeiras ~20 semanas costuma ser de 0,5 a 1 kg/semana,
          desacelerando depois. A dose máxima recomendada é <b>15 mg/semana</b>.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="violet">5 mg → ~16% do peso</Badge>
          <Badge tone="violet">10 mg → ~21%</Badge>
          <Badge tone="violet">15 mg → ~22,5%</Badge>
        </div>
      </Card>
    </div>
  );
}
