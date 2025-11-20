# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TanStack Table is a headless table library with a framework-agnostic core and adapters for React, Vue, Solid, Angular, Lit, Qwik, and Svelte. The repository is a pnpm monorepo using Nx for build orchestration.

## Common Commands

### Development

```bash
pnpm install              # Install dependencies (required after clone)
pnpm dev                  # Watch mode: auto-build and auto-test as you edit
pnpm watch                # Alias for dev
```

### Building

```bash
pnpm build                # Build affected packages (uses Nx)
pnpm build:all            # Build all packages
pnpm clean                # Clean all build outputs
```

### Testing

```bash
pnpm test                 # Full CI test suite (format, sherif, knip, lib, types, build)
pnpm test:lib             # Run library tests for affected packages
pnpm test:lib:dev         # Run tests in watch mode
pnpm test:types           # Type checking only
pnpm test:format          # Check code formatting with Prettier
pnpm test:sherif          # Check dependency security
pnpm test:knip            # Check for unused exports
```

### Working with Examples

Examples are in the `examples/` directory organized by framework. To run an example:

```bash
pnpm install              # From root (installs all workspace dependencies)
cd examples/<framework>/<example-name>
pnpm start                # Start the example dev server
```

## Monorepo Structure

```
packages/
├── table-core/              # Framework-agnostic core (~15KB, NO framework deps)
├── react-table/             # React adapter
├── vue-table/               # Vue 3 adapter
├── solid-table/             # Solid JS adapter
├── angular-table/           # Angular adapter
├── lit-table/               # Lit element adapter
├── qwik-table/              # Qwik adapter
├── svelte-table/            # Svelte adapter
├── react-table-devtools/    # React DevTools component
└── match-sorter-utils/      # Filtering/sorting utilities
```

## Architecture

### Core Philosophy: Headless + Adapters

**`@tanstack/table-core`** contains ALL business logic as pure JavaScript/TypeScript with zero framework dependencies. Framework adapters are thin wrappers (1-2KB each) that:

1. Re-export everything from `table-core`
2. Create a table instance using `createTable()` from core
3. Manage state using framework-specific reactivity (React hooks, Vue refs, Angular signals, etc.)
4. Provide rendering helpers like `flexRender()`

### Feature System

The core uses a plugin-like feature system. Each feature (e.g., ColumnVisibility, RowSorting, RowPagination) implements the `TableFeature` interface with lifecycle hooks:

```typescript
interface TableFeature {
  getInitialState?: () => Partial<TableState>
  getDefaultOptions?: (table) => Partial<TableOptions>
  createTable?: (table) => void // Add methods to Table instance
  createColumn?: (column) => void // Add methods to Column instance
  createRow?: (row) => void // Add methods to Row instance
  createCell?: (cell) => void // Add methods to Cell instance
}
```

Built-in features are registered in `packages/table-core/src/core/table.ts`. Features are located in `packages/table-core/src/features/`.

### Row Model Pipeline

Instead of mutating data, TanStack Table uses a composable pipeline of pure functions:

```
Data → getCoreRowModel()
     → getFilteredRowModel()
     → getSortedRowModel()
     → getGroupedRowModel()
     → getExpandedRowModel()
     → getPaginationRowModel()
     → Final RowModel
```

Each row model function:

- Takes the previous row model as input
- Returns a new row model with `rows`, `flatRows`, and `rowsById`
- Is a pure function (no side effects)
- Can be composed in any order

Row model functions are in `packages/table-core/src/utils/`.

### State Management

Table state is immutable and updated via updater functions:

```typescript
type Updater<T> = T | ((old: T) => T)
type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void
```

All state lives in `TableState` which includes:

- `columnVisibility`, `columnOrder`, `columnPinning`, `columnSizing`
- `columnFilters`, `globalFilter`
- `sorting`, `grouping`, `expanded`
- `pagination`
- `rowPinning`, `rowSelection`

### Type System

All types are parameterized by `TData extends RowData` for full type safety. The main `Table` interface is composed by intersecting feature-specific interfaces (e.g., `SortingInstance`, `FilteringInstance`, etc.).

## Key File Locations

| Purpose                 | Location                                |
| ----------------------- | --------------------------------------- |
| Core table creation     | `packages/table-core/src/core/table.ts` |
| All type definitions    | `packages/table-core/src/types.ts`      |
| Feature implementations | `packages/table-core/src/features/`     |
| Row model builders      | `packages/table-core/src/utils/`        |
| React adapter           | `packages/react-table/src/index.tsx`    |
| Vue adapter             | `packages/vue-table/src/index.ts`       |
| Build configuration     | `scripts/getRollupConfig.js`            |
| Nx configuration        | `nx.json`                               |

## Build System

- **Build tool**: Rollup (configured in each package's `rollup.config.mjs`)
- **Shared config**: `scripts/getRollupConfig.js` exports reusable build configs
- **Orchestration**: Nx handles dependency graph and caching
- **Outputs**: Each package produces `.mjs` (ES modules), `.js` (CommonJS), and UMD builds
- **Size limits**: Enforced in root `package.json` size-limit config (table-core must be ≤16KB)

Nx ensures packages build in dependency order (table-core builds before adapters).

## Testing

- **Framework**: Vitest (configured in each package's `vitest.config.ts`)
- **Location**: Tests live in `packages/*/tests/` directories
- **Coverage**: Generated to `{projectRoot}/coverage/`
- **Run single test**: `cd packages/<package-name> && pnpm test:lib <test-file>`

## Adding a New Feature

1. Create `packages/table-core/src/features/MyFeature.ts`
2. Define state interfaces (`MyFeatureState`), options (`MyFeatureOptions`), and instance methods (`MyFeatureInstance`)
3. Implement the `TableFeature` interface with appropriate lifecycle hooks
4. Register the feature in the `builtInFeatures` array in `packages/table-core/src/core/table.ts`
5. Export from `packages/table-core/src/index.ts`
6. Add types to the `Table`, `Column`, `Row`, or `Cell` interfaces in `types.ts`
7. Add tests in `packages/table-core/tests/`

## Important Conventions

### State Updates

Always use updater functions, never mutate state directly:

```typescript
// WRONG: Direct mutation
state.columnVisibility['colId'] = true

// RIGHT: Use table methods
table.getColumn('colId').toggleVisibility()
```

### Column Definitions

Two approaches for defining columns:

```typescript
// Type-safe helper (recommended)
const helper = createColumnHelper<Person>()
const columns = [
  helper.accessor('firstName', {
    /* config */
  }),
]

// Raw objects (still type-safe)
const columns: ColumnDef<Person>[] = [{ accessorKey: 'firstName' }]
```

### Package Dependencies

- `table-core` must have ZERO external dependencies (except dev dependencies)
- Framework adapters should only depend on `table-core` and their respective framework
- Use `sherif` to check dependency issues: `pnpm test:sherif`

## Version Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
pnpm changeset              # Create a new changeset
pnpm changeset:version      # Bump versions and update CHANGELOG
pnpm changeset:publish      # Publish to npm
```

## Documentation

Documentation is separate but can be found at https://tanstack.com/table. The docs reference examples in the `examples/` directory.
