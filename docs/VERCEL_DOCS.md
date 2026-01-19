# Vercel Documentation

Vercel is the AI Cloud for building and deploying modern web applications, from static sites to AI-powered agents.

## Get started with Vercel

You can build and host many different types of applications on Vercel, static sites with your favorite [framework](/docs/frameworks), [multi-tenant](/docs/multi-tenant) applications, or [microfrontends](/docs/microfrontends), to [AI-powered agents](/kb/guide/how-to-build-ai-agents-with-vercel-and-the-ai-sdk).

You can also use the [Vercel Marketplace](/docs/integrations) to find and install integrations such as AI providers, databases, CMSs, analytics, storage, and more.

When you are ready to build, connect your [Git repository](/docs/git) to deploy on every push, with [automatic preview environments](/docs/deployments/environments#preview-environment-pre-production) for testing changes before production.

See the [getting started guide](/docs/getting-started-with-vercel) for more information, or the [incremental migration guide](/docs/incremental-migration) for a step-by-step guide to migrating your existing application to Vercel.

## Quick references

- [Configuring vercel.json](/docs/project-configuration)
- [Working with Domains](/docs/domains/working-with-domains)
- [Storage for your Vercel project](/docs/storage)
- [Vercel MCP](/docs/mcp/vercel-mcp)
- [Caching on Vercel](/docs/cdn-cache)

## Build your applications

Use one or more of the following tools to build your application depending on your needs:

- [Next.js](/docs/frameworks/nextjs): Build full-stack applications with Next.js, or any of our [supported frameworks](/docs/frameworks/more-frameworks)
- [Functions](/docs/functions): API routes with [Fluid compute](/docs/fluid-compute), [active CPU, and provisioned memory](/docs/functions/usage-and-pricing), perfect for AI workloads
- [Routing Middleware](/docs/routing-middleware): Customize your application's behavior with code that runs before a request is processed
- [Incremental Static Regeneration](/docs/incremental-static-regeneration): Automatically regenerate your pages on a schedule or when a request is made
- [Image Optimization](/docs/image-optimization): Optimize your images for the web
- [Manage environments](/docs/deployments/environments): Local, preview, production, and custom environments
- [Feature flags](/docs/feature-flags): Control the visibility of features in your application

## Use Vercel's AI infrastructure

Add intelligence to your applications with Vercel's AI-first infrastructure:

- [AI SDK](/docs/ai-sdk): Integrate language models with streaming and tool calling
- [AI Gateway](/docs/ai-gateway): Route to any AI provider with automatic failover
- [Agents](/kb/guide/how-to-build-ai-agents-with-vercel-and-the-ai-sdk): Build autonomous workflows and conversational interfaces
- [MCP Servers](/docs/mcp): Create tools for AI agents to interact with your systems
- [Sandbox](/docs/vercel-sandbox): Secure execution environments for untrusted code
- [Claim deployments](/docs/deployments/claim-deployments): Allow AI agents to deploy a project and let a human take over

## Collaborate with your team

Collaborate with your team using the following tools:

- [Toolbar](/docs/vercel-toolbar): An in-browser toolbar that lets you leave feedback, manage feature flags, preview drafts, edit content live, inspect [performance](/docs/vercel-toolbar/interaction-timing-tool)/[layout](/docs/vercel-toolbar/layout-shift-tool)/[accessibility](/docs/vercel-toolbar/accessibility-audit-tool), and navigate/share deployment pages
- [Comments](/docs/comments): Let teams and invited collaborators comment on your preview deployments and production environments
- [Draft mode](/docs/draft-mode): View your unpublished headless CMS content on your site

## Secure your applications

Secure your applications with the following tools:

- [Deployment Protection](/docs/deployment-protection): Protect your applications from unauthorized access
- [RBAC](/docs/rbac): Role-based access control for your applications
- [Configurable WAF](/docs/vercel-firewall/vercel-waf): Customizable rules to protect against attacks, scrapers, and unwanted traffic
- [Bot Management](/docs/bot-management): Protect your applications from bots and automated traffic
- [BotID](/docs/botid): An invisible CAPTCHA that protects against sophisticated bots without showing visible challenges or requiring manual intervention
- [AI bot filtering](/docs/bot-management#ai-bots-managed-ruleset): Control traffic from AI bots
- [Platform DDoS Mitigation](/docs/security/ddos-mitigation): Protect your applications from DDoS attacks

## Deploy and scale

Vercel handles infrastructure automatically based on your framework and code, and provides the following tools to help you deploy and scale your applications:

- [Vercel Delivery Network](/docs/cdn): Fast, globally distributed execution
- [Rolling Releases](/docs/rolling-releases): Roll out new deployments in increments
- [Rollback deployments](/docs/instant-rollback): Roll back to a previous deployment, for swift recovery from production incidents, like breaking changes or bugs
- [Observability suite](/docs/observability): Monitor performance and debug your AI workflows and apps
