# Repository Guidelines

## Project Structure & Module Organization

Vite + React + TypeScript app (UI em pt-BR). `src/domain/` guarda a lógica pura de nutrição (`nutrition.ts` metas e validação, `foods.ts` banco de alimentos, `mealPlan.ts` cardápio), com testes `*.test.ts` ao lado. `src/components/` contém a interface, `src/ui/labels.ts` os textos e formatadores, e `src/styles.css` o CSS com tokens (sem Tailwind).

## Build, Test, and Development Commands

- `npm install` instala as dependências.
- `npm run dev` inicia o servidor local (http://localhost:5173).
- `npm test` roda os testes do domínio (Vitest).
- `npm run build` verifica os tipos e gera `dist/`.

## Coding Style & Naming Conventions

Follow the formatter and linter selected by the project; commit their configuration so contributors share the same rules. Use descriptive names that reflect nutrition concepts and units explicitly (for example, `proteinGrams` rather than `protein`). Keep modules focused, and avoid embedding presentation text in calculation code.

## Testing Guidelines

Os testes usam Vitest (`npm test`). Add tests with each new calculation or behavior. Cover normal values, boundary conditions, invalid inputs, and unit conversions; name test files consistently with the implementation they exercise.

## Architecture & Data Integrity

Keep the interface responsible for masks, feedback, accessible states, and quick format checks. Validate request contracts at the API boundary; keep authoritative nutrition calculations and business rules in domain logic. Enforce critical data integrity in the deepest appropriate layer so alternate clients cannot bypass it. Do not trust client-side checks for authorization or security.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no existing commit convention can be inferred. Use short imperative commit subjects (such as `Add calorie estimate tests`). Pull requests should explain the user-visible change, summarize implementation choices, link related issues when available, and include screenshots for interface changes. Note test commands and results.

## Security & Configuration

Do not commit secrets or personal health data. Keep environment-specific values in ignored local configuration, provide a sanitized example file when needed, and validate inputs before using them in calculations or persistence.
