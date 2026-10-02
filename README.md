# SKILLOS IA v2

PWA pessoal para desenvolvimento de competências, com IA online contextual.

## IA v2
- Arquiteta, Planeadora, Tutora, Avaliadora, Analista e Coach.
- Memória separada por competência, guardada no dispositivo.
- Roadmaps e propostas estruturadas.
- A proposta só entra na competência após o utilizador clicar em **Aplicar proposta**.
- A chave nunca vai para o frontend.

## Publicar na Vercel
1. Carregue a pasta `skillos` num repositório GitHub.
2. Importe o repositório na Vercel.
3. Em Settings > Environment Variables, adicione `OPENAI_API_KEY`.
4. Opcionalmente defina `OPENAI_MODEL`. O padrão é `gpt-5`.
5. Faça Redeploy.

As funções básicas operam offline. A IA requer internet e o deploy na Vercel.
