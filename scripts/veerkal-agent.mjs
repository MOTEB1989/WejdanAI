/**
 * VeerKal Agent - OpenAI-compatible client
 * - Works with any OpenAI Chat Completions compatible endpoint
 * - Configurable via environment variables
 *
 * Environment Variables:
 * - AI_BASE_URL: Base URL for the AI API (e.g., https://api.openai.com/v1)
 * - AI_API_KEY: API key for authentication
 * - AI_MODEL: Model to use (default: gpt-4o-mini)
 */

const BASE_URL = process.env.AI_BASE_URL;
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

if (!BASE_URL || !API_KEY) {
  console.error("❌ Missing required environment variables:");
  if (!BASE_URL) console.error("   - AI_BASE_URL");
  if (!API_KEY) console.error("   - AI_API_KEY");
  console.log("\nPlease set these in your GitHub repository secrets.");
  process.exit(1);
}

/**
 * Call the VeerKal AI agent
 * @param {Object} params - Parameters for the agent
 * @param {string} params.task - The task to perform
 * @param {Object} params.repo - Repository information
 * @param {Object} params.context - Additional context
 * @returns {Promise<string>} - Agent response
 */
async function callVeerKal({ task, repo, context }) {
  const systemPrompt = `You are VeerKal, an intelligent repository operations agent for the ${repo.owner}/${repo.name} repository.

Your responsibilities:
1. Analyze repository health and suggest improvements
2. Review CI/CD configurations and propose optimizations
3. Identify security vulnerabilities and recommend fixes
4. Suggest dependency updates and maintenance tasks
5. Provide actionable, specific recommendations

Always be precise, practical, and output actionable steps that can be implemented immediately.
Format your response with clear sections and bullet points for easy reading.`;

  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Task: ${task}\n\nRepository Context:\n${JSON.stringify({ repo, context }, null, 2)}`
      }
    ],
    temperature: 0.2,
    max_tokens: 2000
  };

  const endpoint = `${BASE_URL.replace(/\/$/, "")}/chat/completions`;

  console.log(`🤖 VeerKal Agent Starting...`);
  console.log(`📋 Task: ${task}`);
  console.log(`🔗 Using model: ${MODEL}`);
  console.log(`─`.repeat(50));

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`AI API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    const response = data?.choices?.[0]?.message?.content ?? "";

    if (!response) {
      throw new Error("Empty response from AI API");
    }

    return response;
  } catch (error) {
    console.error(`❌ Error calling AI API: ${error.message}`);
    throw error;
  }
}

/**
 * Get repository information from environment or defaults
 */
function getRepoInfo() {
  // Try to get from GitHub Actions environment
  const githubRepo = process.env.GITHUB_REPOSITORY;
  if (githubRepo) {
    const [owner, name] = githubRepo.split('/');
    return { owner, name };
  }

  // Default fallback
  return {
    owner: "MOTEB1989",
    name: "WejdanAI"
  };
}

/**
 * Main execution
 */
async function main() {
  const task = process.argv.slice(2).join(" ") ||
    "Assess repo health and propose CI/CD improvements, security enhancements, and maintenance tasks.";

  const repo = getRepoInfo();
  const context = {
    branch: process.env.GITHUB_REF_NAME || "main",
    runId: process.env.GITHUB_RUN_ID || "local",
    timestamp: new Date().toISOString()
  };

  try {
    const output = await callVeerKal({ task, repo, context });

    console.log(`\n📊 VeerKal Analysis Results:\n`);
    console.log(`─`.repeat(50));
    console.log(output);
    console.log(`─`.repeat(50));
    console.log(`\n✅ VeerKal Agent completed successfully.`);
  } catch (error) {
    console.error(`\n❌ VeerKal Agent failed: ${error.message}`);
    process.exit(1);
  }
}

main();
