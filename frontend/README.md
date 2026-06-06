# Engineering Agents

## code-reviewer.md

Agente principal de revisión.

Se usa después de:

* commits
* PRs
* refactors
* decisiones de arquitectura

Responsabilidad:

* eliminar complejidad innecesaria
* validar patrones
* proteger la mantenibilidad a largo plazo

---

## polishing-prompt.md

Meta-prompt de pulido final.

NO es automático.

Se aplica manualmente antes de:

* guardar agentes
* publicar documentación
* cerrar PRs importantes

Responsabilidad:

* eliminar redundancia
* eliminar ruido
* asegurar que cada palabra sea necesaria

---

## Regla principal

Primero piensa → luego escribe → luego elimina.

El objetivo no es producir más.

Es dejar solo lo que debe existir.

## System Philosophy

We do not review code once.

We review in layers:

1. Engineering (correctness, sustainability) @code-reviewer.md
2. UX (clarity, usability) @ux-engineering-edge.md
3. Product (perception, premium feel) @motion-perception-polish.md 
4. Polishing (final refinement) @polishing-prompt.md

A feature is NOT complete until it passes all four.


## Example prompt (CLEAN CODE AGENT):
Run code-reviewer on this diff.

Context:
- This is a completed feature
- Optimize for long-term maintainability, not speed

Focus on:
- What should be deleted
- What is unjustified complexity
- What will break or hurt in 3 months

Be decisive. No hedging.