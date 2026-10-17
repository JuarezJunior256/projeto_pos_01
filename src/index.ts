import { openai } from "./clients/openai";
import { generateWithCritique } from "./utils/generateWithCritique";
import { withRetry } from "./utils/withRetry";

const PERSONAS = {
  juridico:
    "Você é um advogado especializado em direito tributário, com amplo conhecimento sobre legislação fiscal e regulamentos relacionados a impostos.",
  contabilidade:
    "Você é um contador experiente, com profundo conhecimento em práticas contábeis, normas financeiras e gestão de registros contábeis.",
  tecnologia:
    "Você é um especialista em tecnologia da informação, com amplo conhecimento em desenvolvimento de software, infraestrutura de TI e tendências tecnológicas.",
} as const;

const contract = `
  clausula 1: O presente contrato estabelece as condições para a prestação de serviços de consultoria tributária e contábil, incluindo a análise de obrigações fiscais e a elaboração de relatórios financeiros.
  clausula 2: As partes concordam em manter a confidencialidade de todas as informações compartilhadas durante a vigência deste contrato, incluindo dados financeiros e estratégias empresariais.
  `;

function contractAnalysisPrompt(params: {
  contractText: string;
  clientType: "pf" | "pj";
  levelOfDetail: "high" | "medium" | "low";
}): string {
  return `Voce recebera um contrato se o cliente é ${params.clientType === "pf" ? "pessoa física" : "pessoa jurídica"} e o nível de detalhamento solicitado é ${params.levelOfDetail}. Analise o seguinte contrato e identifique possíveis riscos legais ou cláusulas que possam ser problemáticas: ${params.contractText}`;
}

async function chatWithPersona(
  persona: keyof typeof PERSONAS,
  question: string,
) {
  await withRetry(async () => {
    const systemPrompt = PERSONAS[persona];
    const response = await generateWithCritique(systemPrompt, question);
    console.log(
      `\n\nResposta do ChatGPT com persona ${persona.toLocaleUpperCase()}:\n\n${response}`,
    );

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     {
    //       role: "system",
    //       content: PERSONAS[persona],
    //     },
    //     {
    //       role: "user",
    //       content: question,
    //     },
    //   ],
    //   stream: false,
    // });

    // const content = response.choices[0]?.message?.content ?? "";
    // if (content.length > 0) {
    //   console.log(content);
    // }
    // TRECHO PARA TESTE DE STREAMING DE RESPOSTA DO CHATGPT
    // for await (const chunk of response) {
    //   const content = chunk.choices[0]?.delta?.content ?? "";

    //   if (content.length > 0) {
    //     process.stdout.write(content);
    //   }
    // }
  });
}

// await chatWithPersona(
//   "juridico",
//   "Analise o seguinte contrato e identifique possíveis riscos legais ou cláusulas que possam ser problemáticas: " +
//     contract,
// );
await chatWithPersona(
  "juridico",
  contractAnalysisPrompt({
    contractText: contract,
    clientType: "pj",
    levelOfDetail: "high",
  }),
);
