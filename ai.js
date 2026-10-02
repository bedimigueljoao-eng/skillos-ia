const MAX_CONTEXT = 22000;
const agents = {
  architect: 'És Arquiteta de Competências. Cria uma sequência progressiva, equilibrando teoria, prática, avaliação e projeto.',
  planner: 'És Planeadora de Aprendizagem. Ajusta o percurso ao prazo e às horas semanais, sem criar uma agenda rígida.',
  tutor: 'És Tutora. Explica de acordo com o nível atual, usa exemplos e termina com uma pequena prática.',
  assessor: 'És Avaliadora. Cria desafios adequados ao nível, critérios claros e feedback acionável.',
  analyst: 'És Analista de Progresso. Usa apenas os dados existentes, identifica padrões e justifica recomendações.',
  coach: 'És Coach de Desenvolvimento. Identifica bloqueios e recomenda um próximo passo pequeno, concreto e livremente aceite.'
};
function extractText(data){if(data.output_text)return data.output_text;return (data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n')}
function parseProposal(text){const m=text.match(/<SKILLOS_JSON>([\s\S]*?)<\/SKILLOS_JSON>/);if(!m)return null;try{return JSON.parse(m[1])}catch{return null}}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'A IA ainda não foi configurada na Vercel.'});
  try{
    const {agent='tutor',skill={},question='',history=[]}=req.body||{};
    const role=agents[agent]||agents.tutor;
    const context=JSON.stringify({skill,history:history.slice(-12)}).slice(0,MAX_CONTEXT);
    const structured=agent==='architect'||agent==='planner'||agent==='assessor';
    const format=structured?`Além da explicação, inclui no fim uma proposta válida entre as etiquetas <SKILLOS_JSON> e </SKILLOS_JSON>. Usa exatamente este formato JSON: {"roadmap":["..."],"topics":["..."],"practices":["..."],"assessments":["..."]}. Inclui apenas campos aplicáveis, com no máximo 12 itens por campo.`:'';
    const instructions=`És o motor de IA do SKILLOS, sistema pessoal de desenvolvimento de competências. ${role} Responde em português claro, profundo e prático. Usa rigorosamente o contexto. Não inventes tempo, resultados, recursos, autores ou progresso. Distingue factos registados de recomendações. Faz perguntas quando faltarem dados essenciais. Recomenda, nunca obriga. Não alteres dados diretamente. ${format}`;
    const input=`CONTEXTO SKILLOS:\n${context}\n\nPEDIDO ATUAL:\n${question||'Analisa o contexto e recomenda o melhor próximo passo.'}`;
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5',instructions,input,max_output_tokens:2200})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:data.error?.message||'Falha ao contactar a IA.'});
    const text=extractText(data)||'A IA não devolveu conteúdo.';
    return res.status(200).json({text:text.replace(/<SKILLOS_JSON>[\s\S]*?<\/SKILLOS_JSON>/,'').trim(),proposal:parseProposal(text),responseId:data.id||null});
  }catch(e){return res.status(500).json({error:'Erro interno ao processar a IA.'})}
}
