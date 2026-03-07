import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaskListInfo {
  id: string
  name: string
}

interface AiCreatedTask {
  title: string
  listId: string
  dueDate?: string
  subtasks?: { title: string }[]
}

interface RequestBody {
  prompt: string
  taskLists: TaskListInfo[]
}

function getLocalDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function buildSystemPrompt(today: string, taskLists: TaskListInfo[]): string {
  const listDescriptions = taskLists.map((l) => `- "${l.name}" (id: ${l.id})`).join('\n')
  return `You are a task creation assistant. Today's date is ${today}.

The user will describe tasks they want to create in natural language. Parse their input into structured tasks.

Available task lists:
${listDescriptions}

Rules:
- Extract individual tasks from the user's description.
- Assign each task to the most appropriate existing list based on its name and context.
- If no list is a good fit, use the first list as default.
- Extract due dates if mentioned (use YYYY-MM-DD format). Interpret relative dates like "tomorrow", "next Monday", "by Sunday" relative to today.
- If a task naturally has subtasks, include them.
- Return JSON: { "tasks": [{ "title": string, "listId": string, "dueDate"?: "YYYY-MM-DD", "subtasks"?: [{ "title": string }] }] }
- Keep task titles concise and actionable.
- If the input is unclear or empty, return { "tasks": [] }.`
}

function buildUserMessage(prompt: string): string {
  return prompt
}

function parseResponse(raw: string, validListIds: Set<string>, defaultListId: string): AiCreatedTask[] {
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.tasks)) return []

  const dateRe = /^\d{4}-\d{2}-\d{2}$/

  return parsed.tasks
    .filter(
      (t: Record<string, unknown>) =>
        typeof t.title === 'string' && t.title.trim().length > 0
    )
    .map((t: Record<string, unknown>) => {
      const task: AiCreatedTask = {
        title: String(t.title).trim(),
        listId: typeof t.listId === 'string' && validListIds.has(t.listId) ? t.listId : defaultListId,
      }

      if (typeof t.dueDate === 'string' && dateRe.test(t.dueDate)) {
        task.dueDate = t.dueDate
      }

      if (Array.isArray(t.subtasks)) {
        const validSubtasks = t.subtasks
          .filter((s: Record<string, unknown>) => typeof s.title === 'string' && String(s.title).trim().length > 0)
          .map((s: Record<string, unknown>) => ({ title: String(s.title).trim() }))
        if (validSubtasks.length > 0) {
          task.subtasks = validSubtasks
        }
      }

      return task
    })
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

    const { prompt, taskLists } = await req.json() as RequestBody

    if (!prompt?.trim() || !Array.isArray(taskLists) || taskLists.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt or task lists' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const today = getLocalDateString()
    const validListIds = new Set(taskLists.map((l) => l.id))
    const defaultListId = taskLists[0].id

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
          { role: 'system', content: buildSystemPrompt(today, taskLists) },
          { role: 'user', content: buildUserMessage(prompt) },
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

    const tasks = parseResponse(content, validListIds, defaultListId)

    return new Response(
      JSON.stringify({ tasks }),
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
