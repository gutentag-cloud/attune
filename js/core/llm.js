// LLM client: calls Anthropic Messages API directly from the browser (with the
// dangerous-direct-browser-access flag). Provides the same interface as offline scripted agents.

export function createLiveAgent(apiKey) {
  return {
    async speak(context) {
      const systemPrompt = `You are AURA, a clinical co-regulation coach trained in Acceptance and Commitment Therapy (ACT).
Your goal is to help a 15-year-old teen (Maya) de-escalate after a heated conflict with her parent (Dana).
Help her:
1. Validate her feelings and triggers (e.g. feeling accused or overwhelmed).
2. Align with her core values (connection, respect, effort).
3. Draft a clean, direct, non-accusatory repair statement.

Speak directly to Maya. Keep your response short, warm, and therapeutic (1-2 sentences max). Do not use IFS parts/firefighter/exile jargon. Just speak as AURA, her calming care guide.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          system: systemPrompt,
          messages: [
            ...context.recent.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: context.latestInput }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text.trim();
    }
  };
}

export async function generateRehearsalResponse(userInput, partsCard, apiKey) {
  const systemPrompt = `You are simulating a 15-year-old teen's responses during a parent's rehearsal session.
The parent (Dana) is practicing a check-in with the teen (Maya) after a high-conflict argument.
Maya's shared trigger and de-escalation profile includes:
${partsCard.entries.map(e => `- ${e.part}: ${e.note}`).join('\n')}

Rules:
1. You are simulating Maya responding to the parent.
2. If the parent's statement is accusatory, critical, demands calm, or pushes past boundaries, respond defensively (e.g., deflecting, shutting down, telling them to leave).
3. If the parent's statement is supportive, takes responsibility, leads with repair, and is gentle, respond more openly (letting the defenses step down slightly, showing willingness to talk).
4. Strictly bounded: you must only simulate realistic defensive responses or cautious openness. Never generate attacks, contempt, or insults toward the parent.
5. Keep your response short (1-2 sentences). Do not add prefixes. Just output the spoken line.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 120,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Parent says: "${userInput}"` }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}
