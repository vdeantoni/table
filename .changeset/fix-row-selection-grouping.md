---
'@tanstack/table-core': patch
---

fix(row-selection): support grouped rows in parent-child selection

Fixes row selection behavior when combined with grouping. When toggling selection on a grouped parent row, all leaf rows within that group are now correctly selected. Parent checkboxes now properly show indeterminate state when some children are selected, and checked state when all children are selected.
