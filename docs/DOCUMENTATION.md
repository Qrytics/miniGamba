# miniGamba – Documentation Index

This project uses **Markdown** for all documentation. There are **no PDF files** in the repository. To get PDFs, generate them from the Markdown files as needed.

## Documentation files (current)

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview, architecture, games, economy, features |
| [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md) | Implementation status, completed components, next steps |
| [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) | Setup summary and project structure |
| [COMPLETION_SUMMARY.md](../COMPLETION_SUMMARY.md) | Completion summary and implemented features |
| [TESTING_GUIDE.md](../TESTING_GUIDE.md) | How to run and stop tests, analyze results |
| [productReqDoc.md](../productReqDoc.md) | Product requirements and spec |
| [docs/SETUP.md](SETUP.md) | Development setup, install, run, build |
| [docs/ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture and stack |
| [docs/README.md](README.md) | Docs folder overview |
| [tests/README.md](../tests/README.md) | Testing pipeline, E2E, analyze, stop tests |
| [tests/ANALYZE_BEFORE_CLEANUP.md](../tests/ANALYZE_BEFORE_CLEANUP.md) | Analyze before cleanup workflow |
| [tests/BUGS_FIXED.md](../tests/BUGS_FIXED.md) | Record of fixed bugs |
| [tests/PARALLEL_TESTING.md](../tests/PARALLEL_TESTING.md) | Parallel testing notes |
| [tests/README-BUG-REPORTS.md](../tests/README-BUG-REPORTS.md) | Bug reports usage |

## Generating PDFs from Markdown

You can turn any of the above `.md` files into PDFs with:

1. **Pandoc** (if installed):  
   `pandoc README.md -o README.pdf`
2. **VS Code**: Open the `.md` file → Preview (e.g. Ctrl+Shift+V) → right‑click in preview → “Print” → “Save as PDF”.
3. **Browser**: Open the Markdown in a viewer (e.g. GitHub), then File → Print → Save as PDF.

After implementation or doc changes, regenerate PDFs from the updated Markdown so printed/exported docs stay in sync.
