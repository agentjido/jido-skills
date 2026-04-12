---
name: jido-ai
description: >-
  Integrate AI/LLM capabilities into Jido agents using jido_ai and req_llm.
  Use when adding AI features to agents, setting up LLM providers, implementing
  chat agents, tool calling, or multi-modal input/output.
metadata:
  author: agentjido
  version: "0.1.0"
license: Apache-2.0
compatibility: Requires jido_ai and req_llm packages
---

# AI Integration with Jido

## MANDATORY PREPARATION

Invoke /jido-core first — it contains ecosystem context,
conventions, and core design principles. Follow its guidance before proceeding.

## Overview

`jido_ai` provides AI/LLM integration for Jido agents, built on `req_llm`.
It offers:

- Model aliases for semantic model references (`:fast`, `:capable`, `:thinking`)
- High-level generation facades (`generate_text`, `generate_object`, `stream_text`)
- `Jido.AI.Agent` macro for building ReAct-based AI agents
- Tool calling: expose `Jido.Action` modules as LLM-callable tools
- Request tracking with async `ask/await` pattern

---

## Step 1: Add Dependencies

```elixir
# mix.exs
defp deps do
  [
    {:jido, "~> 2.0"},
    {:jido_ai, "~> 2.0"},
    {:req_llm, "~> 1.9"}
  ]
end
```

---

## Step 2: Configure LLM Providers

Set API keys and model aliases in your config:

```elixir
# config/config.exs
config :req_llm,
  anthropic: [api_key: System.get_env("ANTHROPIC_API_KEY")],
  openai: [api_key: System.get_env("OPENAI_API_KEY")],
  google: [api_key: System.get_env("GOOGLE_API_KEY")]

# config/config.exs
config :jido_ai,
  model_aliases: %{
    fast: "anthropic:claude-sonnet-4-20250514",
    capable: "anthropic:claude-sonnet-4-20250514",
    thinking: "anthropic:claude-sonnet-4-20250514"
  }
```

### Model Aliases

Use semantic aliases instead of hardcoded model strings:

```elixir
Jido.AI.resolve_model(:fast)      # => "anthropic:claude-sonnet-4-20250514"
Jido.AI.resolve_model(:capable)   # => "anthropic:claude-sonnet-4-20250514"
Jido.AI.model_aliases()           # => all configured aliases
```

### LLM Defaults

Configure role-based defaults for generation helpers:

```elixir
config :jido_ai,
  llm_defaults: %{
    text: %{model: :fast, temperature: 0.2, max_tokens: 1024},
    object: %{model: :thinking, temperature: 0.0, max_tokens: 1024},
    stream: %{model: :fast, temperature: 0.2, max_tokens: 1024}
  }
```

---

## Step 3: Using Generation Facades

`Jido.AI` provides thin wrappers over `ReqLLM.Generation`:

```elixir
# Simple text generation
{:ok, response} = Jido.AI.generate_text("Summarize this in one sentence.")

# Structured object generation
{:ok, json} = Jido.AI.generate_object("Extract fields from this text", schema)

# Streaming text
{:ok, stream} = Jido.AI.stream_text("Stream this response")

# With explicit model and options
{:ok, response} = Jido.AI.generate_text("Hello",
  model: :capable,
  temperature: 0.5,
  max_tokens: 2048
)
```

---

## Step 4: Build AI Agents

Use `Jido.AI.Agent` to create agents with the ReAct strategy:

```elixir
defmodule MyApp.WeatherAgent do
  use Jido.AI.Agent,
    name: "weather_agent",
    description: "Answers weather questions using tools",
    tools: [MyApp.Actions.GetWeather, MyApp.Actions.GetForecast],
    system_prompt: "You are a weather expert. Use tools to look up weather data.",
    model: :fast,
    max_iterations: 10,
    max_tokens: 4096,
    streaming: true
end
```

### AI Agent Options

| Option              | Default     | Description                           |
|---------------------|-------------|---------------------------------------|
| `name`              | required    | Agent name                            |
| `tools`             | required    | List of `Jido.Action` modules as tools|
| `description`       | auto        | Agent description                     |
| `system_prompt`     | none        | System prompt for the LLM             |
| `model`             | `:fast`     | Model alias or direct spec            |
| `max_iterations`    | `10`        | Max ReAct reasoning iterations        |
| `max_tokens`        | `4096`      | Max tokens per LLM response           |
| `streaming`         | `true`      | Stream LLM responses                  |
| `tool_timeout_ms`   | `15_000`    | Per-attempt tool execution timeout    |
| `tool_max_retries`  | `1`         | Retries for tool failures             |
| `tool_context`      | `%{}`       | Context map passed to all tools       |

---

## Step 5: Interact with AI Agents

### Async Pattern (Preferred)

```elixir
{:ok, pid} = Jido.AgentServer.start(agent: MyApp.WeatherAgent)

# Send query — returns immediately with a request handle
{:ok, request} = MyApp.WeatherAgent.ask(pid, "What's the weather in Tokyo?")

# Await the result
{:ok, answer} = MyApp.WeatherAgent.await(request, timeout: 30_000)
```

### Sync Convenience

```elixir
{:ok, answer} = MyApp.WeatherAgent.ask_sync(pid, "What's the weather in Tokyo?",
  timeout: 30_000
)
```

### Per-Request Tool Context

```elixir
{:ok, request} = MyApp.WeatherAgent.ask(pid, "Get my preferences",
  tool_context: %{actor: current_user, tenant_id: "acme"}
)
```

---

## Step 6: Tool Calling

Any `Jido.Action` can serve as an LLM tool. Define actions with descriptive
`doc` strings in the schema — these become the tool parameter descriptions:

```elixir
defmodule MyApp.Actions.GetWeather do
  use Jido.Action,
    name: "get_weather",
    description: "Gets current weather for a location",
    schema: [
      location: [type: :string, required: true, doc: "City or location name"],
      units: [type: {:in, [:celsius, :fahrenheit]}, default: :celsius, doc: "Temperature units"]
    ]

  @impl true
  def run(params, _context) do
    # Call weather API
    {:ok, %{temperature: 22, conditions: "sunny", location: params.location}}
  end
end

# Convert to tool spec for LLM consumption
MyApp.Actions.GetWeather.to_tool()
```

### Runtime Tool Management

Register and unregister tools dynamically on running agents:

```elixir
{:ok, agent} = Jido.AI.register_tool(agent_pid, MyApp.Tools.Calculator)
{:ok, agent} = Jido.AI.unregister_tool(agent_pid, "calculator")
{:ok, tools}  = Jido.AI.list_tools(agent_pid)
{:ok, true}   = Jido.AI.has_tool?(agent_pid, "calculator")
```

---

## Step 7: Agent-as-Team Patterns

Compose multiple specialized agents for complex workflows:

```elixir
defmodule MyApp.ResearchAgent do
  use Jido.AI.Agent,
    name: "research_agent",
    description: "Researches topics using multiple sources",
    tools: [MyApp.Actions.WebSearch, MyApp.Actions.DatabaseQuery],
    system_prompt: "You are a research assistant. Search multiple sources."
end

defmodule MyApp.WriterAgent do
  use Jido.AI.Agent,
    name: "writer_agent",
    description: "Writes content based on research",
    tools: [MyApp.Actions.FormatDocument],
    system_prompt: "You are a technical writer. Format research into documents."
end
```

Use parent-child hierarchies or signal routing to coordinate agents. See the
Jido Workbench (`jido_workbench`) for working multi-agent examples.

---

## Step 8: Error Handling and Rate Limiting

### Error Handling

```elixir
case MyApp.WeatherAgent.ask_sync(pid, query, timeout: 30_000) do
  {:ok, answer} ->
    # Success
    answer

  {:error, {:timeout, diagnostics}} ->
    # Timeout — check diagnostics map for server_status, queue_length
    Logger.warning("Agent timed out: #{inspect(diagnostics)}")

  {:error, reason} ->
    # Other error
    Logger.error("Agent error: #{inspect(reason)}")
end
```

### Completion Detection

Agents signal completion via state, not process death:

```elixir
{:ok, state} = Jido.AgentServer.state(pid)
case state.agent.state.status do
  :completed -> state.agent.state.last_answer
  :failed    -> {:error, state.agent.state.error}
  _          -> :still_running
end
```

### Rate Limiting

Use the `request_policy` option to control concurrency:

```elixir
use Jido.AI.Agent,
  name: "rate_limited_agent",
  request_policy: :reject,  # reject concurrent requests (default)
  tools: [...]
```

---

## DO / DON'T

### DO

- **Use model aliases** (`:fast`, `:capable`) instead of hardcoded model strings.
- **Add descriptive `doc` to action schemas** — these become LLM tool descriptions.
- **Use async `ask/await`** for concurrent request handling.
- **Set appropriate timeouts** for tool execution and streaming.
- **Keep API keys in environment variables**, never in source code.

### DON'T

- **Hardcode model provider strings** in agent definitions — use aliases.
- **Skip error handling** on LLM calls — network failures are common.
- **Use blocking `ask_sync`** in production hot paths — prefer async.
- **Expose sensitive data in tool context** — filter before passing to LLM.
- **Ignore token limits** — set `max_tokens` appropriate to your use case.
