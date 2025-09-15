# TableGroup Component

Below the Postgres shell component, there will be a component that visuablizes the TableGroups that currently exist, and the tables that exist in them. For the purposes of this demo, a TableGroup is simply a grouping of tables.

TableGroups should be represented by colored rectangles with their name in the upper left hand corner. Tables within TableGroups will be rectangles within their respective TableGroups, each labelled with the table name.

At the start of the demo, there will be a single TableGroup named `default`.

## Schema changes for `TableGroup`s

The `scripts` table will now contain the new column `added`. `added` is a Postgres list containing strings in one of two forms:

- `TABLEGROUP`: this indicates that the given TABLEGROUP should be added to the TableGroup UI component. For example an `added` entry of `users` will add the new TableGroup `users` to the TableGroup component.
- `TABLEGROUP.TABLE`: indicates that the given TABLE should be added to the specified TABLEGROUP. For example, `users.emails` means that the `emails` table should be added to the `users` tablespace.

