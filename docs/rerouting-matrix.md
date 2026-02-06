# Agent Re-Routing Matrix

When an agent is blocked, route the problem to the agent that can fix it. Only escalate to human after one re-route attempt fails.

| Agent Stuck | Problem Type | Re-Route To | Action |
|-------------|--------------|-------------|--------|
| @strategist | Scope unclear | @pm | PM clarifies scope, returns to strategist |
| @strategist | Solution exists | @researcher | Researcher evaluates, returns recommendation |
| @architect | Cannot implement design | @engineer | Engineer advises feasibility, architect revises |
| @architect | Infrastructure constraints | @devsecops | DevSecOps advises limits, architect adapts |
| @devsecops | Design incompatible | @architect | Architect revises design, returns to devsecops |
| @devsecops | Code blocking setup | @engineer | Engineer fixes code, returns to devsecops |
| @engineer | Design unclear | @architect | Architect clarifies, engineer continues |
| @engineer | Infrastructure broken | @devsecops | DevSecOps fixes infra, engineer continues |
| @engineer | Quality issue | @reviewer | Reviewer advises pattern, engineer implements |
| @reviewer | Security vulnerability | @devsecops | DevSecOps fixes security, reviewer re-reviews |
| @reviewer | Code intent unclear | @engineer | Engineer clarifies, reviewer continues |
| @reviewer | Design flaw | @architect | Architect revises, triggers re-implementation |
| @qa | Tests failing | @engineer | Engineer fixes bug, QA re-tests |
| @qa | Unclear requirements | @pm | PM clarifies, QA updates tests |
| @docs | Technical inaccuracy | @engineer | Engineer corrects, docs updates |
| @docs | UX confusion | @designer | Designer clarifies flow, docs updates |
| @designer | Technical constraint | @architect | Architect advises, designer adapts |
| @designer | Existing patterns unclear | @engineer | Engineer explains codebase, designer aligns |

## Re-Routing Protocol

1. Agent reports they are blocked, identifying the problem type
2. Check the matrix above for the appropriate helper
3. Invoke the helper agent with the specific fix request
4. Wait for helper to complete
5. Re-invoke the original agent to continue
6. If the helper also fails — escalate to the human with full context and options

**Rules:**
- Maximum 1 re-route per blocker. If the helper cannot fix it, escalate.
- No circular re-routes. If A routes to B routes back to A, escalate.
- Always escalate with options, not just the problem.
