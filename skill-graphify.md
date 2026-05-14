# Graphify Skill Manifest
name: graphify
description: Knowledge graph tool for AI coding assistants to understand codebases.
trigger: /graphify
version: v7

instructions:
  - When the user asks for a codebase overview, check if `GRAPH_REPORT.md` exists.
  - If it doesn't exist or is outdated, run `graphify analyze`.
  - Use the knowledge graph in `GRAPH_REPORT.md` to answer complex architecture questions.
  - Keep the knowledge graph updated after significant refactors.
