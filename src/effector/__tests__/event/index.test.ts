import {from} from 'most'
import {createEvent} from 'effector'

import {argumentHistory} from 'effector/fixtures'

describe('symbol-observable support', () => {
  test('most.from(event) //stream of events', () => {
    const fn = jest.fn()
    expect(() => {
      from(createEvent())
    }).not.toThrow()
    const ev1 = createEvent<number>()
    const ev2 = createEvent<string>()
    const ev1$ = from(ev1)
    ev1$.observe(fn)
    ev1(0)
    ev1(1)
    ev1(2)
    ev2('should ignore')
    expect(fn).toHaveBeenCalledTimes(3)

    expect(argumentHistory(fn)).toMatchInlineSnapshot(`
      Array [
        0,
        1,
        2,
      ]
    `)
  })
})

test('event.watch(fn)', () => {
  const fn = jest.fn()
  const click = createEvent<number | void>()
  click.watch(fn)
  click()
  click(1)
  click(2)
  expect(fn).toHaveBeenCalledTimes(3)
  expect(argumentHistory(fn)).toMatchInlineSnapshot(`
    Array [
      undefined,
      1,
      2,
    ]
  `)
})

test('event.prepend(fn)', () => {
  const fn = jest.fn()
  const click = createEvent<number>()
  const preclick = click.prepend(([n]: number[]) => n)
  click.watch(fn)
  preclick([])
  preclick([1])
  preclick([2])

  expect(fn).toHaveBeenCalledTimes(3)
  expect(argumentHistory(fn)).toMatchInlineSnapshot(`
    Array [
      undefined,
      1,
      2,
    ]
  `)
})

test('event.map(fn)', () => {
  const fn = jest.fn()
  const click = createEvent<number | void>()
  const postclick = click.map(n => [n])
  postclick.watch(fn)
  click()
  click(1)
  click(2)
  expect(fn).toHaveBeenCalledTimes(3)
  expect(argumentHistory(fn)).toMatchInlineSnapshot(`
    Array [
      Array [
        undefined,
      ],
      Array [
        1,
      ],
      Array [
        2,
      ],
    ]
  `)
})

test('event.thru(fn)', () => {
  const click = createEvent()
  const postclick = click.thru(event => event)
  expect(postclick).toBe(click)
})

test('watch validation', () => {
  const trigger = createEvent()
  expect(() => {
    //@ts-expect-error
    trigger.watch(NaN)
  }).toThrowErrorMatchingInlineSnapshot(
    `".watch argument should be a function"`,
  )
})

describe('call of derived events', () => {
  let warn: jest.SpyInstance<void, [message?: any, ...optionalParams: any[]]>
  beforeEach(() => {
    warn = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    warn.mockRestore()
  })

  test('usage with .map is deprecated', () => {
    const a = createEvent()
    const b = a.map(() => {})
    b()
    expect(warn.mock.calls.map(([msg]) => msg)[0]).toMatchInlineSnapshot(
      `"call of derived event is deprecated, use createEvent instead"`,
    )
  })
  test('usage with .filterMap is deprecated', () => {
    const a = createEvent()
    const b = a.filterMap(() => {})
    b()
    expect(warn.mock.calls.map(([msg]) => msg)[0]).toMatchInlineSnapshot(
      `"call of derived event is deprecated, use createEvent instead"`,
    )
  })
  test('usage with .filter is deprecated', () => {
    const a = createEvent()
    const b = a.filter({fn: () => false})
    b()
    expect(warn.mock.calls.map(([msg]) => msg)[0]).toMatchInlineSnapshot(
      `"call of derived event is deprecated, use createEvent instead"`,
    )
  })
})
