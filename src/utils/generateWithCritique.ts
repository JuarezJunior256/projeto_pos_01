import { openai } from "../clients/openai";
import { withRetry } from "./withRetry";

export async function generateWithCritique(
  system: string,
  prompt: string,
): Promise<string> {
  //step 1: generate initial response
  const draft = await withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    });

    return response.choices[0]?.message?.content ?? "";
  });

  //step 2: generate initial critique
  const critique = await withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Identifique problemas, inconsistências ou melhorias que podem ser feitas na resposta do usuário. Seja crítico e detalhado, se estiver boa, diga approved, se estiver ruim, diga rejected.",
        },
        {
          role: "user",
          content: draft,
        },
      ],
      stream: false,
    });

    return response.choices[0]?.message?.content ?? "";
  });

  if (critique.toLowerCase() === "approved") {
    return draft;
  }

  return await withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Retorne uma versão melhorada da resposta do usuário, levando em consideração a crítica recebida.",
        },
        {
          role: "user",
          content: `Resposta do usuário: ${draft}\nCrítica recebida: ${critique}`,
        },
      ],
      stream: false,
    });

    return response.choices[0]?.message?.content ?? "";
  });
}
