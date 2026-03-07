import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchableTask {
  id: string
  title: string
  listName: string
}

interface AiTaskSuggestion {
  taskId: string
  suggestedDate: string
  reason: string
}

interface RequestBody {
  context: string
  tasks: SearchableTask[]
}

function getLocalDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildSystemPrompt(today: string): string {
  return `You are a task planning assistant. Today's date is ${today}.

Rules:
- Suggest tasks from the provided list that match the user's context and available time.
- Assign each suggested task a date from today through the next 7 days (${today} to 7 days out).
- Return JSON: { "suggestions": [{ "taskId": string, "suggestedDate": "YYYY-MM-DD", "reason": string }] }
- Only use task IDs from the provided list.
- Keep reasons brief (1 sentence).
- If nothing matches, return { "suggestions": [] }.`
}

function buildUserMessage(context: string, tasks: SearchableTask[]): string {
  const taskList = tasks
    .map((t) => `- [${t.id}] "${t.title}" (list: ${t.listName})`)
    .join('\n')
  return `Context: ${context}\n\nAvailable tasks:\n${taskList}`
}

function parseResponse(raw: string, validIds: Set<string>): AiTaskSuggestion[] {
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.suggestions)) return []

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  return parsed.suggestions.filter(
    (s: AiTaskSuggestion) =>
      typeof s.taskId === 'string' &&
      validIds.has(s.taskId) &&
      typeof s.suggestedDate === 'string' &&
      dateRe.test(s.suggestedDate) &&
      typeof s.reason === 'string'
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { context, tasks } = await req.json() as RequestBody

    if (!context?.trim() || !Array.isArray(tasks) || tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing context or tasks' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const today = getLocalDateString()
    const validIds = new Set(tasks.map((t) => t.id))

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(today) },
          { role: 'user', content: buildUserMessage(context, tasks) },
        ],
      }),
    })

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${err}`)
    }

    const data = await openaiResponse.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response from AI')

    const suggestions = parseResponse(content, validIds)

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
