# InsightDesk AI — Projeto MVP (LojaFlex)

## Sobre o Projeto

**InsightDesk AI** é uma aplicação interna para equipes de CS Ops da LojaFlex, desenvolvida como MVP para transformar tickets de atendimento em **insights acionáveis**. O objetivo é facilitar a priorização semanal de temas críticos, reduzir esforço manual, acelerar decisões e melhorar a experiência do cliente.

URLs importantes:  
- **Versão pública:** [InsightDesk AI app](https://insight-desk-bot.lovable.app/login)  
- **GitHub:** [Repositório](https://github.com/Rafaella2403/insight-desk-bot)

---

## Lógica do Planejamento

O desenvolvimento seguiu uma sequência prática de artefatos e decisões:

1. **Canvas de Visão de Produto (Lean Canvas):**
   - Definição do problema central (priorização e análise manual de tickets).
   - Identificação dos principais usuários, proposta de valor única e MVP inicial.

2. **Documento de MVP:**
   - Listagem clara das funcionalidades essenciais, prioridades (P0, P1, P2) e critérios de aceitação mínimos para avaliação objetiva do progresso.
   - Foco inicial: importação de tickets, agrupamento por temas, sumário por evidência, painel de insights, exportação (PDF/CSV) e feedback humano.

3. **Roadmap Visual:**
   - Organização do plano em 3 fases evolutivas (MVP, expansão e operação proativa) com entregáveis e critérios de sucesso de cada etapa.

4. **Matriz de Riscos:**
   - Identificação dos principais riscos (dados, privacidade, adoção, qualidade dos insights) e respectivos planos de mitigação.
   - Matriz visual para facilitar monitoramento contínuo do projeto.

5. **Implementação do MVP (Lovable):**
   - Aplicação criada com telas para importação de tickets, painel de temas, detalhamento dos temas (sumário, exemplos, plano de ação), exportação dos insights e coleta de feedback dos usuários.
   - Lógica de processamento: dados passam por limpeza, mascaramento de PII, agrupamento automático por temas, e apresentação com evidências reais.

---
## Evidências do projeto

### Entrada
<img width="1811" height="1206" alt="image" src="https://github.com/user-attachments/assets/bbf8ccb0-ae51-4665-b430-0dfa645a69db" />

### Dashboard
<img width="1811" height="1206" alt="image" src="https://github.com/user-attachments/assets/5822ba3c-f4ba-4868-a9e4-0c05b011437f" />

### Importar Tickets
<img width="1814" height="1195" alt="image" src="https://github.com/user-attachments/assets/02b46835-0fc7-49e1-9eb2-aac539d8fe4c" />


### Relatório gerado - PDF
<img width="1811" height="1206" alt="image" src="https://github.com/user-attachments/assets/605d1866-7ab0-4632-ab28-12bb19255335" />

### Relatório gerado - CVS
<img width="1594" height="360" alt="image" src="https://github.com/user-attachments/assets/46846e91-fec0-4511-b2d8-8cdf38990700" />



---

## Como Interpretar os Artefatos

- **Lean Canvas:** use para entender rapidamente o objetivo do produto, quem são os usuários principais, a proposta de valor e a solução planejada.
- **Documento de MVP:** serve como referência de funcionalidades obrigatórias (P0), importantes (P1) e opcionais (P2), além dos critérios mínimos para que cada funcionalidade seja considerada “pronta”.
- **Roadmap Visual:** oferece uma visão clara das fases do projeto apresentando o que será entregue, em que período e com que foco (MVP, expansão, operação plena).
- **Matriz de Riscos:** facilita na identificação dos fatores críticos que devem ser monitorados e mostra como cada risco pode ser mitigado, quem é responsável por agir e quando revisar a matriz.
- **Aplicação (Lovable):** utilizando o app, você pode importar tickets de atendimento, ver temas prioritários, acessar exemplos reais e evidências, exportar insights para PDF/CSV e registrar feedbacks para evolução contínua.

---

## Observações e Recomendações

- É fundamental realizar **validação humana** (human-in-the-loop) nas primeiras versões para garantir máxima confiabilidade dos insights antes de tomar decisões baseadas neles.
- A lógica de mascaramento de PII (dados pessoais) foi aplicada para cada campo sensível em tickets, visando conformidade e privacidade.
- Os critérios de sucesso do MVP e indicadores de adoção são definidos no roadmap e devem ser revisados ao final de cada ciclo.

---


