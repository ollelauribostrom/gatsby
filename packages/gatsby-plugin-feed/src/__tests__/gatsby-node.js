const fs = require(`fs`)
const path = require(`path`)
const mkdirp = require(`mkdirp`)
const { onPostBuild } = require(`../gatsby-node`)
const internals = require(`../internals`)
const {
  createDefaultQueryResult,
  createCustomQueryResult,
  createCustomQuery,
  createCustomSerializer,
} = require(`./fixtures`)

jest.mock(`fs`)
jest.mock(`mkdirp`)

describe(`Test plugin feed`, async () => {
  beforeAll(() => {
    const DATE_TO_USE = new Date(`2018`)
    const _Date = Date
    global.Date = jest.fn(() => DATE_TO_USE)
    global.Date.UTC = _Date.UTC
    global.Date.now = _Date.now
    fs.existsSync = jest.fn()
    fs.existsSync.mockReturnValue(true)
  })

  it(`default settings work properly`, async () => {
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()
    const queryResult = createDefaultQueryResult()
    graphql.mockResolvedValue(queryResult)
    await onPostBuild({ graphql }, {})
    const [filePath, contents] = internals.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss.xml`))
    expect(contents).toMatchSnapshot()
    expect(graphql.mock.calls[0]).toMatchSnapshot()
  })

  it(`custom query runs`, async () => {
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    const graphql = jest.fn()
    const queryResult = createCustomQueryResult()
    graphql.mockResolvedValue(queryResult)
    const customQuery = createCustomQuery()
    const options = {
      feeds: [
        {
          output: `rss_new.xml`,
          serialize: createCustomSerializer(),
          query: customQuery,
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    const [filePath, contents] = internals.writeFile.mock.calls[0]
    expect(filePath).toEqual(path.join(`public`, `rss_new.xml`))
    expect(contents).toMatchSnapshot()
    expect(graphql).toBeCalledWith(customQuery)
  })

  it(`handles multiple feeds`, async () => {
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    let call = 0
    const graphql = jest.fn(() => {
      call += 1
      if (call <= 2) {
        return Promise.resolve(createDefaultQueryResult())
      } else {
        return Promise.resolve(createCustomQueryResult())
      }
    })
    const options = {
      feeds: [
        {
          output: `rss_a.xml`,
          query: internals.defaultOptions.query,
        },
        {
          output: `rss_b.xml`,
          query: createCustomQuery(),
          serialize: createCustomSerializer(),
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    const [filePathA, contentsA] = internals.writeFile.mock.calls[0]
    const [filePathB, contentsB] = internals.writeFile.mock.calls[1]
    expect(filePathA).toEqual(path.join(`public`, `rss_a.xml`))
    expect(filePathB).toEqual(path.join(`public`, `rss_b.xml`))
    expect(contentsA).toMatchSnapshot()
    expect(contentsB).toMatchSnapshot()
  })

  it(`creates the output directory if it doesn't exist`, async () => {
    mkdirp.sync = jest.fn()
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    fs.existsSync.mockReturnValue(false)
    const graphql = jest.fn()
    const queryResult = createDefaultQueryResult()
    graphql.mockResolvedValue(queryResult)
    const options = {
      feeds: [
        {
          output: path.join(`some-path`, `rss.xml`),
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    expect(mkdirp.sync).toHaveBeenCalledWith(path.join(`public`, `some-path`))
  })

  it(`does not attempt to create the output directory if it exists`, async () => {
    mkdirp.sync = jest.fn()
    internals.writeFile = jest.fn()
    internals.writeFile.mockResolvedValue(true)
    fs.existsSync.mockReturnValue(true)
    const graphql = jest.fn()
    const queryResult = createDefaultQueryResult()
    graphql.mockResolvedValue(queryResult)
    const options = {
      feeds: [
        {
          output: path.join(`some-path`, `rss.xml`),
        },
      ],
    }
    await onPostBuild({ graphql }, options)
    expect(mkdirp.sync).not.toHaveBeenCalled()
  })
})
