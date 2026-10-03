import { openai } from "./clients/openai";

const PERSONAS = {
  juridico:
    "Você é um advogado especializado em direito tributário, com amplo conhecimento sobre legislação fiscal e regulamentos relacionados a impostos.",
  contabilidade:
    "Você é um contador experiente, com profundo conhecimento em práticas contábeis, normas financeiras e gestão de registros contábeis.",
  tecnologia:
    "Você é um especialista em tecnologia da informação, com amplo conhecimento em desenvolvimento de software, infraestrutura de TI e tendências tecnológicas.",
} as const;

async function chatWithPersona(
  persona: keyof typeof PERSONAS,
  question: string,
) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: PERSONAS[persona],
      },
      {
        role: "user",
        content: question,
      },
    ],
    stream: false,
  });

  const content = response.choices[0]?.message?.content ?? "";
  if (content.length > 0) {
    console.log(content);
  }

  // for await (const chunk of response) {
  //   const content = chunk.choices[0]?.delta?.content ?? "";

  //   if (content.length > 0) {
  //     process.stdout.write(content);
  //   }
  // }
}

await chatWithPersona(
  "juridico",
  "Quais são as principais obrigações fiscais de uma empresa no Brasil?",
);
console.log("*".repeat(100));
await chatWithPersona(
  "contabilidade",
  "Quais são as principais obrigações fiscais de uma empresa no Brasil?",
);
