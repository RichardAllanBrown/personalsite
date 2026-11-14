---
title: Some Learnings with GenAI in Development Teams
description: Looking at how I've found devlopment flows change in the face of GenAIs shifting frontiers.
date: 2026-02-02
tags: [development, GenAI]
---

As generative AI becomes more embedded in developer workflows, I wanted to post about some things that have worked well and not so well in recent projects. Working with tools like Cursor or Claude Code can be straight forward when the app is small and you are on your own, but becomes more complex when working as a team over a large codebase.
Some Lessons Learned

These tools are levers not muscles. GenAI tools make a good developer stronger and faster at producing code. They can take away some of the routine pieces and let devs focus more on what they can add value to. I found myself spending more time working out what code to write, rather than just writing code. I did not see these tools make a bad developer suddenly good (and in fact made them more able to produce bad work), but ones willing to learn and grow could get more out of GenAI.

Another customer of the code. Usually we write software with other humans in mind (and occasionally, the compiler), but now we have another consumer, GenAIs. Structuring software to work with generative AI is a must, do not expect to throw an existing legacy platform and expect magic. In some recent greenfield work, we used a clean architecture style of approach on the backend which kept all the code relevant to a single users action in one place. I feel this made it easier for the tooling to update existing methods and create new actions.

Rules are essential. Write rules files them, commit them and refine them.

Use plan mode. Anything that isn't trivial usually benefits from getting a plan written down first. It's a lot easier to refine a plan with the AI first before over getting lost in arguments once changes start. Some frameworks add relevant rules files when they are set up, such as TanStack Start, which really helps with workflow.

Use common languages and libraries. I've found Cursor to be much more adept at handling front-end React changes since there's plenty of code out there the model was trained on. Try to avoid uncommon libraries if speed is the aim.

Manage the context. Too big a context causes issues, all too easy I've wasted tokens watching the model get stuck in a loop or do the wrong thing because it didn't have the right context available to it. Well structured code bases make it easier to manage context. Many things that can catch developers out can also catch out LLMs, e.g. aspect orientated programming, inconsistent naming and bad structure. Static extension methods in C# were something that I found Cursor struggling with to find, but would use them when nudged.

Don't worry about the boiler-plate. Sometimes we strive to reduce duplication too much and that hurts readability, I find the boiler-plate makes it easier for the LLM to have context on how something works and keeping it in makes it easer to get a good result. GenAI tools are fantastic at producing rote blocks of similar code.

Watch for needless duplication. I have been struggling with was getting Cursor to stop duplicating similar setup blocks in tests, which did lead to some painful refactors. It took a lot of nudging to get it to produce maintainable tests.

Over-testing is now an issue. GenAI makes it too easy to create lots of test code, which at first glance seems like a good idea, but I found our code bases we're "over-tested". Lots of low-value tests, lots of duplication and complex mocks meant running the whole suite took a time. They were somewhat fragile too.

Snowballing. If you start letting bad patterns get into the codebase, these will repeat. If a pattern is repeatably used, I found new code would follow those patterns and there would be a stickiness to them. This means it's important to establish the right patterns early on and ensure they keep being used. If an anti-pattern gets in, then don't be surprised if it repeats. LLMs lack taste.

Monorepos make it easier. Putting design docs, planning docs etc. into one repo makes it easier to provide the right context. I expect this will change in the future as these tools mature.

Use question mode. Question mode is great for poking around new areas of the codebase. I found it could explain patterns or find files rather well. Though asking for reviews seemed to have a poor signal to noise ratio.
Guessing at the future

These tools are constantly evolving, one of the reasons that makes tech so much fun. To guess at the future, I think we will see much more team orientated tooling. Rather than having agents controlled by each individual; the development team as a whole will direct a suite of agents.

Everything related to a project would be easily available to the GenAI tool, probably through some for of shared memory, RAG, MCP or other mechanisms. Claude Code/Cursor would make it easy to link say Jira, Google Drive and other repos together. The product backlog, interview transcripts, UX research, data schemas, code repos etc. would all be easily available and well indexed/searchable by the GenAI tools. e.g. product owners could ask how something works technically and get a suitable high level answer. Developers could directly reference interview transcript to derive requirements when planning a solution. (GenAI and data lake integrations are something I predict we will see more of in the future)

Gastown and Ralphloop are glimpses of the future. We would see a paced loop of agents doing the work of different team members over shared project arefacts. e.g. a business analyst AI would look at interview transcripts to generate stories and raise questions with SME's. Developer orientated agents would evaluate if the story makes sense, asking for clarifications on implementation and then planning out code changes in branches. Merge requests would be generated, reviewed and accepted. At all points, this process would be nudged by humans, but humans also nudged by the agents. There would be controls on wip limits and token consumption rates to ensure humans can stay on top of the process. Difficult problems can be handled with more human involvement while simple changes can be left entirely to the machines to solve.

These tools continue to evolve and I'm excited to see where they end up!
