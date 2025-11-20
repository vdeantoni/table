import { describe, expect, it } from 'vitest'
import {
  ColumnDef,
  createColumnHelper,
  createTable,
  getCoreRowModel,
  getGroupedRowModel,
} from '../src'
import { makeData, Person } from './makeTestData'

type personKeys = keyof Person
type PersonColumn = ColumnDef<Person, string | number | Person[] | undefined>

function generateColumns(people: Person[]): PersonColumn[] {
  const columnHelper = createColumnHelper<Person>()
  const person = people[0]
  return Object.keys(person).map(key => {
    const typedKey = key as personKeys
    return columnHelper.accessor(typedKey, { id: typedKey })
  })
}

describe('RowSelection with Grouping', () => {
  it('toggleSelected on grouped parent should select all leaf rows', () => {
    const data = makeData(6, 0)
    data[0].firstName = 'GroupA'
    data[1].firstName = 'GroupA'
    data[2].firstName = 'GroupA'
    data[3].firstName = 'GroupB'
    data[4].firstName = 'GroupB'
    data[5].firstName = 'GroupC'

    const columns = generateColumns(data)

    let rowSelection = {}

    const table = createTable<Person>({
      enableRowSelection: true,
      onStateChange() {},
      renderFallbackValue: '',
      data,
      state: {
        grouping: ['firstName'],
        rowSelection,
      },
      onRowSelectionChange: updater => {
        rowSelection =
          typeof updater === 'function' ? updater(rowSelection) : updater
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const groupedModel = table.getGroupedRowModel()
    const groupARow = groupedModel.rows[0]

    groupARow.toggleSelected(true)

    expect(rowSelection['0']).toBe(true)
    expect(rowSelection['1']).toBe(true)
    expect(rowSelection['2']).toBe(true)
    expect(rowSelection['3']).toBeUndefined()
    expect(rowSelection['4']).toBeUndefined()
    expect(rowSelection['5']).toBeUndefined()
  })

  it('getIsSomeSelected should return true when some leaf rows are selected', () => {
    const data = makeData(6, 0)
    data[0].firstName = 'GroupA'
    data[1].firstName = 'GroupA'
    data[2].firstName = 'GroupA'
    data[3].firstName = 'GroupB'
    data[4].firstName = 'GroupB'
    data[5].firstName = 'GroupC'

    const columns = generateColumns(data)

    const table = createTable<Person>({
      enableRowSelection: true,
      onStateChange() {},
      renderFallbackValue: '',
      data,
      state: {
        grouping: ['firstName'],
        rowSelection: {
          '0': true,
        },
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const groupedModel = table.getGroupedRowModel()
    const groupARow = groupedModel.rows[0]

    expect(groupARow.getIsSomeSelected()).toBe(true)
    expect(groupARow.getIsAllSubRowsSelected()).toBe(false)
  })

  it('getIsAllSubRowsSelected should return true when all leaf rows are selected', () => {
    const data = makeData(6, 0)
    data[0].firstName = 'GroupA'
    data[1].firstName = 'GroupA'
    data[2].firstName = 'GroupA'
    data[3].firstName = 'GroupB'
    data[4].firstName = 'GroupB'
    data[5].firstName = 'GroupC'

    const columns = generateColumns(data)

    const table = createTable<Person>({
      enableRowSelection: true,
      onStateChange() {},
      renderFallbackValue: '',
      data,
      state: {
        grouping: ['firstName'],
        rowSelection: {
          '0': true,
          '1': true,
          '2': true,
        },
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const groupedModel = table.getGroupedRowModel()
    const groupARow = groupedModel.rows[0]

    expect(groupARow.getIsAllSubRowsSelected()).toBe(true)
    expect(groupARow.getIsSomeSelected()).toBe(false)
  })

  it('toggleSelected false on grouped parent should deselect all leaf rows', () => {
    const data = makeData(6, 0)
    data[0].firstName = 'GroupA'
    data[1].firstName = 'GroupA'
    data[2].firstName = 'GroupA'
    data[3].firstName = 'GroupB'
    data[4].firstName = 'GroupB'
    data[5].firstName = 'GroupC'

    const columns = generateColumns(data)

    let rowSelection = {
      '0': true,
      '1': true,
      '2': true,
      '3': true,
      '4': true,
    }

    const table = createTable<Person>({
      enableRowSelection: true,
      onStateChange() {},
      renderFallbackValue: '',
      data,
      state: {
        grouping: ['firstName'],
        rowSelection,
      },
      onRowSelectionChange: updater => {
        rowSelection =
          typeof updater === 'function' ? updater(rowSelection) : updater
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const groupedModel = table.getGroupedRowModel()
    const groupARow = groupedModel.rows[0]

    groupARow.toggleSelected(false)

    expect(rowSelection['0']).toBeUndefined()
    expect(rowSelection['1']).toBeUndefined()
    expect(rowSelection['2']).toBeUndefined()
    expect(rowSelection['3']).toBe(true)
    expect(rowSelection['4']).toBe(true)
  })

  it('toggleSelected on nested grouped parent should select all deeply nested leaf rows', () => {
    const data = makeData(8, 0)
    data[0].firstName = 'GroupA'
    data[0].age = 25
    data[1].firstName = 'GroupA'
    data[1].age = 25
    data[2].firstName = 'GroupA'
    data[2].age = 30
    data[3].firstName = 'GroupA'
    data[3].age = 30
    data[4].firstName = 'GroupB'
    data[4].age = 25
    data[5].firstName = 'GroupB'
    data[5].age = 30
    data[6].firstName = 'GroupC'
    data[6].age = 35
    data[7].firstName = 'GroupC'
    data[7].age = 35

    const columns = generateColumns(data)

    let rowSelection = {}

    const table = createTable<Person>({
      enableRowSelection: true,
      onStateChange() {},
      renderFallbackValue: '',
      data,
      state: {
        grouping: ['firstName', 'age'],
        rowSelection,
      },
      onRowSelectionChange: updater => {
        rowSelection =
          typeof updater === 'function' ? updater(rowSelection) : updater
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const groupedModel = table.getGroupedRowModel()
    const groupARow = groupedModel.rows[0]

    groupARow.toggleSelected(true)

    expect(rowSelection['0']).toBe(true)
    expect(rowSelection['1']).toBe(true)
    expect(rowSelection['2']).toBe(true)
    expect(rowSelection['3']).toBe(true)
    expect(rowSelection['4']).toBeUndefined()
    expect(rowSelection['5']).toBeUndefined()
    expect(rowSelection['6']).toBeUndefined()
    expect(rowSelection['7']).toBeUndefined()
  })

  it('nested grouped parent should show indeterminate when some deeply nested leaf rows are selected', () => {
    const data = makeData(8, 0)
    data[0].firstName = 'GroupA'
    data[0].age = 25
    data[1].firstName = 'GroupA'
    data[1].age = 25
    data[2].firstName = 'GroupA'
    data[2].age = 30
    data[3].firstName = 'GroupA'
    data[3].age = 30
    data[4].firstName = 'GroupB'
    data[4].age = 25
    data[5].firstName = 'GroupB'
    data[5].age = 30
    data[6].firstName = 'GroupC'
    data[6].age = 35
    data[7].firstName = 'GroupC'
    data[7].age = 35

    const columns = generateColumns(data)

    const table = createTable<Person>({
      enableRowSelection: true,
      onStateChange() {},
      renderFallbackValue: '',
      data,
      state: {
        grouping: ['firstName', 'age'],
        rowSelection: {
          '0': true,
          '1': true,
        },
      },
      columns,
      getCoreRowModel: getCoreRowModel(),
      getGroupedRowModel: getGroupedRowModel(),
    })

    const groupedModel = table.getGroupedRowModel()
    const groupARow = groupedModel.rows[0]

    expect(groupARow.getIsSomeSelected()).toBe(true)
    expect(groupARow.getIsAllSubRowsSelected()).toBe(false)
  })
})
