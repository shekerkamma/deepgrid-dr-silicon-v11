import { validateAnswer, type EvidencePacket, type ComposedAnswer } from './answer-evidence';
import type { IndexChunk } from './graph-retrieval';
export const ANSWER_ENDPOINT = 'https://deepgrid-rerank.shekerkamma.workers.dev/answer';
export type AnswerResult = { answer: ComposedAnswer; sources: IndexChunk[]; model: string };
export async function composeAnswer(packet: EvidencePacket, signal: AbortSignal): Promise<AnswerResult> {
  const response = await fetch(ANSWER_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.any([signal, AbortSignal.timeout(125000)]),
    body: JSON.stringify({question: packet.question, sourceIds: packet.sources.map(s => s.id)}),
  });
  const value = await response.json() as {error?:string; sources:IndexChunk[]; model:string; answer:unknown};
  if (!response.ok) throw new Error(value.error || 'The answer service is unavailable. Please retry.');
  if (!Array.isArray(value.sources) || typeof value.model !== 'string') throw new Error('The answer response is incomplete.');
  return {answer: validateAnswer(value.answer, {...packet, sources:value.sources}), sources:value.sources, model:value.model};
}
